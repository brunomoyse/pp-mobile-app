# PocketPair Mobile App

A poker tournament management mobile application built with Nuxt 4, Ionic Vue, and TypeScript. Track your poker tournaments, manage registrations, and analyze your performance with a sleek dark theme interface.

## Features

### **Dashboard**
- **Premium dark theme** with gold accent colors
- **Player statistics** (ITM, ROI, Cashes) with progress indicators
- **Quick actions** for upcoming tournaments and registrations
- **Performance tracking** with time-based filtering (7D, 30D, 1Y)
- **Recent results** with profit/loss indicators
- **Club selection** with location-based filtering

### **Tournament Management**
- **Search & filter** tournaments by stakes, type, and club
- **Real-time availability** tracking with spot counts
- **Tournament categories**: Upcoming, Live, Completed
- **Detailed tournament info**: buy-in, structure, guarantee, timing
- **One-click registration** with instant seat confirmation
- **Tournament types**: Deepstack, Turbo, Freezeout, Bounty

### **My Seats**
- **Registration overview** with investment tracking
- **Smart filtering**: Cancelable, Late Reg, Stakes levels
- **Seat management**: Cancel, Modify, View Live
- **Table assignments** and position tracking
- **Registration history** with timestamps
- **Investment analytics** and ROI calculation

### **Multilingual Support**
- **3 Languages**: English, French, Dutch
- **Persistent language selection** with localStorage
- **Complete UI translations** including dates and numbers
- **Easy language switching** via header menu

### **Mobile-First Design**
- **Responsive layout** optimized for iPhone and Android
- **Touch-friendly interactions** with proper button spacing
- **Pull-to-refresh** functionality on all pages
- **Premium animations** and hover effects
- **Bottom navigation** with active state indicators

## Tech Stack

- **Frontend Framework**: [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- **Mobile Framework**: [Ionic Vue](https://ionicframework.com/docs/vue/overview) - Native mobile components
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Ionicons](https://ionic.io/ionicons) - Icon library
- **Internationalization**: [Vue I18n](https://vue-i18n.intlify.dev/) - Custom implementation
- **Font**: [Google Fonts - Roboto](https://fonts.google.com/specimen/Roboto)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pp-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run generate     # Generate static site

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## Project Structure

```
pp-mobile/
├── app.vue                    # Root component (IonApp + IonTabs bottom navigation)
├── nuxt.config.ts             # Nuxt config (modules, GraphQL, runtime config)
├── capacitor.config.ts        # App ID: com.pocketpair.app
├── assets/
│   ├── css/main.css           # Tailwind import + scrollbar hiding
│   └── css/shared.css         # Design system (pp-* component classes, animations)
├── components/                # ClubSelector, QRCodeModal, EditProfileModal, TournamentDetail
├── composables/               # useAuth, useI18n, useGqlSubscription, usePlayerAvatar
├── graphql/                   # queries/, mutations/, subscriptions/ (.gql files)
├── i18n/locales/              # en.json, fr.json, nl.json
├── middleware/auth.ts         # Route guard (redirects to /login)
├── pages/                     # index, login, register, profile, tournaments, registrations, leaderboard, tournament/[id]
├── plugins/                   # i18n.client.ts
├── stores/                    # useAuthStore, useClubStore, useTournamentStore
├── types/                     # user.ts, tournament.ts, clock.ts, seating.ts, graphql.ts
└── utils/                     # currency.ts, datetime.ts
```

## Design System

### Color Palette
- **Primary Background**: `#18181a` (Dark charcoal)
- **Secondary Background**: `#24242a` (Lighter charcoal)
- **Accent Gold**: `#fee78a` (Premium gold)
- **Text Primary**: `#fee78a` (Gold text)
- **Text Secondary**: `#94a3b8` (Muted gray)
- **Border**: `#54545f` (Subtle borders)

### Typography
- **Font Family**: Roboto (300, 400, 500, 700)
- **Heading Sizes**: 28px (welcome), 20px (page titles), 18px (section titles)
- **Body Text**: 14px (standard), 12px (meta info), 11px (labels)

### Components
- **Cards**: Gradient backgrounds with subtle borders and hover effects
- **Buttons**: Multiple variants (primary, secondary, live, warning, disabled)
- **Chips/Badges**: Color-coded by type with proper padding
- **Progress Bars**: Animated with gradient fills

## Internationalization

The app supports three languages with complete UI translations:

- **English** (`en`): Default language
- **French** (`fr`): Français interface
- **Dutch** (`nl`): Nederlandse interface

## Development Notes

### Known Configurations
- **SSR**: Disabled (`ssr: false`) for better mobile compatibility
- **Pages**: Enabled with auto-routing from `pages/` directory
- **Ionic**: Integrated with Vue 3 Composition API
- **Vue I18n**: Custom implementation (replaced @nuxtjs/i18n due to compatibility issues)

### Performance Optimizations
- **Lazy loading** for translation files
- **Image optimization** for avatars and assets
- **Efficient state management** with Vue 3 reactivity
- **Minimal bundle size** with tree-shaking

## Author

Made by a poker enthusiast. Focus on user experience and live performance tracking.

---

*Built with ❤️ for the poker community*