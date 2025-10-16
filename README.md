# waypoint
Waypoint - Stablecoin payments, vesting subscriptions and more - Aptos and Algorand

## Technical Overview

### Backend
- **Stack**: Node.js + Express + Sequelize ORM
- **Database**: PostgreSQL (Supabase)
- **API**: REST API with endpoints for tokens, routes, analytics, and address book
- **Security**: Helmet, CORS, rate limiting
- **Models**: Token, Route, RouteType, AddressBook
- **Port**: 5000 (default)

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Wallet Integration**:
  - Algorand: @txnlab/use-wallet-react (Pera, Defy, Lute)
  - Aptos: @aptos-labs/wallet-adapter-react (Petra, Martian, etc.)
- **Blockchain SDKs**: algosdk, @aptos-labs/ts-sdk, @algorandfoundation/algokit-utils

### Smart Contracts

#### Algorand
- **Language**: Python (PuyaPy/AlgoKit)
- **Contracts**:
  - `waypoint-linear`: Linear payment streaming
  - `waypoint-registry`: Contract registry
- **Location**: `contracts/algorand/projects/algorand/smart_contracts/`

#### Aptos
- **Language**: Move
- **Contracts**:
  - `waypoint-linear.move`: Linear payment streaming
  - `waypoint-milestone.move`: Milestone-based payments
- **Location**: `contracts/aptos/contract/sources/`

### Project Structure
```
waypoint/
├── backend/          # Express API + Sequelize ORM
├── frontend/waypoint # React + Vite SPA
├── contracts/
│   ├── algorand/     # PuyaPy smart contracts
│   └── aptos/        # Move smart contracts
└── docs/             # Documentation
```