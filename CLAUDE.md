# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PocketPair Mobile is the player-facing mobile app for the PocketPair poker tournament platform. It allows players to browse tournaments, register, view live clocks, check leaderboards, and manage their profiles.

**Tech Stack:**
- Nuxt 4.2.2 (Vue 3, Composition API, SSR disabled)
- TypeScript
- Ionic Vue (`@nuxtjs/ionic` 1.0.2) for mobile UI components
- Tailwind CSS v4.1.18
- Pinia 3.0.4 (state management with persistence)
- GraphQL (`nuxt-graphql-client` 0.2.46)
- GraphQL WebSocket (`graphql-ws` 6.0.6) for subscriptions
- Capacitor 8.0.0 (iOS/Android native builds)
- vue-i18n 11.2.8 (3 locales: en, fr, nl)
- qrcode 1.5.4 (QR code generation)

## Architecture

### Directory Structure

```
├── app.vue                    # Root component (IonApp + IonTabs bottom navigation)
├── nuxt.config.ts             # Nuxt config (modules, GraphQL, runtime config)
├── capacitor.config.ts        # App ID: com.pocketpair.app
├── assets/
│   ├── css/main.css           # Tailwind import + scrollbar hiding
│   └── css/shared.css         # Design system (pp-* component classes, animations)
├── components/
│   ├── ClubSelector.vue       # Club selection modal (sub-toolbar)
│   ├── QRCodeModal.vue        # QR code display for check-in
│   ├── EditProfileModal.vue   # Profile editing modal
│   └── TournamentDetail.vue   # Tournament detail component
├── composables/
│   ├── useAuth.ts             # Auth composable (wraps useAuthStore)
│   ├── useI18n.ts             # i18n with localStorage persistence
│   ├── useGqlSubscription.ts  # GraphQL WebSocket subscriptions
│   └── usePlayerAvatar.ts     # Avatar path utilities
├── graphql/
│   ├── queries/               # auth, user, tournament, club, clock, seating
│   ├── mutations/             # auth, user, tournament, club, clock, seating
│   └── subscriptions/         # tournament.gql
├── i18n/locales/              # en.json, fr.json, nl.json
├── middleware/
│   └── auth.ts                # Route guard (redirects to /login)
├── pages/
│   ├── index.vue              # Home dashboard (KPIs, next tournaments, recent results)
│   ├── login.vue              # Email/password login
│   ├── register.vue           # Account registration
│   ├── profile.vue            # User profile and settings
│   ├── tournaments.vue        # Tournament listing with search/filter
│   ├── registrations.vue      # My tournament registrations (auth required)
│   ├── leaderboard.vue        # Rankings with period selector
│   └── tournament/[id].vue    # Tournament detail page
├── plugins/
│   └── i18n.client.ts         # vue-i18n setup (en, fr, nl)
├── stores/
│   ├── useAuthStore.ts        # Auth state (persist: currentUser, authToken)
│   ├── useClubStore.ts        # Club selection (persist: selectedClub)
│   └── useTournamentStore.ts  # Tournament detail state
├── types/
│   ├── user.ts                # User, Club, Role, AuthPayload, notifications
│   ├── tournament.ts          # Tournament, Registration, Result, Entry, Leaderboard
│   ├── clock.ts               # TournamentClock, ClockStatus
│   ├── seating.ts             # Tables, seats, assignments, strategies
│   └── graphql.ts             # Generic GraphQL types
└── utils/
    ├── currency.ts            # Currency formatting (fr-BE locale, EUR, cents -> euros)
    └── datetime.ts            # Date/time formatting (locale-aware: fr-BE, nl-BE, en-GB)
```

### Tab Navigation (app.vue)

Bottom tab bar with 5 tabs:
1. **Home** (`/`) - Dashboard with KPIs
2. **Tournaments** (`/tournaments`) - Browse and register
3. **My Seats** (`/registrations`) - User's registrations (auth required)
4. **Leaderboard** (`/leaderboard`) - Rankings
5. **Profile** (`/profile` or `/login`) - Profile or login

### Key Patterns

1. **GraphQL Integration**: `nuxt-graphql-client` with `.gql` files
   - Auto-generated types (requires backend for codegen)
   - Cookie-based token storage (httpOnly, secure in prod, 7-day expiry)
   - Use `GqlOperationName()` for queries/mutations

2. **State Management**: 3 Pinia stores
   - `useAuthStore` - JWT token, user, login/logout (persisted)
   - `useClubStore` - Selected club (persisted to localStorage)
   - `useTournamentStore` - Current tournament detail state

3. **Authentication Flow**:
   - Login via `GqlLoginUser()` -> JWT token + user
   - Token persisted in Pinia + localStorage backup
   - `middleware/auth.ts` protects routes (e.g., registrations)
   - `composables/useAuth.ts` wraps store for convenience
   - Guest-friendly: most pages accessible without auth, features gated

