# RemitLend Frontend

Next.js web application for the RemitLend platform, providing user interfaces for borrowers and lenders to interact with the decentralized lending protocol.

## Overview

The frontend is a modern React application built with Next.js that enables:

- Wallet connection (Freighter, Albedo, etc.)
- Credit score visualization
- Remittance NFT minting
- Loan request and management
- Lending pool participation
- Real-time transaction tracking

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Custom design system, native CSS variables, class-based dark mode)
- **Wallet Integration**: Freighter Wallet API (`@stellar/freighter-api`) (fully integrated)
- **State Management**: Zustand stores (theme, wallet, user data, UI layout, gamification, and toasts)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Stellar wallet (Freighter recommended)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
# Development
npm run dev          # Start Next.js development server with hot reloading

# Production
npm run build        # Build the application for production
npm start            # Run the compiled production build locally

# Code Quality & Formatting
npm run lint         # Lint source files with ESLint
npm run lint:format  # Check code style with Prettier (without auto-fixing)
npm run format       # Format codebase style automatically using Prettier
npm run typecheck    # Run TypeScript compiler check without emitting files

# Testing & Audits
npm test             # Run unit tests with Jest
npm run test:watch   # Run Jest in watch mode
npm run test:e2e     # Run end-to-end integration tests using Playwright
npm run audit:a11y   # Build application and perform an accessibility (a11y) audit via axe-playwright

# Misc
npm run prepare      # husky (install git hooks)
npm run analyze      # ANALYZE=true next build (bundle analyzer)
```

## Project Structure

```
frontend/
├── src/
│   └── app/                    # Next.js App Router
│       ├── components/         # React components
│       │   └── global_ui/     # Reusable UI components
│       │       └── Spinner.tsx
│       ├── layout.tsx         # Root layout
│       ├── page.tsx           # Home page
│       ├── not-found.tsx      # 404 page
│       ├── globals.css        # Global styles
│       └── favicon.ico
├── public/                     # Static assets
│   ├── og-image.png
│   └── *.svg
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json
└── README.md
```

## Features

### Core Implemented Features

#### Borrower Dashboard

- [x] **Wallet Connection Interface**: Integration with Freighter wallet for secure actions
- [x] **Credit Score Display**: Dynamic visual representation of credit bands and credit scores
- [x] **Remittance NFT Minting**: Minting on-chain credit-backed NFTs representing remittance history
- [x] **Loan Request Form**: Step-by-step interactive wizard to request loans with collateral NFTs
- [x] **Active Loans Management**: Status tracking, detailed progress, and timeline of active loans
- [x] **Repayment Interface**: Intuitive forms for loan repayment and automated progress updates
- [x] **Transaction History**: Real-time listing of past activities and blockchain transactions

#### Lender Dashboard

- [x] **Pool Liquidity Overview**: Detailed metrics on lending pools, deposits, and utilization rate
- [x] **Deposit/Withdraw Interface**: Simple interfaces to supply liquidity to the lending pools or withdraw funds
- [x] **Loan Approval Queue**: Queue of open loan requests for lenders to review and fund
- [x] **Yield Tracking**: Real-time visualization of yield generated and interest earned
- [x] **Portfolio Analytics**: Financial charts (powered by Recharts) showing performance and asset allocation

#### Shared & Global Features

- [x] **Real-Time Transaction Status**: Global feedback on blockchain operations with transaction progress trackers
- [x] **Notification System**: Server-Sent Events (SSE) notification stream updating in-app events immediately
- [x] **Multi-Language Support**: Full internationalization and localization using `next-intl` (English ready)
- [x] **Dark Mode Toggle**: Fluid theme switching between light, dark, and system default appearances
- [x] **Wallet Balance Display**: Dynamic fetching of account balances (XLM and tokens) via Stellar Horizon API
- [x] **Gamification System**: Borrower achievements, dynamic level-ups, and XP rewards (RemitLend Kingdom)

### Future Roadmap (Planned)

- [ ] **Multi-wallet support**: Integration of Stellar Wallet Kit (Albedo, Rabet, xBull support)
- [ ] **Stablecoin support**: Native compatibility for EURC, USDC, and other fiat-pegged stablecoins
- [ ] **Advanced credit scoring**: Off-chain ML-based scoring pipelines using larger payment histories

## Component Library

### Global UI Components

#### Spinner

Loading indicator component.

```tsx
import { Spinner } from "@/app/components/global_ui/Spinner";

