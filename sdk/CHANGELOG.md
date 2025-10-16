# Changelog

All notable changes to the Waypoint SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-10-16

### Added

- Initial release of Waypoint SDK for Aptos
- Transaction builders for linear streaming routes
  - `buildCreateLinearRouteTransaction()`
  - `buildClaimLinearTransaction()`
- Transaction builders for milestone-based routes
  - `buildCreateMilestoneRouteTransaction()`
  - `buildClaimMilestoneTransaction()`
  - `buildApproveMilestoneTransaction()`
- State reading functions
  - `listLinearRoutes()`
  - `listMilestoneRoutes()`
  - `getLinearRouteDetails()`
  - `getMilestoneRouteDetails()`
  - `getLinearClaimableAmount()`
  - `getMilestoneClaimableAmount()`
  - `getConfig()`
- Network support for both mainnet and testnet
- Optional backend API integration
  - `registerRouteWithBackend()`
  - `getBackendRoutes()`
  - `getBackendRouteById()`
  - `updateBackendRouteStatus()`
- Utility functions
  - `calculateFee()`
  - `isValidAptosAddress()`
  - `calculateClaimableAmount()`
- Full TypeScript support with comprehensive type definitions
- Universal compatibility (Node.js and browser)
- Documentation and examples
  - Comprehensive README
  - Quick start guide
  - Node.js example
  - React example
- Mainnet contract addresses configured

### Technical Details

- Built with TypeScript 5.x
- Requires Node.js >= 22.0.0
- Uses @aptos-labs/ts-sdk ^1.x
- Outputs both ESM and CommonJS formats
- Includes TypeScript declarations
- Zero dependencies beyond Aptos SDK

[0.1.0]: https://github.com/waypoint/sdk/releases/tag/v0.1.0