4. **Real-time Updates**: GraphQL subscriptions via WebSocket
   - `composables/useGqlSubscription.ts` manages subscription lifecycle
   - Clock updates, seating changes, registration status

5. **Internationalization**: `vue-i18n` (Composition API mode)
   - 3 locales: en (default), fr, nl
   - `composables/useI18n.ts` with localStorage persistence
   - Date/currency formatting locale-aware (fr-BE, nl-BE, en-GB)

6. **Club-based Filtering**:
   - `ClubSelector.vue` appears as sub-toolbar on tournament/registration pages
   - Selected club persisted to localStorage
   - Tournament queries filter by selected club

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server (default port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run generate     # Generate static site
npm run postinstall  # Prepare Nuxt types
```

## Styling System

### Design System (`assets/css/shared.css`)

Pre-built component classes following the `pp-*` naming convention:

**Layout**: `pp-page`, `pp-header`, `pp-toolbar`, `pp-title`, `pp-content`, `pp-section`

**Cards**: `pp-card`, `pp-action-card`, `pp-stat-card` (with hover/active states)

**Buttons** (BEM): `pp-action-button` base + modifiers `--primary`, `--secondary`, `--danger`, `--warning`, `--success`, `--login`, `--disabled`, `--retry`

**Navigation**: `pp-segment`, `pp-segment-button`, `pp-chip-active`, `pp-chip-inactive`

**Status badges**: `pp-status-upcoming`, `pp-status-live`, `pp-status-completed`

**Tournament type badges**: `pp-type-deepstack`, `pp-type-turbo`, `pp-type-freezeout`, `pp-type-bounty`

**Data display**: `pp-detail-row`, `pp-detail-item`, `pp-detail-icon`, `pp-detail-text`

**States**: `pp-loading-state`, `pp-error-state`, `pp-empty-state`

**Modals/Popovers**: `pp-modal`, `pp-modal-header`, `pp-modal-content`, `pp-popover`, `pp-popover-item`

**Avatars**: `pp-avatar`, `pp-avatar-glow` (with pulse animation)

### Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| Background | `#18181a` | Main dark background |
| Cards | `#24242a` | Card backgrounds |
| Border | `#54545f` | Subtle borders |
| Text Primary | `#e2e8f0` | Light text |
| Text Secondary | `#94a3b8` | Muted text |
| Accent | `#fee78a` | Gold accent (buttons, highlights) |
| Success | `#22c55e` | Green |
| Error | `#ef4444` | Red |

Font: Roboto (Google Fonts)

## Utility Functions

### Currency (`utils/currency.ts`)
```ts
currency(1234)       // "1.234€" (fr-BE locale)
currencyCents(12340) // "123,40€" (converts cents to euros)
```

### DateTime (`utils/datetime.ts`)
```ts
formatDate(dateStr, 'fr')     // "lun. 7 févr."
formatTime(dateStr, 'fr')     // "14:30"
formatDateTime(dateStr, 'fr') // "7 févr. 14:30"
```

## Environment Variables

Configure in `.env`:

```env
NUXT_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
NUXT_GRAPHQL_WS_ENDPOINT=ws://localhost:8080/graphql
NUXT_AUTH_BASE_URL=http://localhost:8080
NUXT_API_KEY=your-api-key
NUXT_DEBUG_GRAPHQL=false
```

## Backend Integration

Connects to the `pp-service` Rust backend:
- GraphQL: `http://localhost:8080/graphql`
- WebSocket: `ws://localhost:8080/graphql`
- OAuth: `http://localhost:8080/oauth/*`

The backend must be running for GraphQL codegen to work.

## Mobile Builds (Capacitor)

```bash
npx cap sync          # Sync web assets to native projects
npx cap open ios      # Open iOS project in Xcode
npx cap open android  # Open Android project
```

App ID: `com.pocketpair.app`

## Common Patterns

### Protected Pages

```ts
definePageMeta({ middleware: 'auth' })
```

### Guest vs Authenticated Content

Most pages are public but show different content based on auth state:
```ts
const { isAuthenticated } = useAuth()
// Template: v-if="isAuthenticated" for auth-only sections
```

### QR Code Generation

```ts
// QRCodeModal.vue generates QR from registration ID
<QRCodeModal :is-open="showQR" :registration-id="registrationId" @close="showQR = false" />
```

## Troubleshooting

### GraphQL Type Errors
1. Ensure the backend is running
2. Run `npm run build` to regenerate types
3. Verify the operation exists in the backend schema

### Authentication Issues
1. Check browser console for auth errors
2. Clear localStorage: `localStorage.clear()`
3. Verify backend JWT configuration