<Spinner size="md" />;
```

**Props:**

- `size`: 'sm' | 'md' | 'lg' (default: 'md')

### Key UI Components

- **`Button`**: Reusable action button supporting multiple visual variants (primary, secondary, danger, etc.) and loading states.
- **`Card`**: Structured container for grouping dashboard panels and visual blocks.
- **`Modal`**: Base dialog window component used for multi-step wizards or transaction confirmations.
- **`Input`**: Standard text input field supporting validation feedback, placeholder patterns, and dark mode variants.
- **`ConfirmTransactionDialog`**: Popup interface showing interactive transaction details before signing.
- **`CreditScoreGauge`**: Radial visualization component showing credit scoring and risk bands.
- **`TransactionStatusTracker` / `OperationProgress`**: Interactive stepper components displaying live transaction execution progress.
- **`LoanCard` / `LoanTimeline`**: Visual components representing the details and current timeline status of a loan.

## Styling

### Tailwind CSS & Custom Themes

The project uses **Tailwind CSS 4** for styling with a fully implemented custom color scheme and dark mode support.

**Key Features:**

- **Native CSS Custom Properties**: Theme colors are mapped using CSS variables (`--background`, `--foreground`, etc.) defined in `src/app/[locale]/globals.css`.
- **Dark Mode Support**: Fully operational class-based dark mode. A script block runs synchronously on page load to prevent a flash of incorrect color scheme.
- **Fluid Transitions**: Global utility transitions for background-colors and text-colors.

**Example:**

```tsx
<div className="flex items-center justify-center min-h-screen bg-background text-foreground transition-colors duration-200">
  <h1 className="text-4xl font-bold text-foreground">Welcome to RemitLend</h1>
</div>
```

### Global Styles

Global styles are defined in `src/app/[locale]/globals.css`:

- Tailwind CSS v4 directives
- Custom class-based dark mode rules
- Custom CSS variable themes
- Keyboard focus style resets
- Reverse-spin animations

## Wallet Integration

### Freighter Wallet API

The frontend integrates directly with Freighter wallet using `@stellar/freighter-api` for connecting accounts, verifying network status, and signing transactions.

**Key Integration Details:**

- **Auto-reconnect**: Optional restoration of user sessions on page reload.
- **Network Synchronization**: Detects if the wallet is on an unsupported network or mismatching target environment (e.g. mainnet vs. testnet) and provides in-app warning states.
- **Horizon Sync**: Automatic balance queries mapping XLM and credit assets to the user's view.

**Example Usage:**

```tsx
import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

// Check if Freighter is installed and ready
const freighterReady = await isConnected();

if (freighterReady.isConnected) {
  // Request account access (returns account address)
  const { address, error } = await requestAccess();

  if (address) {
    console.log("Connected address:", address);

    // Sign a transaction XDR
    const signedTxXdr = await signTransaction(unsignedTxXdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
    });
  }
}
```

## State Management

### Zustand Stores

The application uses [Zustand](https://github.com/pmndrs/zustand) for lightweight, high-performance state management, avoiding unnecessary context re-renders. Stores are located in `src/app/stores/` and include:

- **`useWalletStore`**: Single source of truth for the connected wallet, active network details, loaded token balances, and network mismatches.
- **`useThemeStore`**: Controls dark/light/system theme toggling and persists preferences to `localStorage`.
- **`useUserStore`**: Manages authenticated session tokens, profile information, and credit score states.
- **`useGamificationStore`**: Manages borrower XP, current level, level-up states, and dashboard achievements.
- **`useUIStore`**: Global UI states like sidebar expansion, modal toggles, and current navigation tabs.
- **`useToastStore`**: Handles custom reactive toast alerts across the application.

**Example Store Usage:**

```tsx
import { useWalletStore } from "@/app/stores/useWalletStore";

