# Phone Orders AI - Frontend Application

This directory contains the frontend React application for the Phone Orders AIplatform.

## 🛠️ Tech Stack

- **React 19** - Latest React features with improved performance
- **TypeScript** - For type safety and better developer experience
- **Vite 6** - Next-generation frontend tooling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and state management
- **Shadcn UI** - Beautifully designed components
- **React Router** - Client-side routing

## 🏗️ Architecture

The frontend follows a feature-based architecture:

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-specific modules
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── store/            # Zustand state stores
├── utils/            # Helper functions
├── types/            # TypeScript type definitions
├── styles/           # Global styles
├── App.tsx           # Main application component
└── main.tsx          # Entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` with your configuration.

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will start the app at http://localhost:5173

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## 🧪 Testing

```bash
npm run test
```

## 📚 Learn More

For more information about the technologies used:

- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
