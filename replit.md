# Yuguyu Fitness App

## Overview
A cross-platform fitness app built with React Native and Expo, designed for iOS, Android, and Web platforms. The app includes workout tracking, diet management, cardio sessions, and detailed progress insights.

## Project Architecture
- **Framework**: Expo (React Native) with expo-router for file-based routing
- **Build System**: npm package manager with EAS Build for app stores
- **Backend**: Hono server with tRPC for type-safe API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based auth with jose library (HMAC SHA-256)
- **State Management**: Zustand and React Query
- **UI**: React Native Web for web platform support

## Backend Architecture

### Authentication
- JWT tokens using `jose` library with secure HMAC SHA-256 signing
- Password hashing with `bcryptjs`
- Email-based password reset with 6-digit codes (stored in database with expiration)
- Token expiration: 7 days

### Database Schema (PostgreSQL)
- **users**: User accounts with profile data (height, weight, fitness goals)
- **password_reset_codes**: Database-backed password reset with expiration
- **exercises**: Default and custom exercise library by muscle group
- **workouts**: Workout sessions with duration and volume tracking
- **workout_exercises**: Junction table linking workouts to exercises
- **exercise_sets**: Individual sets with weight, reps, duration tracking
- **cardio_sessions**: Cardio activities with heart rate and distance
- **meals**: Daily meals by type (breakfast, lunch, dinner, snack)
- **food_entries**: Individual food items with full macro breakdown
- **nutrition_goals**: User-specific daily calorie and macro targets
- **water_logs**: Daily water intake tracking
- **user_progress**: Weight, body fat, and body measurements over time
- **personal_records**: PR tracking with 1RM calculations

### API Routes (tRPC)
- **auth**: register, login, logout, resetPassword, verifyResetCode, confirmResetPassword
- **workouts**: create, complete, list, getById, delete, addExercise, addSet, updateSet, getStats
- **exercises**: list, create, delete, getPersonalRecords, addPersonalRecord
- **nutrition**: createMeal, addFoodEntry, getMealsByDate, getDailyTotals, deleteMeal, deleteFoodEntry, getGoals, updateGoals, logWater, getWaterLog, getWeeklyStats
- **progress**: logProgress, getHistory, getLatest, deleteProgress, getWeightTrend, logCardio, getCardioHistory, getCardioStats

## Project Structure
```
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── calendar.tsx   # Calendar/schedule view
│   │   ├── diet.tsx       # Diet tracking
│   │   ├── journey.tsx    # Fitness journey
│   │   ├── profile.tsx    # User profile
│   │   └── workouts.tsx   # Workout management
│   └── *.tsx              # Other screens (modals, etc.)
├── backend/               # Backend API
│   ├── db/                # Database schema and seed data
│   │   ├── schema.ts      # Drizzle ORM schema definitions
│   │   ├── index.ts       # Database connection
│   │   └── seed-exercises.ts # Default exercise seeding
│   ├── trpc/              # tRPC routes
│   │   ├── routes/        # Individual route modules
│   │   │   ├── auth.ts    # Authentication endpoints
│   │   │   ├── workouts.ts # Workout tracking
│   │   │   ├── nutrition.ts # Meal and macro tracking
│   │   │   └── progress.ts # Body measurements and cardio
│   │   ├── app-router.ts  # Main router combining all routes
│   │   └── create-context.ts # tRPC context setup
│   ├── env.ts             # Environment validation
│   └── hono.ts            # Hono server setup
├── components/            # Reusable UI components
├── contexts/              # React contexts (AuthContext)
├── lib/                   # Utilities and configs
├── types/                 # TypeScript types
└── utils/                 # Helper functions (workout-stats.ts)
```

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (min 32 characters)
- `SENDGRID_API_KEY`: Optional, for password reset emails

## Running the App
- **Development**: `npm run start-web` - Starts Expo web on port 5000
- **Mobile**: `npm start` - Starts with tunnel for mobile testing
- **App Store/Play Store**: Use EAS (Expo Application Services) for cloud builds

## Key Dependencies
- expo, expo-router: Core framework
- react-native-web: Web platform support
- @trpc/react-query: Type-safe API calls
- hono: Backend server framework
- drizzle-orm: Database ORM
- jose: JWT handling
- bcryptjs: Password hashing
- zustand: State management

## Recent Changes
- 2026-01-10: Replaced workout templates with 35+ professional routines including Starting Strength, StrongLifts 5x5, Reddit PPL, PHUL, and more
- 2026-01-10: Added food favorites system - heart button to save favorite foods, dedicated My Favorites modal for quick logging
- 2026-01-07: Added calorie calculator in diet goals - auto-calculates daily calories and macros based on age, height, weight, activity level, and fitness goal (using Mifflin-St Jeor equation)
- 2026-01-05: Added 200 Indian foods database (embedded, instant search)
- 2026-01-05: Combined Indian + USDA food search for comprehensive results
- 2026-01-05: AI photo and voice logging marked as "Coming Soon" (disabled for initial release)
- 2026-01-05: Fixed cardio screen crash with graceful map error handling
- 2026-01-05: Removed all third-party toolkit dependencies for clean EAS builds
- 2026-01-05: Updated app identifiers to com.yuguyu.fitnessapp
- 2026-01-04: Built complete production-ready backend with PostgreSQL
- 2026-01-04: Implemented secure JWT authentication with jose library
- 2026-01-04: Created comprehensive database schema with 12+ tables
- 2026-01-04: Built workout, nutrition, and progress tracking APIs
- 2026-01-04: Seeded 33 default exercises across all muscle groups

## Publishing to App Stores

### Android (Google Play)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
eas submit --platform android
```

### iOS (App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Deployment Notes
- Backend ready for production deployment
- Use EAS Build for iOS/Android app store submissions
- Configure production JWT_SECRET with cryptographically secure value
- Database migrations handled via Drizzle ORM
