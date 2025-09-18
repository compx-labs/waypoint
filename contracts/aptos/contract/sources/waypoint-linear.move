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
    use aptos_framework::object;
    use aptos_framework::event;

    /// Errors
    const E_NOT_ADMIN: u64 = 1;
    const E_BAD_TIME: u64 = 2;
    const E_NOT_BENEFICIARY: u64 = 3;
    const E_NOT_DEPOSITOR: u64 = 4;
    const E_NOTHING_CLAIMABLE: u64 = 5;

    /// Global config (optional)
    struct Config has key {
        admin: address
        // future: fee_bps, fee_sink, etc.
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
        end_ts: u64,
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
        move_to(admin, Config { admin: signer::address_of(admin) });
        move_to(
            admin,
            Routes {
                addrs: vector::empty<address>()
            }
        );
    }

    /// Create a linear route and fund it in one call.
    /// - fa: the FA metadata object of the asset being streamed
    /// - amount: smallest unit of the FA
    /// - start_ts < end_ts, linear release
    /// - beneficiary: who will be able to claim
    public entry fun create_route_and_fund(
        creator: &signer,
        fa: Object<Metadata>,
        amount: u64,
        start_ts: u64,
        end_ts: u64,
        beneficiary: address
    ) acquires Routes {
        assert!(end_ts > start_ts, E_BAD_TIME);

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
        FA::deposit(store, fa_chunk);

        // 4) Materialize the Route resource under the route object’s address
        let route = Route {
            store,
            fa,
            depositor: signer::address_of(creator),
            beneficiary,
            start_ts,
            end_ts,
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
        // (Optional: emit Claimed event)
        // (Optional: mark completed if fully claimed and now >= end)
    }

    /// Optional: cancel unvested back to depositor (only depositor)
    public entry fun cancel_unvested(
        caller: &signer, route_obj: Object<ObjectCore>
    ) acquires Route {
        let caller_addr = signer::address_of(caller);
        let r_addr = Obj::object_address(&route_obj);
        let route = borrow_global_mut<Route>(r_addr);
        assert!(caller_addr == route.depositor, E_NOT_DEPOSITOR);

        let now = timestamp::now_seconds();
        let vested = vested_linear(
            route.deposit_amount,
            route.start_ts,
            route.end_ts,
            now
        );
        let unvested =
            if (route.deposit_amount > vested) {
                route.deposit_amount - vested
            } else { 0 };

        if (unvested > 0) {
            let route_signer = &Obj::generate_signer_for_extending(&route.extend_ref);
            let unv: u64 = (unvested as u64); // you can drop the max-guard if you store u64 amounts
            let fa_chunk: FungibleAsset =
                dispatchable_fungible_asset::withdraw(route_signer, route.store, unv);

            // send back to depositor’s primary store (address form is fine here)
            primary_fungible_store::deposit(route.depositor, fa_chunk);
        }
        // (Optional: mark as cancelled; block further claims of vested remainder, or allow)
    }

    // ---------- Internal math ----------

    fun clamp_now(start_ts: u64, end_ts: u64, now: u64): u64 {
        if (now <= start_ts) start_ts
        else if (now >= end_ts) end_ts
        else now
    }

    /// Linear vesting with integer math (rounds down)
    fun vested_linear(total: u128, start_ts: u64, end_ts: u64, now: u64): u128 {
        // assume end_ts > start_ts already checked by caller
        let n = clamp_now(start_ts, end_ts, now) - start_ts;
        let d = end_ts - start_ts;

        let n_u128 = (n as u128);
        let d_u128 = (d as u128);
        (total * n_u128) / d_u128
    }

    /// Returns (claimable_u128, claimable_u64) capped to u64::max_value()
    fun compute_claimable(route: &Route, now: u64): (u128, u64) {
        let vested = vested_linear(
            route.deposit_amount,
            route.start_ts,
            route.end_ts,
            now
        );
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
    ): (address, address, address, u64, u64, u128, u128) acquires Route {
        let r = borrow_global<Route>(Obj::object_address(&route_obj));
        (
            Obj::object_address(&route_obj),
            r.depositor,
            r.beneficiary,
            r.start_ts,
            r.end_ts,
            r.deposit_amount,
            r.claimed_amount
        )
    }

    #[test_only]
    use std::option;
    #[test_only]
    use std::string;
    #[test_only]
    use aptos_framework::fungible_asset;
    #[test_only]
    use aptos_framework::object as obj;

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_cancel_before_start_returns_all(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route {
        // Init module storage
        init_module(sender);

        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test(1);

        // --- Create a fresh FA we can use in the test ---
        let ctor = &obj::create_sticky_object(@waypoint);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            ctor,
            option::none<u128>(), // max_supply
            string::utf8(b"Waypoint Test Token"), // name
            string::utf8(b"WPT"), // symbol
            6, // decimals
            string::utf8(b""), // icon_uri
            string::utf8(b"") // project_uri
        );
        let fa = obj::object_from_constructor_ref(ctor);

        // Mint to sender’s PRIMARY store so we can fund the route
        let mint_ref = fungible_asset::generate_mint_ref(ctor);
        let sender_addr = signer::address_of(sender);
        let seed_amount: u64 = 500_000;
        primary_fungible_store::mint(&mint_ref, sender_addr, seed_amount);

        // --- Create and fund a route with a future start ---
        let start_ts: u64 = 1_000_000; // in the future
        let end_ts: u64 = 1_500_000;
        let fund_amount: u64 = 200_000;

        // balance pre-fund
        let bal_before = primary_fungible_store::balance(sender_addr, fa);

        create_route_and_fund(
            sender,
            fa,
            fund_amount,
            start_ts,
            end_ts,
            sender_addr
        );

        // balance after fund decreased by fund_amount
        let bal_after_fund = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_before == seed_amount, 100);
        assert!(bal_after_fund == seed_amount - fund_amount, 101);

        // Get the last created route address and cancel before start
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        cancel_unvested(sender, obj::address_to_object<ObjectCore>(route_addr));

        // After cancel, depositor should have full seed_amount again
        let bal_after_cancel = primary_fungible_store::balance(sender_addr, fa);
        assert!(bal_after_cancel == seed_amount, 102);
    }

    #[test(aptos_framework = @0x1, sender = @waypoint)]
    fun test_linear_claim_half_then_full(
        aptos_framework: &signer, sender: &signer
    ) acquires Routes, Route {
        // Init module + timestamp
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
        let sender_addr = signer::address_of(sender);
        primary_fungible_store::mint(&mint_ref, sender_addr, 1_000);

        // --- Create route: 1000 over 10 seconds ---
        create_route_and_fund(sender, fa, 1_000, 2, 12, sender_addr);
        let rs = list_routes();
        let route_addr = rs[rs.length() - 1];
        let route_obj =
            aptos_framework::object::address_to_object<aptos_framework::object::ObjectCore>(
                route_addr
            );

        // Advance time to halfway (5)
        timestamp::update_global_time_for_test(7_000_000);

        // Claim vested portion
        claim(sender, route_obj);
        let bal_after_half = primary_fungible_store::balance(sender_addr, fa);
        // Should be ~500 (linear vesting)
        assert!(bal_after_half == 500, 200);

        // Advance time to end
        timestamp::update_global_time_for_test(12_000_000);

        // Claim remainder
        claim(sender, route_obj);
        let bal_final = primary_fungible_store::balance(sender_addr, fa);
        // Should now be 1000 total
        assert!(bal_final == 1000, 201);
    }
}

