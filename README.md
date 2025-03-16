# pizzeria-saas Project

## Overview
The pizzeria-saas project is a web application designed to manage local pizzerias, focusing on takeout orders and integrating AI for a more natural user experience. The application supports both web and mobile platforms.

## Features
- User authentication with OAuth2.
- Order management for takeout orders.
- AI integration for responding to user queries.
- Real-time communication using Twilio.
- Management of business hours and availability slots.
- Subscription model with trial and premium tiers.

## Tech Stack
- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **Caching**: Redis
- **Authentication**: Supabase
- **AI**: DeepSeek Pro

## Directory Structure
```
pizzeria-saas
├── client
│   ├── package.json         # Frontend dependencies
│   ├── tsconfig.json
│   └── src
│       └── App.tsx
├── server
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json
│   └── src
│       └── app.ts
├── shared                   # Shared types/utilities
│   └── types
│       └── index.ts
└── README.md
```

## Getting Started
1. Clone the repository.
2. Install dependencies for both server and client:
   - Navigate to the `server` directory and run `npm install`.
   - Navigate to the `client` directory and run `npm install`.
3. Set up environment variables for database connection and API keys.
4. Start the server and client applications.

## Future Enhancements
- Mobile app development for iOS and Android.
- Additional features for managing subscriptions and pricing tiers.
- Enhanced AI capabilities for better user interaction.

## License
This project is licensed under the MIT License.