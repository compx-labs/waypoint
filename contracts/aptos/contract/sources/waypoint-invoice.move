module waypoint::invoice_stream_fa {
    use std::signer;
    use aptos_framework::timestamp;
    use aptos_framework::object::{
        Self as Obj,
        Object,
        ObjectCore,
        ConstructorRef,
        ExtendRef
    };
    use aptos_framework::fungible_asset::{
        Self as FA,
        Metadata,
        FungibleStore,
        FungibleAsset
    };
    use aptos_framework::primary_fungible_store;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::dispatchable_fungible_asset;
    use aptos_framework::event;

    /// Errors
    const E_NOT_ADMIN: u64 = 1;
    const E_BAD_TIME: u64 = 2;
    const E_BAD_AMOUNT: u64 = 3;
    const E_NOTHING_CLAIMABLE: u64 = 4;
    const E_NOT_BENEFICIARY: u64 = 5;
    const E_NOT_PAYER: u64 = 6;
    const E_ALREADY_FUNDED: u64 = 7;
    const E_NOT_FUNDED: u64 = 8;

    const PLATFORM_FEE_BPS: u64 = 5;
    const FEE_BPS_DENOMINATOR: u64 = 1_000;

    /// Global config (optional)
    struct Config has key {
        admin: address,
        treasury: address
    }

    /// One stream/route = one object with an escrow store
    struct Route has key {
        // escrow for this route (secondary store owned by 'route_obj')
        store: Object<FungibleStore>,
        // which FA we stream
        fa: Object<Metadata>,
        beneficiary: address,
        payer: address,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64,
        requested_amount: u128, // gross invoice amount (before fees)
        fee_amount: u128, // platform fee carved out of the funding
        deposit_amount: u128, // amount reserved for streaming (net of fees)
        claimed_amount: u128, // amount already claimed
        funded: bool,
        // ability to mint signer for route_obj to operate the store
        extend_ref: ExtendRef
    }

    #[event]
    struct InvoiceCreated has drop, store {
        route_addr: address,
        beneficiary: address,
        payer: address,
        requested_amount: u128,
        net_amount: u128,
        fee_amount: u128,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64
    }

    #[event]
    struct InvoiceFunded has drop, store {
        route_addr: address,
        payer: address,
        requested_amount: u128,
        net_amount: u128,
        fee_amount: u128
    }

    #[event]
    struct RouteClaimed has drop, store {
        route_addr: address,
        beneficiary: address,
        claim_amount: u64,
        claimed_total: u128
    }

    fun compute_platform_fee(amount: u128): u128 {
        (amount * (PLATFORM_FEE_BPS as u128)) / (FEE_BPS_DENOMINATOR as u128)
    }

    /// Registry: route_id -> route object address
    /// (You can also use event logs. Kept minimal here.)
    struct Routes has key {
        // simple map via table would be fine; we’ll keep a vector for brevity
        addrs: vector<address>
    }

    /// Init once
    entry fun init_module(admin: &signer) {
        move_to(
            admin,
            Config {
                admin: signer::address_of(admin),
                treasury: signer::address_of(admin)
            }
        );
        move_to(
            admin,
            Routes {
                addrs: vector::empty<address>()
            }
        );
    }

    public entry fun set_treasury(admin: &signer, new_treasury: address) acquires Config {
        let cfg = borrow_global_mut<Config>(@waypoint);
        assert!(signer::address_of(admin) == cfg.admin, E_NOT_ADMIN);
        cfg.treasury = new_treasury;
    }

    /// Beneficiary-defined invoice creation.
    /// - `amount` is the gross invoice total (before platform fees).
    /// This sets up the route metadata and escrow object but does not fund it.
    public entry fun create_invoice(
        beneficiary: &signer,
        fa: Object<Metadata>,
        amount: u64,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64,
        payer: address
    ) acquires Routes, Config {
        assert!(period_secs > 0, E_BAD_TIME);
        assert!(max_periods > 0, E_BAD_TIME);
        assert!(payout_amount > 0, E_BAD_AMOUNT);
        assert!(amount > 0, E_BAD_AMOUNT);

        let schedule_total = (payout_amount as u128) * (max_periods as u128);
        let gross_amount = (amount as u128);
        let fee_amount = compute_platform_fee(gross_amount);
        assert!(gross_amount > fee_amount, E_BAD_AMOUNT);
        let deposit_amount = gross_amount - fee_amount;
        assert!(deposit_amount > 0, E_BAD_AMOUNT);
        assert!(deposit_amount <= schedule_total, E_BAD_AMOUNT);

        let treasury_addr = borrow_global<Config>(@waypoint).treasury;
        primary_fungible_store::ensure_primary_store_exists(treasury_addr, fa);

        let beneficiary_addr = signer::address_of(beneficiary);
        let ctor: &ConstructorRef = &Obj::create_sticky_object(beneficiary_addr);
        let route_signer = &Obj::generate_signer(ctor);
        let extend_ref = Obj::generate_extend_ref(ctor);
        let store: Object<FungibleStore> = FA::create_store(ctor, fa);

        let requested_amount = gross_amount;

        let route = Route {
            store,
            fa,
            beneficiary: beneficiary_addr,
            payer,
            start_ts,
            period_secs,
            payout_amount,
            max_periods,
            requested_amount,
            fee_amount: 0u128,
            deposit_amount: 0u128,
            claimed_amount: 0u128,
            funded: false,
            extend_ref
        };
        move_to(route_signer, route);

        let routes = borrow_global_mut<Routes>(@waypoint);
        let route_obj: Object<ObjectCore> = Obj::object_from_constructor_ref(ctor);
        let route_addr = Obj::object_address(&route_obj);
        routes.addrs.push_back(route_addr);

        event::emit(
            InvoiceCreated {
                route_addr,
                beneficiary: beneficiary_addr,
                payer,
                requested_amount,
                net_amount: deposit_amount,
                fee_amount,
                start_ts,
                period_secs,
                payout_amount,
                max_periods
            }
        );
    }

    /// Create a linear route and fund it in one call.
    /// - fa: the FA metadata object of the asset being streamed
    /// - amount: gross invoice amount (in smallest units) before fees
    /// - start_ts: when the payout schedule begins
    /// - period_secs: cadence between allowed payouts
    /// - payout_amount: target amount per period (final payout may be smaller)
    /// - max_periods: number of scheduled periods
    /// - beneficiary: who will be able to claim
    public entry fun create_route_and_fund(
        creator: &signer,
        fa: Object<Metadata>,
        amount: u64,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64,
        beneficiary: address
    ) acquires Routes, Config {
        assert!(period_secs > 0, E_BAD_TIME);
        assert!(max_periods > 0, E_BAD_TIME);
        assert!(payout_amount > 0, E_BAD_AMOUNT);
        assert!(amount > 0, E_BAD_AMOUNT);

        let schedule_total = (payout_amount as u128) * (max_periods as u128);
        let gross_amount = (amount as u128);
        let fee_amount_u128 = compute_platform_fee(gross_amount);
        assert!(gross_amount > fee_amount_u128, E_BAD_AMOUNT);
        let net_amount_u128 = gross_amount - fee_amount_u128;
        assert!(net_amount_u128 > 0, E_BAD_AMOUNT);
        assert!(net_amount_u128 <= schedule_total, E_BAD_AMOUNT);

        let treasury_addr = borrow_global<Config>(@waypoint).treasury;
        let creator_addr = signer::address_of(creator);
        primary_fungible_store::ensure_primary_store_exists(treasury_addr, fa);

        // 1) Create a sticky object for the Route (it will own the escrow store)
        let ctor: &ConstructorRef =
            &Obj::create_sticky_object(creator_addr);
        let route_signer = &Obj::generate_signer(ctor); // signer for the new object
        let extend_ref = Obj::generate_extend_ref(ctor); // lets us create signers later

        // 2) Create a SECONDARY store owned by the route object (escrow)
        let store: Object<FungibleStore> = FA::create_store(ctor, fa);

        // 3) Move funds from the payer’s PRIMARY store into the route’s store
        // withdraw from creator primary store (this returns a FungibleAsset "coin")
        let net_amount_u64 = net_amount_u128 as u64;
        assert!((net_amount_u64 as u128) == net_amount_u128, E_BAD_AMOUNT);
        let fee_amount_u64 = fee_amount_u128 as u64;
        assert!((fee_amount_u64 as u128) == fee_amount_u128, E_BAD_AMOUNT);

        let fa_chunk: FungibleAsset = primary_fungible_store::withdraw(
            creator, fa, net_amount_u64
        );
        // deposit into route-owned secondary store
        dispatchable_fungible_asset::deposit(store, fa_chunk);

        let fee_chunk: FungibleAsset =
            primary_fungible_store::withdraw(creator, fa, fee_amount_u64);
        primary_fungible_store::deposit(treasury_addr, fee_chunk);

        let requested_amount = gross_amount;
        let payer_addr = signer::address_of(creator);

        // 4) Materialize the Route resource under the route object’s address
        let route = Route {
            store,
            fa,
            beneficiary,
            payer: payer_addr,
            start_ts,
            period_secs,
            payout_amount,
            max_periods,
            requested_amount,
            fee_amount: fee_amount_u128,
            deposit_amount: net_amount_u128,
            claimed_amount: 0u128,
            funded: true,
            extend_ref
        };
        move_to(route_signer, route);

        let routes = borrow_global_mut<Routes>(@waypoint);
        let route_obj: Object<ObjectCore> = Obj::object_from_constructor_ref(ctor);
        let route_addr = Obj::object_address(&route_obj);
        routes.addrs.push_back(route_addr);

        event::emit(
            InvoiceCreated {
                route_addr,
                beneficiary,
                payer: payer_addr,
                requested_amount,
                net_amount: net_amount_u128,
                fee_amount: fee_amount_u128,
                start_ts,
                period_secs,
                payout_amount,
                max_periods
            }
        );

        event::emit(
            InvoiceFunded {
                route_addr,
                payer: payer_addr,
                requested_amount,
                net_amount: net_amount_u128,
                fee_amount: fee_amount_u128
            }
        );
    }

    /// Allows the designated payer to provide funds after an invoice was created.
    public entry fun fund_invoice(
        payer: &signer,
        route_obj: Object<ObjectCore>
    ) acquires Route, Config {
        let route_addr = Obj::object_address(&route_obj);
        let route = borrow_global_mut<Route>(route_addr);
        let payer_addr = signer::address_of(payer);
        assert!(payer_addr == route.payer, E_NOT_PAYER);
        assert!(!route.funded, E_ALREADY_FUNDED);

        let gross_amount = route.requested_amount;
        let fee_amount_u128 = compute_platform_fee(gross_amount);
        assert!(gross_amount > fee_amount_u128, E_BAD_AMOUNT);
        let net_amount_u128 = gross_amount - fee_amount_u128;
        assert!(net_amount_u128 > 0, E_BAD_AMOUNT);

        let net_amount_u64 = net_amount_u128 as u64;
        assert!((net_amount_u64 as u128) == net_amount_u128, E_BAD_AMOUNT);
        let fee_amount_u64 = fee_amount_u128 as u64;
        assert!((fee_amount_u64 as u128) == fee_amount_u128, E_BAD_AMOUNT);

        let treasury_addr = borrow_global<Config>(@waypoint).treasury;
        primary_fungible_store::ensure_primary_store_exists(treasury_addr, route.fa);

        let net_chunk =
            primary_fungible_store::withdraw(payer, route.fa, net_amount_u64);
        dispatchable_fungible_asset::deposit(route.store, net_chunk);

        let fee_chunk =
            primary_fungible_store::withdraw(payer, route.fa, fee_amount_u64);
        primary_fungible_store::deposit(treasury_addr, fee_chunk);

        route.deposit_amount = net_amount_u128;
        route.fee_amount = fee_amount_u128;
        route.funded = true;

        event::emit(
            InvoiceFunded {
                route_addr,
                payer: payer_addr,
                requested_amount: route.requested_amount,
                net_amount: route.deposit_amount,
                fee_amount: route.fee_amount
            }
        );
    }

    #[view]
    public fun list_routes(): vector<address> acquires Routes {
        borrow_global<Routes>(@waypoint).addrs
    }

    /// Claim vested FA to the caller’s account (must be beneficiary).
    /// `route_obj` is the object address (the route’s address you saved/indexed).
    public entry fun claim(caller: &signer, route_obj: Object<ObjectCore>) acquires Route {
        let caller_addr = signer::address_of(caller);
        let r_addr = Obj::object_address(&route_obj);
        let route = borrow_global_mut<Route>(r_addr);

        assert!(caller_addr == route.beneficiary, E_NOT_BENEFICIARY);
        assert!(route.funded, E_NOT_FUNDED);

        let now = timestamp::now_seconds(); // unix seconds
        let (claimable_u128, claimable_u64) = compute_claimable(route, now);
        assert!(claimable_u64 > 0, E_NOTHING_CLAIMABLE);

        // We need a signer for the route object in order to operate its store if required.
        let route_signer = &Obj::generate_signer_for_extending(&route.extend_ref);

        // Withdraw from the ROUTE’s escrow store…
        let payout: FungibleAsset =
            dispatchable_fungible_asset::withdraw(
                route_signer, route.store, claimable_u64
            );

        primary_fungible_store::deposit_with_signer(caller, payout);
        route.claimed_amount += claimable_u128;
        let claimed_total = route.claimed_amount;

        event::emit(
            RouteClaimed {
                route_addr: r_addr,
                beneficiary: caller_addr,
                claim_amount: claimable_u64,
                claimed_total
            }
        );

    }

    // ---------- Internal math ----------

    fun vested_by_schedule(route: &Route, now: u64): u128 {
        if (now <= route.start_ts) {
            return 0;
        };

        let elapsed = now - route.start_ts;
        let periods_elapsed = elapsed / route.period_secs;
        let capped_periods =
            if (periods_elapsed > route.max_periods) {
                route.max_periods
            } else {
                periods_elapsed
            };

        let payout_u128 = (route.payout_amount as u128);
        let vested_candidate = payout_u128 * (capped_periods as u128);
        if (vested_candidate > route.deposit_amount) {
            route.deposit_amount
        } else {
            vested_candidate
        }
    }

    /// Returns (claimable_u128, claimable_u64) capped to u64::max_value()
    fun compute_claimable(route: &Route, now: u64): (u128, u64) {
        let vested = vested_by_schedule(route, now);
        let already = route.claimed_amount;
        let claimable_u128 = if (vested > already) {
            vested - already
        } else { 0 };
        let claim_u64 = claimable_u128 as u64;
        (claimable_u128, claim_u64)
    }

    // ---------- Optional views ----------

    #[view]
    public fun get_route_core(
        route_obj: Object<ObjectCore>
    ): (
        address,
        address,
        address,
        u64,
        u64,
        u64,
        u64,
        u128,
        u128,
        u128,
        u128,
        bool
    ) acquires Route {
        let addr = Obj::object_address(&route_obj);
        let r = borrow_global<Route>(addr);
        (
            addr,
            r.payer,
            r.beneficiary,
            r.start_ts,
            r.period_secs,
            r.payout_amount,
            r.max_periods,
            r.deposit_amount,
            r.claimed_amount,
            r.requested_amount,
            r.fee_amount,
            r.funded
        )
    }

    fun create_and_fund_invoice_for_test(
        beneficiary: &signer,
        payer: &signer,
        fa: Object<Metadata>,
        amount: u64,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64
    ): Object<ObjectCore> acquires Routes, Route, Config {
        create_invoice(
            beneficiary,
            fa,
            amount,
            start_ts,
            period_secs,
            payout_amount,
            max_periods,
            signer::address_of(payer)
        );
        let routes = list_routes();
        let route_addr = routes[routes.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );
        fund_invoice(payer, route_obj);
        route_obj
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_linear_claim_half_then_full(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        // Init module + timestamp
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        // --- Create FA + mint to sender (same pattern as before) ---
        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        // --- Create invoice route: 1000 over two payout periods of 500 ---
        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            1_000,
            2,
            5,
            500,
            2
        );
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        // Treasury equals payer in this test, so only the net deposit leaves the account (1005 - 995 = 10).
        assert!(base_balance == 10, 199);

        // Advance time beyond first period (start=2, period=5 -> first claim at >=7)
        timestamp::update_global_time_for_test(7_000_000);

        // Claim vested portion
        claim(sender, route_obj);
        let bal_after_half = primary_fungible_store::balance(sender_addr, fa);
        // Should release the first 500 chunk
        assert!(bal_after_half - base_balance == 500, 200);

        // Advance time past the second period to unlock the remainder
        timestamp::update_global_time_for_test(12_000_000);

        // Claim remainder
        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        // Total streamed equals the net deposit of 995 (500 + 495 remainder)
        assert!(bal_final - base_balance == 995, 201);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_multiple_partial_claims(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        // Init storage + start the test clock
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000); // 1s

        // --- Create a test FA and mint to sender ---
        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0, // decimals
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        // --- Create the route: 1000 with 3 periods of 350 (last period pays remainder) ---
        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            1_000,
            0,
            3,
            350,
            3
        );

        // Balance right after funding equals the fee returned to the payer (treasury == payer in tests)
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 10, 300);

        // --- First partial claim at t=3s: expect +350 ---
        timestamp::update_global_time_for_test(3_000_000);
        claim(sender, route_obj);
        let bal_after_t3 = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_t3 - base_balance == 350, 301);

        // --- Second partial claim at t=6s: expect +350 (total 700) ---
        timestamp::update_global_time_for_test(6_000_000);
        claim(sender, route_obj);
        let bal_after_t6 = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_t6 - base_balance == 700, 302);

        // --- Final claim at t=9s: expect +295 remainder (total 995) ---
        timestamp::update_global_time_for_test(9_000_000);
        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_final - base_balance == 995, 303);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_final_claim_remainder(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        let route_amount: u64 = 1_000;
        let period_secs: u64 = 3;
        let payout_amount: u64 = 400; // not a clean divisor of amount
        let max_periods: u64 = 3; // schedule total 1_200 > deposit

        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            route_amount,
            0,
            period_secs,
            payout_amount,
            max_periods
        );
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 10, 398);

        timestamp::update_global_time_for_test(3_000_000);
        claim(sender, route_obj);
        let bal_after_first = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_first - base_balance == 400, 400);

        timestamp::update_global_time_for_test(6_000_000);
        claim(sender, route_obj);
        let bal_after_second = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_second - base_balance == 800, 401);

        timestamp::update_global_time_for_test(9_000_000);
        let now = timestamp::now_seconds();
        {
            let addr = aptos_framework::object::object_address(&route_obj);
            let route_ref = borrow_global<Route>(addr);
            let (_, claimable_u64) = compute_claimable(route_ref, now);
            assert!(claimable_u64 == 195, 402);
        };

        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_final - base_balance == 995, 403);

        {
            let addr = aptos_framework::object::object_address(&route_obj);
            let route_ref = borrow_global<Route>(addr);
            assert!(route_ref.claimed_amount == route_ref.deposit_amount, 404);
            let (claimable_u128_after, claimable_u64_after) =
                compute_claimable(route_ref, now);
            assert!(claimable_u128_after == 0, 405);
            assert!(claimable_u64_after == 0, 406);
        }
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOTHING_CLAIMABLE)]
    fun test_claim_after_schedule_complete_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            1_000,
            0,
            3,
            400,
            3
        );
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 10, 500);

        // First period payout
        timestamp::update_global_time_for_test(3_000_000);
        claim(sender, route_obj);
        let bal_after_first = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_first - base_balance == 400, 501);

        // Second period payout
        timestamp::update_global_time_for_test(6_000_000);
        claim(sender, route_obj);
        let bal_after_second = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_second - base_balance == 800, 502);

        // Final remainder payout
        timestamp::update_global_time_for_test(9_000_000);
        claim(sender, route_obj);
        let bal_after_final = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_final - base_balance == 995, 503);

        // Advance time beyond the scheduled periods; additional claims should abort.
        timestamp::update_global_time_for_test(12_000_000);
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOTHING_CLAIMABLE)]
    fun test_claim_before_start_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        let start_ts: u64 = 10;
        let period_secs: u64 = 5;
        let payout_amount: u64 = 400;
        let max_periods: u64 = 3;

        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            1_000,
            start_ts,
            period_secs,
            payout_amount,
            max_periods
        );

        // Current time (1s) is before start_ts (10s); claim should abort.
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOT_BENEFICIARY)]
    fun test_non_beneficiary_claim_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let payer_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);

        let beneficiary_signer = account::create_account_for_test(@0xbeef);

        primary_fungible_store::mint(&mint_ref, payer_addr, 1_005);

        let route_obj = create_and_fund_invoice_for_test(
            &beneficiary_signer,
            sender,
            fa,
            1_000,
            0,
            3,
            400,
            3
        );

        timestamp::update_global_time_for_test(3_000_000);
        // Attempt claim as payer (not the beneficiary); should abort.
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_BAD_AMOUNT)]
    fun test_create_route_rejects_excess_schedule_total(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        // Deposit exceeds schedule_total (2 periods * 400 = 800 < 1_000) so creation must abort.
        create_invoice(sender, fa, 1_000, 0, 3, 400, 2, sender_addr);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOT_FUNDED)]
    fun test_claim_before_funding_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);

        let payer = account::create_account_for_test(@0xcafe);
        let payer_addr = signer::address_of(&payer);
        primary_fungible_store::mint(&mint_ref, payer_addr, 1_005);
        let beneficiary = account::create_account_for_test(@0xbeef);

        create_invoice(
            &beneficiary,
            fa,
            1_000,
            0,
            3,
            400,
            3,
            payer_addr
        );

        let routes = list_routes();
        let route_addr = routes[routes.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        claim(&beneficiary, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOT_PAYER)]
    fun test_fund_invoice_wrong_payer_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);

        let intended_payer = account::create_account_for_test(@0xcafe);
        let wrong_payer = account::create_account_for_test(@0xface);
        let beneficiary = account::create_account_for_test(@0xbeef);
        let intended_addr = signer::address_of(&intended_payer);
        let wrong_addr = signer::address_of(&wrong_payer);

        primary_fungible_store::mint(&mint_ref, intended_addr, 1_005);
        primary_fungible_store::mint(&mint_ref, wrong_addr, 1_005);

        create_invoice(
            &beneficiary,
            fa,
            1_000,
            0,
            3,
            400,
            3,
            intended_addr
        );

        let routes = list_routes();
        let route_addr = routes[routes.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        fund_invoice(&wrong_payer, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_ALREADY_FUNDED)]
    fun test_fund_invoice_twice_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);

        let payer = account::create_account_for_test(@0xcafe);
        let beneficiary = account::create_account_for_test(@0xbeef);
        let payer_addr = signer::address_of(&payer);
        primary_fungible_store::mint(&mint_ref, payer_addr, 1_005);

        let route_obj = create_and_fund_invoice_for_test(
            &beneficiary,
            &payer,
            fa,
            1_000,
            0,
            3,
            400,
            3
        );

        fund_invoice(&payer, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_get_route_core_reflects_funding_state(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);

        let payer = account::create_account_for_test(@0xcafe);
        let beneficiary = account::create_account_for_test(@0xbeef);
        let payer_addr = signer::address_of(&payer);
        primary_fungible_store::mint(&mint_ref, payer_addr, 1_005);

        create_invoice(
            &beneficiary,
            fa,
            1_000,
            0,
            3,
            400,
            3,
            payer_addr
        );
        let routes = list_routes();
        let route_addr = routes[routes.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        let (_, stored_payer, stored_beneficiary, _, _, _, _, deposit, claimed, requested, fee, funded) =
            get_route_core(route_obj);
        assert!(stored_payer == payer_addr, 900);
        assert!(stored_beneficiary == signer::address_of(&beneficiary), 901);
        assert!(deposit == 0u128, 902);
        assert!(claimed == 0u128, 903);
        assert!(requested == 1_000u128, 904);
        assert!(fee == 0u128, 905);
        assert!(!funded, 906);

        fund_invoice(&payer, route_obj);

        let (_, _, _, _, _, _, _, _, _, _, _, funded_after) = get_route_core(route_obj);
        assert!(funded_after, 907);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_create_route_and_fund_happy_path(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        // Gross 1_000, fee 5, net 995; schedule fits 2 * 500.
        create_route_and_fund(
            sender,
            fa,
            1_000,
            0,
            3,
            500,
            2,
            sender_addr
        );

        let routes = list_routes();
        let route_addr = routes[routes.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        let (_, payer, beneficiary, _, _, payout, max_periods, deposit, claimed, requested, fee, funded) =
            get_route_core(route_obj);
        assert!(payer == sender_addr, 1000);
        assert!(beneficiary == sender_addr, 1001);
        assert!(payout == 500, 1002);
        assert!(max_periods == 2, 1003);
        assert!(deposit == 995, 1004);
        assert!(claimed == 0, 1005);
        assert!(requested == 1_000, 1006);
        assert!(fee == 5, 1007);
        assert!(funded, 1008);

        // Claim first period after time has advanced.
        timestamp::update_global_time_for_test(4_000_000);
        claim(sender, route_obj);
        let bal_after_first = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_first == 510, 1009); // 10 residual + 500 payout
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_BAD_AMOUNT)]
    fun test_create_route_and_fund_rejects_excess_schedule_total(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        // Net 995 exceeds schedule total 2 * 400 = 800; should abort.
        create_route_and_fund(
            sender,
            fa,
            1_000,
            0,
            3,
            400,
            2,
            sender_addr
        );
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_set_treasury_only_admin(
        aptos_framework: &signer, sender: &signer
    ) acquires Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let new_treasury = @0xbeef;
        set_treasury(sender, new_treasury);
        let cfg = borrow_global<Config>(@waypoint);
        assert!(cfg.treasury == new_treasury, 1100);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOT_ADMIN)]
    fun test_set_treasury_non_admin_fails(
        aptos_framework: &signer, sender: &signer
    ) acquires Config {
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        let outsider = account::create_account_for_test(@0xcafe);
        set_treasury(&outsider, @0xbeef);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOTHING_CLAIMABLE)]
    fun test_mid_period_no_vesting(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1_000_000);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_005);

        let route_obj = create_and_fund_invoice_for_test(
            sender,
            sender,
            fa,
            1_000,
            0,
            10,
            500,
            2
        );

        // Half a period elapsed; nothing should be claimable yet.
        timestamp::update_global_time_for_test(5_000_000);
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_list_routes_tracks_creations(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route, Config {
        let sender_addr = signer::address_of(sender);
        init_module(sender);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let ctor = &aptos_framework::object::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            std::option::none<u128>(),
            std::string::utf8(b"Waypoint Token"),
            std::string::utf8(b"WPT"),
            0,
            std::string::utf8(b""),
            std::string::utf8(b"")
        );
        let fa = aptos_framework::object::object_from_constructor_ref(ctor);
        let mint_ref = aptos_framework::fungible_asset::generate_mint_ref(ctor);
        primary_fungible_store::mint(&mint_ref, sender_addr, 5_000);

        let before = list_routes();
        assert!(before.length() == 0, 1200);

        create_invoice(sender, fa, 1_000, 0, 3, 400, 3, sender_addr);
        let after_first = list_routes();
        assert!(after_first.length() == 1, 1201);

        create_invoice(sender, fa, 500, 0, 2, 250, 2, sender_addr);
        let after_second = list_routes();
        assert!(after_second.length() == 2, 1202);
        let last = after_second[after_second.length() - 1];
        let prev = after_second[after_second.length() - 2];
        assert!(last != prev, 1203);
    }
}
