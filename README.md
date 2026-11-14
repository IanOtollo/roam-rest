# Roam & Rest

A multi-property BnB showcase and booking site for Kenya. Guests browse stays, check live availability on a calendar, and reserve over WhatsApp. The owner manages properties, bookings and reviews from a private admin.

**Live site:** https://www.roamandrest.co.ke

> Proprietary software. See [LICENSE](LICENSE). All rights reserved.

---

## Features

**For guests**
- Browse and filter stays, with a place picker, a date-range calendar and sorting
- Property pages with a photo walkthrough, bookable options (a whole house or individual units), amenities, location and verified reviews
- Live availability: booked dates are crossed out on the calendar
- "Reserve on WhatsApp" once dates are chosen, so booking keeps working even if the backend is down
- Optional guest accounts (email and password, or Google), saved stays, a bookings page and review prompts
- Share links with generated preview images for every stay
- Seasonal decorations, light and sunset themes, and legal pages

**For the owner (`/admin`)**
- Single owner sign-in; only salted hashes of the credentials are stored
- Create, edit, reorder, rename and publish properties, including photo upload
- Manage bookings and blocked dates
- Approve or decline booking inquiries from email buttons
- Invite past guests to review, and moderate reviews

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS with semantic CSS variables |
| Animation | Framer Motion |
| Backend and database | [Convex](https://www.convex.dev) |
| Email | Resend |
| Auth | Signed session cookies (`jose`); Google sign-in for guests |
| Icons | lucide-react |
| Images | `next/image`, `sharp` |

## Project structure

```
convex/                 Backend: schema and server functions
  schema.ts             Tables: properties, bookings, reviews, inquiries, guests, ...
  properties.ts         Public queries and admin mutations for properties
  bookings.ts           Confirmed stays and blocked dates
  inquiries.ts          WhatsApp inquiries and the host's approve/decline flow
  reviews.ts            Review invites, submission and moderation
  guests.ts             Accounts, saved stays and trips
public/images/<slug>/   Photos for each property
scripts/                Admin setup, production switch and load-test audit
src/
  app/                  Routes: home, stays/[slug], account, review, inquiry, legal, admin, api
  components/           ui, layout, sections, booking, browse, account, admin, live
  lib/                  Site config, amenities catalog, availability logic, auth, email, legal copy
```

Properties live in Convex, not in code. Each one references its photos by site path (`/images/<slug>/NN.jpg`) or by Convex storage id.

## Getting started

**Requirements:** Node.js 20 or later and a Convex account.

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run admin:setup            # creates the admin login (hashes only) in .env.local
npm run dev                    # http://localhost:3000
```

If port 3000 is busy, run `npx next dev -p 3100`.

### Environment variables

Copy the names from [`.env.example`](.env.example) into `.env.local`. Never commit an env file.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `CONVEX_DEPLOYMENT`, `CONVEX_DEPLOY_KEY` | Convex deployment |
| `ADMIN_EMAIL_HASH`, `ADMIN_PASSWORD_HASH`, `ADMIN_EMAIL_PEPPER`, `ADMIN_SESSION_SECRET`, `ADMIN_API_SECRET` | Admin sign-in (written by `npm run admin:setup`) |
| `NEXT_PUBLIC_SITE_URL` | Public address used in the sitemap and share links |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Guest Google sign-in (optional) |
| `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFY_EMAIL` | Booking inquiry emails |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` / `npm start` | Production build and server. Do not run a build while the dev server is running, because it breaks the dev cache. |
| `npm run lint` | Lint the code |
| `npm run admin:setup` | Create or reset the admin login |
| `npm run convex:dev` | Run the Convex CLI against the cloud deployment in dev mode |
| `npm run convex:deploy` | Push backend changes to Convex |
| `npm run go:production` | Move the site to a production Convex deployment |

## How it works

- **Availability:** confirmed bookings are stored with a start date and a checkout morning. The calendar and the booking panel read them, so a taken date can't be requested.
- **Booking flow:** a guest picks dates, then taps "Reserve on WhatsApp". The host gets an email with "booked" and "declined" buttons; "booked" turns the inquiry into a confirmed booking.
- **Admin security:** admin changes go through server actions that check a signed session cookie, then call Convex with a shared secret. Failed sign-ins are rate limited.
- **Caching:** public pages are cached for 60 seconds and cleared whenever the admin saves.
- **Privacy:** a stay's exact address is shown only after booking, guests only ever see dates (never who booked), and reviews come only from verified past guests.

## Adding a property

Use the admin at `/admin/properties`. Add photos, rooms, amenities and prices, then publish. A nightly rate of `0` shows "rates on request".

## Deployment

The site is built to deploy on any Next.js host, with Convex as the backend. Set the environment variables above on the host, run `npm run convex:deploy` for backend changes, then deploy the app.

---

Designed and built by [Marabi](https://www.marabimadeit.co.ke/).
