# 🍕 Pizzeria SaaS - AI Phone Order System

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 📋 Overview

Pizzeria SaaS is a cutting-edge platform enabling pizzerias to automate telephone orders through an AI-powered assistant. The system leverages Twilio for call management and DeepSeek AI models to engage in natural conversations with customers, creating a seamless ordering experience.

## ✨ Key Features

- 🍕 **Custom Menu Management** - Easily create and modify menu items with prices, variants, and modifiers
- 📞 **AI Phone Assistant** - Handle customer calls with natural language processing
- 📆 **Time Slot Reservation** - Manage delivery/pickup scheduling with customizable time slots
- 📊 **Analytics Dashboard** - Monitor orders, peak times, and performance metrics
- 👤 **Multi-tenant Architecture** - Subscription-based SaaS with different pricing tiers
- 🌙 **Theme Switching** - Light/dark mode for optimal user experience
- 🔔 **Real-time Notifications** - Stay informed about new orders and status changes
- 🔒 **Secure Authentication** - Supabase Auth with JWT integration

## 🛠️ Technology Stack

### Frontend

- **React 19** with TypeScript and Vite 6
- **Tailwind CSS 4** for modern, responsive styling
- **Zustand** for state management
- **React Query** for data fetching and caching
- **Shadcn UI** component library

### Backend

- **Node.js** with Express framework
- **TypeScript** for type safety
- **MongoDB** for primary database
- **Redis** for caching and session management

### Integrations

- **DeepSeek AI** for natural language processing
- **Twilio** for telephony services
- **Supabase Auth** for authentication
- **Stripe** for payment processing

## 🗂️ Project Structure

```
pizzeria-saas
├── client                   # Frontend application
│   ├── public               # Static assets
│   ├── src                  # Source code
│   │   ├── components       # Reusable UI components
│   │   ├── features         # Feature-specific components
│   │   ├── hooks            # Custom React hooks
│   │   ├── pages            # Application pages
│   │   ├── services         # API services
│   │   ├── store            # State management
│   │   └── utils            # Utility functions
│   └── ...
├── server                   # Backend application
│   ├── src                  # Source code
│   │   ├── controllers      # Request handlers
│   │   ├── models           # Database models
│   │   ├── routes           # API routes
│   │   ├── services         # Business logic
│   │   └── utils            # Utility functions
│   └── ...
├── shared                   # Shared code between frontend and backend
│   └── types                # TypeScript type definitions
└── ...
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Twilio account
- DeepSeek API key
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/pizzeria-saas.git
   cd pizzeria-saas
   ```

2. **Set up environment variables**

   - Create `.env` files in both client and server directories based on provided examples

3. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

4. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

5. **Start development servers**

   For the backend:

   ```bash
   cd ../server
   npm run dev
   ```

   For the frontend:

   ```bash
   cd ../client
   npm run dev
   ```

## 💡 Development Guidelines

- Follow the established coding standards and file organization
- Write tests for all new features
- Use conventional commit messages
- Create feature branches from `develop` branch

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📬 Contact

For questions or support, reach out to the development team at [your-email@example.com](mailto:your-email@example.com).
