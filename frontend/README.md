# Hacker House Goa 2026 — Identity Generator (Frontend)

This is the production-ready React frontend for the HH Goa 2026 Builder ID Generator, built with Vite, React Router, Redux Toolkit, Tailwind CSS v4, and GSAP.

## Getting Started

### Prerequisites

Ensure you have Node.js (>= 18) installed.

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Environment Variables:
   Create a `.env` file in the root based on `.env.example`.
   ```bash
   cp .env.example .env
   ```
   *Note: Only `VITE_` prefixed variables should be in the frontend `.env`. Never store secret keys here.*

### Local Development

Start the development server:
```bash
npm run dev
```

### Production Build & Preview

To build the application for production:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

## Vercel Deployment

This project is optimized for deployment on Vercel. A `vercel.json` file is included to properly handle client-side routing (SPA).

1. Connect your repository to Vercel.
2. In the Vercel project settings, ensure the framework preset is set to **Vite**.
3. Configure your Environment Variables in Vercel:
   - `VITE_API_URL` -> The URL of your production backend API (e.g., `https://api.yourdomain.com/api`)
4. Deploy!

The build commands are automatically detected by Vercel:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## Features

- **Branded UI:** Strictly adheres to the HH Goa 2026 editorial design language.
- **GSAP Animations:** Smooth page reveals and interactive elements honoring `prefers-reduced-motion`.
- **Client-Side Export:** ID cards are rendered as PNGs completely in the browser using `html2canvas`.
- **QR Generation:** Instant, high-contrast QR generation linking to the public identity profile.
- **Mobile First:** Designed to ensure touch-friendly interaction and horizontal constraints.
- **Coconut Cursor:** Custom animated coconut cursor (desktop only).

## Security Note

All OAuth flows (e.g., sharing to X) and persistent data modifications happen securely on the backend. This frontend acts strictly as a presentation layer and API consumer.
