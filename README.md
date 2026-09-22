# ALO Booking — Web Client

Pixel-matched rebuild of the ALO Booking sign-in and registration screens, on a feature-based
React 19 + TypeScript 5.8.2 + Vite architecture ready for the rest of the court-management product.

## Getting started

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173  ->  /uLogin
npm run lint && npm run typecheck && npm run build
```

Docker:

```bash
docker compose up --build web            # nginx on :8080
docker compose --profile dev up web-dev  # hot reload on :5173
```

---

## 1. Folder structure

```
alobo-booking/
├─ Dockerfile                  # deps → build → nginx runtime (+ dev target)
├─ docker-compose.yml          # web (prod) / web-dev (HMR profile)
├─ nginx.conf                  # SPA history fallback, immutable asset caching
├─ eslint.config.js .prettierrc components.json
├─ tsconfig.json / .app.json / .node.json
├─ vite.config.ts              # @ alias, /api proxy, tailwind v4 plugin
└─ src/
   ├─ main.tsx  App.tsx  vite-env.d.ts
   ├─ app/
   │  ├─ providers/  AppProviders.tsx  ErrorBoundary.tsx
   │  └─ router/     index.tsx  paths.ts  guards.tsx
   ├─ components/
   │  ├─ ui/         button  field  text-input  password-input
   │  │              phone-input  tabs  card  google-button
   │  ├─ layout/     AuthLayout.tsx  AppLayout.tsx
   │  └─ common/     OwnerAppBanner  LanguageSwitcher  RouteFallback  NotFoundPage
   ├─ features/
   │  ├─ auth/       api/ components/ hooks/ pages/ schemas/ store/
   │  ├─ courts/     api/ components/ pages/
   │  ├─ booking/    api/ components/ pages/
   │  └─ dashboard/  components/ pages/       # Recharts revenue
   ├─ hooks/         useSocket.ts  useApiErrorMessage.ts
   ├─ lib/           axios.ts  query-client.ts  socket.ts  dayjs.ts
   │                 token-storage.ts  env.ts  utils.ts
   ├─ i18n/          index.ts  locales/vi.json  locales/en.json
   ├─ styles/        index.css        # @theme design tokens
   └─ types/         auth.ts  api.ts
```

Rule of thumb: anything a second feature would import lives in `components/ui`, `lib`, or `hooks`.
Anything only auth cares about stays under `features/auth`. Features never import each other's
internals — they cross-talk through `lib` and the auth store only.

## 2. Component hierarchy

```
App
└─ AppProviders            ErrorBoundary → I18nextProvider → QueryClientProvider
   └─ AppRouter (createBrowserRouter, lazy routes)
      ├─ GuestRoute
      │  ├─ /uLogin  LoginPage
      │  │   └─ AuthLayout  (green canvas · wave SVG · back · centred title)
      │  │      ├─ LanguageSwitcher
      │  │      ├─ Card
      │  │      │  └─ Tabs  ── TabsList ── TabsTrigger ×2  (phone | email)
      │  │      │     └─ CardBody
      │  │      │        ├─ TabsContent "phone" → LoginPhoneForm
      │  │      │        │     FormAlert · PhoneInput · PasswordInput · Button
      │  │      │        ├─ TabsContent "email" → LoginEmailForm
      │  │      │        │     FormAlert · TextInput(clearable) · PasswordInput · Button
      │  │      │        └─ forgot-password link
      │  │      ├─ register link
      │  │      ├─ GoogleButton
      │  │      └─ OwnerAppBanner
      │  ├─ /uRegister  RegisterPage
      │  │   └─ AuthLayout → Card → CardBody → RegisterForm
      │  │        PhoneInput · TextInput(email) · TextInput(fullName)
      │  │        PasswordInput ×2 · Button · sign-in link
      │  └─ /uForgotPassword  ForgotPasswordPage
      └─ ProtectedRoute → AppLayout
         ├─ /dashboard  DashboardPage → RevenueChart (Recharts)
         ├─ /courts     CourtsPage    (TanStack Query)
         └─ /bookings   BookingsPage  (useSocket → query invalidation)
