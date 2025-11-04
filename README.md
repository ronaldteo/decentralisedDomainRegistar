# NTU Decentralised Domain Registrar

A decentralized domain registration system built on the Ethereum blockchain using a sealed-bid Dutch auction mechanism. Users can register `.ntu` domains through multi-phase auctions with commit and reveal phases.

## Features

- **Sealed-Bid Auction System**: Commit phase followed by reveal phase for transparent bidding 
- **Expired Domain Re-auction**: Re-open auctions for expired domains
- **Real-time Auction Tracking**: Live phase timers and status updates
- **Registry**: View all registered domains
- **Wallet Integration**: Direct Ethereum wallet connection via MetaMask

## Tech Stack

- **React** - UI framework
- **React Router** - Client-side routing
- **Ethers.js v5.7** - Ethereum blockchain interaction
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Solidity** - Smart contracts

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet browser extension
- Sepolia testnet ETH (for testing)

## Installation

### Step 1: Install Dependencies

```bash
npm install react-router-dom ethers@5.7 lucide-react @radix-ui/react-slot
npm install -D tailwindcss@3 postcss autoprefixer tailwindcss-animate class-variance-authority clsx tailwind-merge
npx tailwindcss init -p
```

### Step 2: Configure Smart Contract

Open `src/services/contract.js` and update the `CONTRACT_ADDRESS`:

**Available Contracts for Testing:**

| Contract Address | Commit Phase | Reveal Phase | Domain Expiry | Use Case |
|---|---|---|---|---|
| `0x316b8046a59b325156a52e5fece992003a89b376` | 1 minute | 1 minute | 2 minutes | Quick testing |
| `0x8b189f9b319d591c6d4ac65337f9454b7c580072` | 2 minutes | 2 minutes | 5 minutes | Standard testing |

```javascript
const CONTRACT_ADDRESS = '0x8b189f9b319d591c6d4ac65337f9454b7c580072';
```

### Step 3: Launch Development Server

Go to the ntu-domain-registrar directory.

```bash
npm start
```

Application will open at `http://localhost:3000`

## Quick Start

### 1. Setup Wallet

- Install MetaMask browser extension
- Create or import wallet
- Go to Settings > Networks > Add Network

### 2. Add Sepolia Testnet

- **Network Name**: Sepolia
- **RPC URL**: https://sepolia.infura.io/v3/
- **Chain ID**: 11155111
- **Currency Symbol**: ETH
- **Block Explorer**: https://sepolia.etherscan.io

### 3. Get Test ETH

Visit [Sepolia Faucet](https://sepoliafaucet.com) and claim test ETH

### 4. Connect to App

- Click "Connect Wallet"
- Approve MetaMask connection
- Start bidding!

## How It Works

### Auction Phases

**Commit Phase** (2 minutes default)
- Place sealed bid with secret
- Bid amount hidden from others
- Multiple users can participate

**Reveal Phase** (2 minutes default)
- Reveal actual bid amounts
- Highest bidder determined
- Must match original commitment

**Finalization**
- Winner claims domain
- Domain registered on-chain

### Domain States

| Status | Description |
|---|---|
| Available | Domain open for auction |
| In Commit Phase | Active auction, bidding phase |
| In Reveal Phase | Active auction, reveal phase |
| Pending Finalisation | Waiting for winner to finalize |
| Registered | Domain ownership confirmed |
| Expired | Previously owned domain expired |

## Usage

### Search for a Domain

1. Enter domain name in search box
2. Click "Search"
3. View current status

### Place a Bid

1. Go to domain details
2. Switch to "Commit" tab
3. Enter bid amount (in ETH)
4. Create secret (minimum 8 characters)
5. Click "Commit Bid"
6. Approve MetaMask transaction

### Reveal Your Bid

1. Switch to "Reveal" tab (after commit phase ends)
2. Enter exact bid amount and secret
3. Click "Reveal Bid"
4. Approve transaction

### Win a Domain

1. After reveal phase ends
2. If you're highest bidder
3. Click "Finalize Auction & Register Domain"
4. Approve transaction
5. Domain registered to your address

### View Registry

1. Go to "Registry" page
2. See all registered domains
3. Copy owner addresses
4. View on Etherscan

## Network Details

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

## Resources

- [Ethereum Docs](https://ethereum.org/en/developers/docs/)
- [Ethers.js v5 Docs](https://docs.ethers.io/v5/)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [MetaMask Docs](https://docs.metamask.io/)

## Contributors
- Xu Yiming  
- milkcoy
- Ronald Teo

