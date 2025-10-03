module waypoint::linear_stream_fa {
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
    use aptos_framework::dispatchable_fungible_asset;


    /// Errors
    const E_NOT_ADMIN: u64 = 1;
    const E_BAD_TIME: u64 = 2;
    const E_BAD_AMOUNT: u64 = 3;
    const E_NOT_DEPOSITOR: u64 = 4;
    const E_NOTHING_CLAIMABLE: u64 = 5;
    const E_NOT_BENEFICIARY: u64 = 6;

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
        depositor: address,
        beneficiary: address,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64,
        deposit_amount: u128, // total intended to stream
        claimed_amount: u128, // amount already claimed
        // ability to mint signer for route_obj to operate the store
        extend_ref: ExtendRef
    }

    /// Registry: route_id -> route object address
    /// (You can also use event logs. Kept minimal here.)
    struct Routes has key {
        // simple map via table would be fine; we’ll keep a vector for brevity
        addrs: vector<address>
    }

    /// Init once
    entry fun init_module(admin: &signer) {
        move_to(admin, Config {
            admin: signer::address_of(admin),
            treasury: signer::address_of(admin)
        });
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

    /// Create a linear route and fund it in one call.
    /// - fa: the FA metadata object of the asset being streamed
    /// - amount: smallest unit of the FA
    /// - start_ts: when the payout schedule begins
    /// - period_secs: cadence between allowed payouts
    /// - payout_amount: target amount per period (final payout may be smaller)
    /// - max_periods: number of scheduled periods
    /// - fee_amount: upfront fee routed to the treasury (must equal 0.5% of `amount`)
    /// - beneficiary: who will be able to claim
    public entry fun create_route_and_fund(
        creator: &signer,
        fa: Object<Metadata>,
        amount: u64,
        start_ts: u64,
        period_secs: u64,
        payout_amount: u64,
        max_periods: u64,
        fee_amount: u64,
        beneficiary: address
    ) acquires Routes, Config {
        assert!(period_secs > 0, E_BAD_TIME);
        assert!(max_periods > 0, E_BAD_TIME);
        assert!(payout_amount > 0, E_BAD_AMOUNT);
        assert!(amount > 0, E_BAD_AMOUNT);
        assert!(fee_amount > 0, E_BAD_AMOUNT);

        let schedule_total = (payout_amount as u128) * (max_periods as u128);
        assert!((amount as u128) <= schedule_total, E_BAD_AMOUNT);

        let expected_fee = ((amount as u128) * 5) / 1_000;
        assert!((fee_amount as u128) == expected_fee, E_BAD_AMOUNT);

        let treasury_addr = borrow_global<Config>(@waypoint).treasury;
        primary_fungible_store::ensure_primary_store_exists(treasury_addr, fa);

        // 1) Create a sticky object for the Route (it will own the escrow store)
        let ctor: &ConstructorRef =
            &Obj::create_sticky_object(signer::address_of(creator));
        let route_signer = &Obj::generate_signer(ctor); // signer for the new object
        let extend_ref = Obj::generate_extend_ref(ctor); // lets us create signers later

        // 2) Create a SECONDARY store owned by the route object (escrow)
        let store: Object<FungibleStore> = FA::create_store(ctor, fa);

        // 3) Move funds from the depositor’s PRIMARY store into the route’s store
        // withdraw from creator primary store (this returns a FungibleAsset "coin")
        let fa_chunk: FungibleAsset = primary_fungible_store::withdraw(
            creator, fa, amount
        );
        // deposit into route-owned secondary store
        dispatchable_fungible_asset::deposit(store, fa_chunk);

        let fee_chunk: FungibleAsset = primary_fungible_store::withdraw(
            creator, fa, fee_amount
        );
        primary_fungible_store::deposit(treasury_addr, fee_chunk);

        // 4) Materialize the Route resource under the route object’s address
        let route = Route {
            store,
            fa,
            depositor: signer::address_of(creator),
            beneficiary,
            start_ts,
            period_secs,
            payout_amount,
            max_periods,
            deposit_amount: (amount as u128),
            claimed_amount: 0u128,
            extend_ref
        };
        move_to(route_signer, route);

        let routes = borrow_global_mut<Routes>(@waypoint);
        let route_obj: Object<ObjectCore> = Obj::object_from_constructor_ref(ctor);
        let route_addr = Obj::object_address(&route_obj);
        routes.addrs.push_back(route_addr);

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

    }


    // ---------- Internal math ----------

    fun vested_by_schedule(route: &Route, now: u64): u128 {
        if (now <= route.start_ts) {
            return 0;
        };

        let elapsed = now - route.start_ts;
        let periods_elapsed = elapsed / route.period_secs;
        let capped_periods = if (periods_elapsed > route.max_periods) {
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
    ): (address, address, address, u64, u64, u64, u64, u128, u128) acquires Route {
        let r = borrow_global<Route>(Obj::object_address(&route_obj));
        (
            Obj::object_address(&route_obj),
            r.depositor,
            r.beneficiary,
            r.start_ts,
            r.period_secs,
            r.payout_amount,
            r.max_periods,
            r.deposit_amount,
            r.claimed_amount
        )
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

        // --- Create route: 1000 over two payout periods of 500 ---
        create_route_and_fund(sender, fa, 1_000, 2, 5, 500, 2, 5, sender_addr);
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 5, 199);
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

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
        // Should now be 1000 total (second 500 payout)
        assert!(bal_final - base_balance == 1_000, 201);
    }
    #[test(aptos_framework = @0x1,
sender = @waypoint)]
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
        create_route_and_fund(sender, fa, 1_000, 0, 3, 350, 3, 5, sender_addr);
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        // Balance right after funding equals the fee returned to the depositor (treasury == depositor in tests)
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 5, 300);

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

        // --- Final claim at t=9s: expect +300 remainder (total 1000) ---
        timestamp::update_global_time_for_test(9_000_000);
        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_final - base_balance == 1_000, 303);
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

        create_route_and_fund(
            sender,
            fa,
            route_amount,
            0,
            period_secs,
            payout_amount,
            max_periods,
            5,
            sender_addr
        );
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 5, 398);
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(route_addr);

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
            assert!(claimable_u64 == 200, 402);
        };

        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_final - base_balance == 1_000, 403);

        {
            let addr = aptos_framework::object::object_address(&route_obj);
            let route_ref = borrow_global<Route>(addr);
            assert!(route_ref.claimed_amount == (route_amount as u128), 404);
            let (claimable_u128_after, claimable_u64_after) = compute_claimable(route_ref, now);
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

        create_route_and_fund(sender, fa, 1_000, 0, 3, 400, 3, 5, sender_addr);
        let base_balance = primary_fungible_store::balance(sender_addr, fa);
        assert!(base_balance == 5, 500);
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

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
        assert!(bal_after_final - base_balance == 1_000, 503);

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

        create_route_and_fund(
            sender,
            fa,
            1_000,
            start_ts,
            period_secs,
            payout_amount,
            max_periods,
            5,
            sender_addr
        );

        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj = aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(route_addr);

        // Current time (1s) is before start_ts (10s); claim should abort.
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_NOT_BENEFICIARY)]
    fun test_non_beneficiary_claim_fails(
        aptos_framework: &signer,
        sender: &signer
    ) acquires Routes, Route, Config {
        let depositor_addr = signer::address_of(sender);
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

        let beneficiary_addr = @0xbeef;

        primary_fungible_store::mint(&mint_ref, depositor_addr, 1_005);

        create_route_and_fund(
            sender,
            fa,
            1_000,
            0,
            3,
            400,
            3,
            5,
            beneficiary_addr
        );

        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        timestamp::update_global_time_for_test(3_000_000);
        // Attempt claim as depositor (not the beneficiary); should abort.
        claim(sender, route_obj);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    #[expected_failure(abort_code = E_BAD_AMOUNT)]
    fun test_create_route_rejects_excess_schedule_total(
        aptos_framework: &signer,
        sender: &signer
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
        create_route_and_fund(sender, fa, 1_000, 0, 3, 400, 2, 5, sender_addr);
    }
}
