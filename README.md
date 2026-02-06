# Yuguyu Fitness App

A cross-platform fitness app built with React Native and Expo for iOS, Android, and Web.

## Features

- **Workout Tracking** - Log exercises, sets, reps, and weights
- **Diet Management** - Track meals and macros with photo and voice input
- **Cardio Sessions** - Monitor cardio activities with heart rate and distance
- **Progress Insights** - View muscle group analysis and strength tracking
- **Water Tracking** - Monitor daily water intake
- **Weight Logging** - Track body weight over time

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Mobile app framework with native capabilities
- **Expo Router** - File-based routing
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Database with Drizzle ORM
- **tRPC** - Type-safe API layer
- **Hono** - Backend server framework

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun package manager
- Expo Go app on your mobile device

### Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run start-web
```

### Testing on Mobile

1. Download **Expo Go** from the App Store or Google Play
2. Run `npm start` to start the development server
3. Scan the QR code with your phone

## Publishing to App Stores

### Prerequisites

- [Expo EAS CLI](https://docs.expo.dev/eas/)
- Apple Developer account ($99/year) for iOS
- Google Play Developer account ($25 one-time) for Android

### Build for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### Submit to Stores

```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

## Project Structure

```
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   └── *.tsx              # Other screens
├── backend/               # Backend API
│   ├── db/                # Database schema
│   └── trpc/              # tRPC routes
├── components/            # Reusable UI components
├── contexts/              # React contexts
├── lib/                   # Utilities and configs
└── types/                 # TypeScript types
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `SENDGRID_API_KEY` - Optional, for password reset emails

## License

Private - All rights reserved
