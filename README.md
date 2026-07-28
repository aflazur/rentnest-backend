# RentNest 🏠 — Backend API

Rental property marketplace backend built with **Node.js, Express, TypeScript, PostgreSQL & Prisma**.
Three roles: **Tenant**, **Landlord**, **Admin**. Includes JWT auth, role-based access, full CRUD,
Stripe payment integration, structured error handling and input validation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma (multi-file schema, driver adapter) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | Zod |
| Payments | Stripe Checkout |
| Security | Helmet, CORS, cookie-parser |
| Deployment | Vercel (serverless) |

---

## 📁 Project Structure

```
rentnest-backend/
├── prisma/
│   ├── schema/           # multi-file Prisma schema (schema, enums, models)
│   └── seed.ts           # seeds admin + sample data
├── src/
│   ├── config/           # env config
│   ├── lib/               # prisma client, stripe client
│   ├── middlewares/       # auth, validateRequest, globalErrorHandler, notFound
│   ├── modules/
│   │   ├── auth/
│   │   ├── category/
│   │   ├── property/
│   │   ├── rental/
│   │   ├── payment/
│   │   ├── review/
│   │   └── admin/
│   ├── routes/            # central router
│   ├── utils/             # ApiError, catchAsync, sendResponse, jwt, pagination...
│   ├── app.ts
│   └── server.ts
├── api/index.ts           # Vercel serverless entrypoint
├── postman_collection.json
└── vercel.json
```

---

## 🚀 Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `DATABASE_URL` (PostgreSQL), JWT secrets, Stripe keys.

   > Get a free hosted Postgres DB in seconds if you don't have one: `npx create-db`,
   > or use [Neon](https://neon.tech) / [Supabase](https://supabase.com) / local Postgres.

3. **Generate the Prisma client & run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Seed the database** (creates admin + sample landlord/tenant/properties)
   ```bash
   npm run seed
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   API will be running at `http://localhost:5000`.

### Build for production
```bash
npm run build
npm start
```

---

## 🔑 Default / Seeded Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@rentnest.com` | `admin123` |
| Landlord | `landlord@rentnest.com` | `landlord123` |
| Tenant | `tenant@rentnest.com` | `tenant123` |

> ⚠️ Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding in production.

---

## 💳 Payment Integration

**Stripe** Checkout is wired up:

- `POST /api/payments/create` — body `{ rentalRequestId }`.
  Only works once a rental request has been **APPROVED** by the landlord. Returns a `checkoutUrl`
  to redirect the tenant to.
- `GET|POST /api/payments/confirm` — called by Stripe on success redirect (or manually).
  Verifies the payment with Stripe, then marks the payment `COMPLETED`, the rental request
  `ACTIVE`, and the property `RENTED`.
- `GET /api/payments` — logged-in user's payment history.
- `GET /api/payments/:id` — payment detail (owner / property landlord / admin only).

**Stripe test card:** `4242 4242 4242 4242`, any future expiry, any CVC.

---

## 📖 Full API Reference

All responses follow: `{ success, statusCode, message, data, meta? }`
All errors follow: `{ success: false, message, errorDetails }`

### Auth — `/api/auth`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/refresh-token` | Public |
| POST | `/logout` | Public |
| GET | `/me` | Logged-in |

### Categories — `/api/categories`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |
| GET | `/:id` | Public |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |

### Properties — `/api/properties` (public) & `/api/landlord/properties`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/properties?city=&area=&type=&minPrice=&maxPrice=&bedrooms=&categoryId=&searchTerm=&page=&limit=&sortBy=&sortOrder=` | Public |
| GET | `/api/properties/:id` | Public |
| GET | `/api/landlord/properties` | Landlord |
| POST | `/api/landlord/properties` | Landlord |
| PUT | `/api/landlord/properties/:id` | Landlord (own) |
| DELETE | `/api/landlord/properties/:id` | Landlord (own) |

### Rental Requests — `/api/rentals` & `/api/landlord/requests`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/rentals` | Tenant |
| GET | `/api/rentals` | Logged-in (own) |
| GET | `/api/rentals/:id` | Owner tenant / landlord / admin |
| GET | `/api/landlord/requests` | Landlord |
| PATCH | `/api/landlord/requests/:id` | Landlord (approve/reject) |

### Payments — `/api/payments`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/create` | Tenant |
| GET / POST | `/confirm` | Public (gateway redirect) |
| GET | `/` | Logged-in (own history) |
| GET | `/:id` | Owner / landlord / admin |

### Reviews — `/api/reviews`
| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | Tenant |
| GET | `/property/:propertyId` | Public |

### Admin — `/api/admin`
| Method | Endpoint | Access |
|---|---|---|
| GET | `/dashboard` | Admin |
| GET | `/users` | Admin |
| PATCH | `/users/:id` | Admin (ban/unban) |
| GET | `/properties` | Admin |
| GET | `/rentals` | Admin |

Full request/response examples: import **`postman_collection.json`** into Postman.

---

## ✅ Rental Lifecycle

```
PENDING → (landlord approves) → APPROVED → (tenant pays) → ACTIVE → COMPLETED
                │
                └─ (landlord rejects) → REJECTED
```

When a request is **APPROVED**, the property is reserved (`UNAVAILABLE`) and any other pending
requests for the same property are auto-rejected. On successful payment, the request becomes
`ACTIVE` and the property becomes `RENTED`.

---

## 🧾 Error Response Format

Every error, regardless of source (validation, Prisma, JWT, or manual `ApiError`), is normalized by
`globalErrorHandler` into:

```json
{
  "success": false,
  "message": "Human readable message",
  "errorDetails": { "...": "..." }
}
```

---

## 📦 Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Add all `.env` variables in the Vercel project settings.
4. Vercel builds `api/index.ts` (see `vercel.json`) which re-exports the same Express `app`.
5. Run `npx prisma migrate deploy` against your production database before/after first deploy.

---

## 🗒️ Notes for Submission

- Postman collection: `postman_collection.json` (import directly, or publish via
  "Documenter" for a shareable link).
- Remember to fill in: Live API URL, GitHub repo link, demo video link, and admin credentials
  in your assignment submission form.
- 20+ meaningful commits are already included in this repo's history — see `git log --oneline`.

---

## 🌐 Live Demo

👉 https://rentnest-backend-three.vercel.app/

---