# Airbnb Mini API

Backend GraphQL API for the **Airbnb Mini** final React project.

Students clone this repository, install dependencies, run MongoDB, seed the database, start the backend, and connect their React + Apollo Client frontend to it.

## What is this?

This is a beginner-friendly NestJS GraphQL backend for an Airbnb-style accommodation booking app. It provides:

- User registration and login (JWT)
- Listings with search, filters, and pagination
- Featured listings
- Favorites
- Bookings with date conflict prevention
- Admin listing creation

**GraphQL URL:** `http://localhost:4000/graphql`

## Requirements

- Node.js 18+
- npm
- MongoDB **or** Docker

## Installation

```bash
git clone <repository-url>
cd airbnb-clone-backend
npm install
```

## Start MongoDB

Using Docker (recommended):

```bash
docker compose up -d
```

Or run MongoDB locally on `mongodb://localhost:27017`.

## Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Environment variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `PORT` | API port (default: 4000) |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ADMIN_EMAIL` | Admin account email for `createListing` |
| `ADMIN_PASSWORD` | Admin account password |
| `CORS_ORIGIN` | Optional comma-separated frontend origins (production) |

## Deploy (Render + MongoDB Atlas)

1. Create a free **MongoDB Atlas** cluster, database user, and network access rule allowing `0.0.0.0/0` (required for Render). Copy the connection string (`mongodb+srv://...`).
2. Push this repo to GitHub (includes `render.yaml`).
3. Open [Render Blueprints](https://dashboard.render.com/blueprints/new), connect the repo, and deploy.
4. When prompted, set:
   - `MONGODB_URI` — Atlas connection string
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin login for seeding
   - `CORS_ORIGIN` — your frontend URL(s), e.g. `https://your-app.vercel.app`
5. After the first deploy, Render runs `npm run seed:prod` once to load demo data.

Free Render web services sleep after ~15 minutes idle (cold start ~1 minute). Apollo Sandbox (GraphQL IDE): `https://<your-service>.onrender.com/graphql`.

## Seed database

```bash
npm run seed
```

This clears and recreates:

- 1 demo user
- 1 admin user
- 25 listings

Safe to run multiple times.

## Start server

Development:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

Open Apollo Sandbox: **http://localhost:4000/graphql**

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Demo user | `demo@example.com` | `password123` |
| Admin | `admin@example.com` | `admin123` |

Use the demo account to test authentication, favorites, and bookings.

The admin account can create new listings via the `createListing` mutation.

---

## Authentication flow

1. **Register** or **Login** to receive an `accessToken`
2. Store the token on the frontend (for this student project, `localStorage` is fine)
3. Send the token with protected requests:

```http
Authorization: Bearer <accessToken>
```

4. Use the `me` query to get the current user
5. Use protected queries/mutations for favorites and bookings

Authentication is JWT-based. Passwords are hashed with bcrypt and never returned through GraphQL.

---

## GraphQL examples

### 1. Register (public)

```graphql
mutation {
  register(
    name: "John Doe"
    email: "john@example.com"
    password: "password123"
  ) {
    user {
      id
      name
      email
    }
    accessToken
  }
}
```

Creates a new user and returns a JWT.

### 2. Login (public)

```graphql
mutation {
  login(
    email: "demo@example.com"
    password: "password123"
  ) {
    user {
      id
      name
      email
    }
    accessToken
  }
}
```

Returns a JWT for authenticated requests.

### 3. Listings with pagination (public)

```graphql
query {
  listings(page: 1, limit: 12) {
    items {
      id
      title
      location
      pricePerNight
      rating
      images
      category
    }
    pagination {
      page
      limit
      total
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### 4. Featured listings (public)

```graphql
query {
  featuredListings(limit: 6) {
    id
    title
    location
    pricePerNight
    rating
    images
  }
}
```

### 5. Search listings (public)

```graphql
query {
  listings(search: "modern", page: 1, limit: 12) {
    items {
      id
      title
      location
      pricePerNight
    }
    pagination {
      total
    }
  }
}
```

Searches title, description, and location (case-insensitive).

### 6. Filter listings (public)

```graphql
query {
  listings(
    page: 1
    limit: 12
    category: APARTMENT
    location: "Tashkent"
    minPrice: 50
    maxPrice: 150
  ) {
    items {
      id
      title
      location
      pricePerNight
      category
    }
    pagination {
      total
    }
  }
}
```

All filters work together.

### 7. Listing details (public)

```graphql
query {
  listing(id: "LISTING_ID_HERE") {
    id
    title
    description
    category
    location
    address
    pricePerNight
    guests
    bedrooms
    beds
    bathrooms
    rating
    reviewsCount
    images
    amenities
    isFeatured
  }
}
```

Replace `LISTING_ID_HERE` with a real listing ID from the `listings` query.

### 8. Me (authenticated)

```graphql
query {
  me {
    id
    name
    email
  }
}
```

**Headers:**

```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

### 9. Add favorite (authenticated)

```graphql
mutation {
  addFavorite(listingId: "LISTING_ID_HERE") {
    id
    title
    location
    pricePerNight
  }
}
```

### 10. Remove favorite (authenticated)

```graphql
mutation {
  removeFavorite(listingId: "LISTING_ID_HERE") {
    id
    title
  }
}
```

### 11. Get favorites (authenticated)

```graphql
query {
  favorites {
    id
    title
    location
    pricePerNight
    rating
    images
  }
}
```

### 12. Check favorite (authenticated)

```graphql
query {
  isFavorite(listingId: "LISTING_ID_HERE")
}
```

Returns `true` or `false`.

### 13. Create booking (authenticated)

```graphql
mutation {
  createBooking(
    listingId: "LISTING_ID_HERE"
    checkIn: "2026-09-10"
    checkOut: "2026-09-14"
    guests: 2
  ) {
    id
    checkIn
    checkOut
    guests
    totalNights
    pricePerNight
    totalPrice
    status
    listing {
      id
      title
      location
      images
    }
  }
}
```

The backend calculates `totalNights` and `totalPrice`. The frontend should not send the total price.

### 14. Get bookings (authenticated)

```graphql
query {
  bookings {
    id
    checkIn
    checkOut
    guests
    totalNights
    totalPrice
    status
    listing {
      id
      title
      location
      images
      pricePerNight
    }
  }
}
```

### 15. Cancel booking (authenticated)

```graphql
mutation {
  cancelBooking(bookingId: "BOOKING_ID_HERE") {
    id
    status
  }
}
```

Cancelled bookings no longer block availability.

---

## Apollo Client setup (React)

Install in your React project:

```bash
npm install @apollo/client graphql
```

Example setup:

```tsx
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const token = localStorage.getItem("accessToken");

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
```

After login, save the token:

```tsx
localStorage.setItem("accessToken", data.login.accessToken);
```

For this educational project, storing the JWT in `localStorage` is acceptable for simplicity. In production, other strategies (httpOnly cookies, secure storage) are often preferred.

---

## How students can use this API

Students should **not** need to modify this backend.

The API already supports everything needed for the frontend MVP:

| Frontend page | GraphQL operations |
|---------------|-------------------|
| Home | `featuredListings`, `demoUser` |
| Listings | `listings` (pagination + filters) |
| Search / Filter | `listings(search, category, location, minPrice, maxPrice)` |
| Listing Details | `listing(id)`, `isFavorite` |
| Auth | `register`, `login`, `me` |
| Favorites | `addFavorite`, `removeFavorite`, `favorites` |
| Booking | `createBooking` |
| My Bookings | `bookings`, `cancelBooking` |
| Admin (optional) | `login` as admin, `createListing` |

Connect Apollo Client to:

```
http://localhost:4000/graphql
```

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start server |
| `npm run start:dev` | Start with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run seed` | Seed the database |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Project structure

```
src/
├── auth/          # JWT authentication, guards
├── users/         # User model and service
├── listings/      # Listings, search, filters
├── favorites/     # User favorites
├── bookings/      # Reservations
├── database/      # Seed script
└── common/        # Shared helpers
```

---

## License

UNLICENSED — for educational use.
