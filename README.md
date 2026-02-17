# Prolock Hydrogen Storefront

A modern, headless e-commerce storefront for Prolock vehicle security systems, built with Shopify Hydrogen and React Router.

## About Prolock

Prolock is a premium vehicle security solution that acts as both a visible deterrent and physical prevention system, stopping thieves from driving off with your vehicle.

## Tech Stack

This project is built with Shopify's modern headless commerce stack:

- **[Hydrogen](https://shopify.dev/custom-storefronts/hydrogen)** - Shopify's framework for headless commerce
- **[React Router](https://reactrouter.com/)** - Full-stack web framework
- **[Oxygen](https://shopify.dev/docs/custom-storefronts/oxygen)** - Shopify's deployment platform
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[GraphQL](https://graphql.org/)** - API query language with code generation
- **ESLint & Prettier** - Code quality and formatting

## Project Structure

```
hydrogen-storefront/
├── app/
│   ├── components/       # Reusable React components
│   │   ├── Header.jsx    # Navigation header
│   │   └── Hero.jsx      # Homepage hero section
│   ├── routes/           # Route components
│   │   └── _index.jsx    # Homepage route
│   ├── styles/           # Global styles
│   │   └── global.css    # Base CSS and Tailwind imports
│   ├── graphql/          # GraphQL queries and fragments
│   ├── lib/              # Utility functions and helpers
│   ├── entry.client.jsx  # Client-side entry point
│   ├── entry.server.jsx  # Server-side rendering entry
│   └── root.jsx          # Root application component
├── public/               # Static assets
├── .env                  # Environment variables (not in git)
└── vite.config.js        # Vite configuration
```

## Getting Started

### Requirements

- **Node.js** version 18.0.0 or higher
- **npm** or **yarn** package manager
- **Shopify Partner Account** (for store connection)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hydrogen-storefront
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with your Shopify credentials:
   ```env
   PUBLIC_STOREFRONT_API_TOKEN=your_storefront_api_token
   PUBLIC_STORE_DOMAIN=your-store.myshopify.com
   SESSION_SECRET=your_session_secret
   ```

   See the [Environment Variables](#environment-variables) section for details.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port shown in your terminal).

### Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PUBLIC_STOREFRONT_API_TOKEN` | Shopify Storefront API access token | Yes |
| `PUBLIC_STORE_DOMAIN` | Your Shopify store domain (e.g., `store.myshopify.com`) | Yes |
| `SESSION_SECRET` | Secret key for session encryption | Yes |

### Getting Shopify Credentials

1. Log in to your [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Create a new app or use an existing one
3. Navigate to **API credentials**
4. Copy the **Storefront API access token**
5. Add your store domain from your Shopify admin

## Key Features

- ✅ **Fully Responsive** - Mobile-first design that works on all devices
- ✅ **Server-Side Rendering** - Fast initial page loads and SEO optimization
- ✅ **Modern React** - Built with React 18 and hooks
- ✅ **Type Safety** - GraphQL code generation for type-safe queries
- ✅ **Optimized Performance** - Vite for lightning-fast development
- ✅ **Accessible** - WCAG compliant components

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production with code generation |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run codegen` | Generate TypeScript types from GraphQL schema |

## Customer Account API Setup

To enable the `/account` section with customer authentication:

Follow steps 1 and 2 from the [Shopify Customer Account API guide](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen#step-1-set-up-a-public-domain-for-local-development)

## Learn More

- [Hydrogen Documentation](https://shopify.dev/custom-storefronts/hydrogen)
- [React Router Documentation](https://reactrouter.com/docs)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
- Check the [Hydrogen GitHub Issues](https://github.com/Shopify/hydrogen/issues)
- Visit the [Shopify Community Forums](https://community.shopify.com/)
- Review the [Shopify Dev Discord](https://discord.gg/shopifydevs)
# prolock-test
# proloacktest2026