function WalletStatus() {
  const address = useWalletStore((state) => state.address);
  const status = useWalletStore((state) => state.status);
  const disconnect = useWalletStore((state) => state.disconnect);

  if (status === "connected") {
    return (
      <div>
        <p>Connected to: {address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return <p>Wallet Disconnected</p>;
}
```

## API Integration

### Backend API

The frontend communicates with the Express backend for off-chain data.

**Base URL:** `http://localhost:3001/api`

**Example:**

```tsx
async function fetchCreditScore(userId: string) {
  const response = await fetch(`http://localhost:3001/api/score/${userId}`);
  const data = await response.json();
  return data.score;
}
```

### Blockchain Integration

Direct interaction with Soroban smart contracts via Stellar SDK.

**Example:**

```tsx
import { Contract, SorobanRpc } from "@stellar/stellar-sdk";

const contract = new Contract(contractId);
const server = new SorobanRpc.Server("https://soroban-testnet.stellar.org");

// Call contract method
const result = await contract.call("get_score", [nftId]);
```

## Routing

### App Router & Localization

Next.js 16 App Router using file-based routing with localization wrapper via `next-intl` (nested under the `/[locale]` folder).

**Implemented Routes:**

- `/[locale]` - Main landing page with project introduction
- `/[locale]/wallet` - Wallet settings and detailed account balances
- `/[locale]/remittances` - View and mint Remittance NFTs (on-chain collateral)
- `/[locale]/send-remittance` - Mock interface to simulate new remittance history
- `/[locale]/request-loan` - Step-by-step application wizard for borrowers to request loans
- `/[locale]/loans` - Dashboard list tracking borrower/lender loans
- `/[locale]/loans/[loanId]` - Detailed view of a specific loan request/active loan
- `/[locale]/repay/[loanId]` - Repayment form page to submit loan payments
- `/[locale]/lend` - Lender dashboard detailing pool metrics, yield charts, and deposit/withdrawal queues
- `/[locale]/activity` - System transaction activity log
- `/[locale]/analytics` - Analytics dashboard with metrics and charts
- `/[locale]/kingdom` - Gamification page displaying levels, badges, and user tasks
- `/[locale]/settings` - General settings panel (theme toggles, languages)
- `/[locale]/ui-demo` - Sandbox demonstrating reusable UI components

## SEO & Metadata

### Metadata Configuration

```tsx
export const metadata = {
  title: "RemitLend - Credit from Remittances",
  description: "Turn your remittance history into credit history",
  openGraph: {
    title: "RemitLend",
    description: "Decentralized lending for migrant workers",
    images: ["/og-image.png"],
  },
};
```

## Performance Optimization

### Next.js Features

- **Static Generation**: Pre-render pages at build time
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic code splitting per route
- **Font Optimization**: Automatic font optimization

### Best Practices

- Use `next/image` for images
- Implement lazy loading for heavy components
- Minimize client-side JavaScript
- Use server components when possible
- Implement proper caching strategies

## Testing

The project has fully configured environments for both unit/integration tests and end-to-end (E2E) browser testing.

### Testing Stack

- **Unit/Integration Tests**: [Jest](https://jestjs.io) + React Testing Library
- **E2E Integration Tests**: [Playwright](https://playwright.dev) (configured with spec coverage under `e2e/`)
- **A11y Audits**: Automated accessibility assertions via `axe-playwright`

### Running Tests

```bash
# Run end-to-end integration tests in headless mode
npm run test:e2e

# Run automated accessibility checks
npm run audit:a11y

# Run Jest unit/integration tests
npx jest
```

### Example Test

```tsx
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/app/components/global_ui/Spinner";

describe("Spinner", () => {
  it("renders spinner", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

The production image uses a multi-stage build with Next.js standalone output,
runs as a non-root user, and includes a health check.

```bash
# Build the production image
docker build -t remitlend-frontend .

# Run the container
docker run -p 3000:3000 remitlend-frontend

# Verify the health check
docker inspect --format='{{.State.Health.Status}}' <container-id>
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill values appropriate for your environment. The full template (below) documents each variable with purpose and an example value.

```env
# ------------------------------------------------------------------------------
# REMITLEND FRONTEND - ENVIRONMENT VARIABLES TEMPLATE
# Copy this file to '.env.local' or '.env' for local development.
# Fill in values as appropriate for your local or production environment.
# ------------------------------------------------------------------------------

# ── API & Deployment Config ──────────────────────────────────────────────────
# Purpose: The base URL of the RemitLend Express Backend API.
# Example: http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Purpose: The frontend public base URL, used to configure openGraph meta tags and site metadata.
# Example: http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Purpose: The environment mode the application is running in.
# Example: development, production, test
NODE_ENV=development


# ── Stellar & Soroban Config ─────────────────────────────────────────────────
# Purpose: The Stellar network the application interacts with.
# Example: TESTNET, PUBLIC
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

## Accessibility

### WCAG Compliance

The application aims for WCAG 2.1 Level AA compliance:

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast ratios
- Screen reader compatibility

**Note:** Full WCAG compliance requires manual testing with assistive technologies.

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Code Style

- Use functional components with hooks
- Prefer TypeScript interfaces over types
- Use descriptive component names
- Keep components small and focused
- Extract reusable logic into custom hooks
- Follow Next.js best practices

### Before Submitting PR

```bash
npm run lint
npm run build
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Build Errors

```bash
# Clean Next.js cache
rm -rf .next/
npm run build
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Documentation](https://soroban.stellar.org/docs)

## License

ISC License - See LICENSE file for details.

## Support

- Open an issue for bug reports
- Check existing issues before creating new ones
- Provide browser and OS information
- Include screenshots for UI issues