```

Every field in both screens resolves to the same primitive pair — `FieldLabel` + `FieldShell` —
so label weight, control height (`--spacing-field: 52px`), border colour, and radius are
identical across phone, email, name, and password inputs. That is what keeps the two screens
pixel-consistent with each other as well as with the source design.

---

## 3. Design tokens and foundations

Declared once in `src/styles/index.css` under Tailwind v4 `@theme`. Components must reference
tokens (`bg-brand-600`, `text-content-primary`, `rounded-[var(--radius-field)]`), never raw hex.

| Group | Tokens |
| --- | --- |
| Brand | `--color-brand-50…900`, primary action `--color-brand-600` |
| Canvas | `--color-canvas-from/via/to` → `auth-canvas` utility |
| Content | `primary`, `secondary`, `placeholder`, `onbrand`, `link` |
| Line/state | `line`, `line-strong`, `focus`, `danger`, `success`, `accent-gold` |
| Type | `--font-sans: Montserrat`, base 16px / 400 |
| Shape | `--radius-field: 8px`, `--radius-card: 12px`, `--radius-pill` |
| Elevation | `--shadow-card` |
| Control size | `--spacing-field: 52px`, `--spacing-action: 56px` |

## 4. Component rules (states, responsive, edge cases)

**Button** — variants `primary · outline · ghost · link · danger`; sizes `sm · md · lg · icon`;
`block` for full width. Must render default, hover, focus-visible, active, disabled, and loading
(spinner + `aria-busy`, pointer events suppressed). Labels stay in sentence or product case; the
two primary CTAs keep the source design's uppercase treatment.

**FieldShell** — the single source of control geometry. Focus lives on the shell
(`focus-within:border-brand-600`), error state via `data-invalid`, disabled via `data-disabled`.
Long values scroll inside the field; the shell never grows.

**PhoneInput** — dial-code trigger (flag + code + chevron) over a transparent native `<select>`,
1px divider, then the national number. Digits are stored raw and rendered grouped; input is capped
at 10 digits so paste of a formatted number still normalises. Touch targets are ≥44px.

**PasswordInput** — trailing toggle is a real button with `aria-pressed` and a translated label;
it is `tabIndex` reachable and never traps focus inside the field.

**TextInput `clearable`** — the circular clear control from the register screen. It is
`tabIndex={-1}` (keyboard users clear with the keyboard) but labelled for pointer and screen
reader users, and re-validates on clear.

**Tabs** — folder metaphor: the active trigger takes the card surface and brand text; the inactive
one sits on `surface-muted`. Roving focus and arrow-key navigation come from Radix.

**Responsive** — the auth card is fluid to a 600px cap with 16px gutters; at ≤400px the header
shrinks to 56px and the card body padding drops from 28px to 20px. `min-h-dvh` plus
`env(safe-area-inset-*)` keeps content clear of mobile system bars.

**Empty / error / long content** — `FormAlert` carries the server-level failure above the fields,
`FieldError` the per-field one; both use `role="alert"`. Court and booking lists render nothing
rather than a spinner skeleton when empty, with the loading line above them.

## 5. Accessibility acceptance criteria (WCAG 2.2 AA)

- Every input must have a programmatic label; placeholders are never the only label.
- Focus must be visible on every interactive element: 3px `--color-focus` ring, 2px offset.
- `brand-600` on white ≥ 7:1; white on `brand-600` ≥ 7:1; `danger` on white ≥ 4.5:1.
- Errors must be announced: `aria-invalid` on the control, `aria-describedby` to a `role="alert"`.
- The whole login and register flow must be completable with keyboard only, tab order top to bottom.
- Password visibility toggles must expose state via `aria-pressed`.
- `prefers-reduced-motion: reduce` must disable transitions and the loading spin.
- Touch targets must be at least 44×44px.

## 6. Content and tone

Plain verbs, sentence case, no apology. Errors say what to fix: “Số điện thoại gồm 9–10 chữ số”,
not “Invalid input”. An action keeps its name end to end — the button that says ĐĂNG KÝ produces a
session, and the link back always says Đăng nhập. All copy lives in `src/i18n/locales`; no string
is hardcoded in a component.

## 7. Anti-patterns (prohibited)

- Raw hex or arbitrary spacing inside components — extend `@theme` instead.
- `outline: none` without a replacement focus style.
- Placeholder-as-label, or an error shown only by colour.
- Feature-to-feature imports; reach through `lib`, `hooks`, or the auth store.
- Storing tokens anywhere but `lib/token-storage`, or reading `localStorage` inline in a component.
- One-off field markup that bypasses `FieldShell`.

## 8. QA checklist

- [ ] `npm run lint`, `npm run typecheck`, `npm run build` all clean.
- [ ] Login and register match the reference at 375px, 768px, and 1440px.
- [ ] Keyboard-only pass: tab order, visible focus, toggle and clear reachable or intentionally skipped.
- [ ] Screen-reader pass: labels, error announcements, tab names.
- [ ] Contrast audit on brand, danger, placeholder, and the gold banner.
- [ ] 401 triggers one refresh attempt, then a single redirect to `/uLogin`.
- [ ] Locale switch updates copy and Dayjs formatting without reload.
- [ ] Reduced-motion pass: no spin, no transitions.
- [ ] Docker image serves deep links (`/bookings` refresh returns the app, not 404).

---

## Backend contract

| Endpoint | Body | Returns |
| --- | --- | --- |
| `POST /auth/login/phone` | `{ dialCode, phone, password }` | `{ user, accessToken, refreshToken }` |
| `POST /auth/login/email` | `{ email, password }` | same |
| `POST /auth/login/google` | `{ idToken }` | same |
| `POST /auth/register` | `{ dialCode, phone, email?, fullName, password }` | same |
| `POST /auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `GET /auth/me` | — | `User` |

All responses are wrapped as `{ data: … }`; errors as `{ code, message, errors? }`. A 401 triggers
one single-flight refresh in `lib/axios.ts`; a failed refresh dispatches `alobo:session-expired`,
which the Zustand store listens for and clears the session.
