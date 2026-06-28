# XyvorA Store — Full-Stack Clothing E-commerce Website

A complete e-commerce storefront for the XyvorA clothing brand, with an admin
panel to manage categories, products, and the site's live color theme — and
a WhatsApp checkout flow instead of a payment gateway.

## What's included

- **Storefront** (React + Vite + Tailwind): Home, Shop (with category
  filtering), Product detail (size/color/quantity selection), Cart.
- **Admin panel**: protected by a login screen.
  - **Categories** — add, edit, delete, with optional category image.
  - **Products** — add, edit, delete. Set price, sale price, sizes, colors,
    stock, featured flag, and up to 5 images per product.
  - **Theme & Colors** — color pickers for every themeable part of the site
    (header, footer, background, buttons, accent color, text). Changes
    preview live instantly and persist once you click "Save changes."
- **WhatsApp checkout**: "Checkout on WhatsApp" on the cart page builds a
  formatted order message (items, sizes, colors, quantities, total, and
  optional name/address) and opens `wa.me` in a new tab with the chat
  pre-filled and ready to send — no payment gateway needed.
- **Backend** (Node.js + Express + MongoDB): REST API for categories,
  products, site settings/theme, and a simple admin login.

## Project structure

```
xyvora-store/
├── backend/
│   ├── config/        # DB connection, Cloudinary config, seed script
│   ├── middleware/     # JWT auth guard for admin routes
│   ├── models/         # Category, Product, SiteSettings (Mongoose)
│   ├── routes/         # auth, categories, products, settings
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/    # Header, Footer, ProductCard, ProtectedRoute
    │   ├── context/       # CartContext, SiteSettingsContext, AdminAuthContext
    │   ├── pages/          # Home, Shop, ProductDetail, Cart
    │   │   └── admin/      # AdminLogin, AdminLayout, Dashboard, Categories, Products, Theme
    │   └── utils/          # api.js (axios), whatsapp.js (checkout message builder)
    └── .env.example
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | What it's for |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `PORT` | Defaults to 5000 |
| `JWT_SECRET` | Any long random string — used to sign admin login tokens |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Your admin panel login |
| `WHATSAPP_NUMBER` | Default WhatsApp number for orders (country code + number, no `+` or spaces, e.g. `919876543210`). You can also change this later from the admin Theme page. |
| `CLOUDINARY_*` | Free account at cloudinary.com — needed for product/category image uploads |
| `CLIENT_ORIGIN` | Your frontend URL, for CORS (e.g. `http://localhost:5173` locally, or your deployed frontend URL in production) |

Then:

```bash
npm run seed    # optional — populates sample categories & products to test with
npm run dev     # starts the API on http://localhost:5000
```

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev     # starts the storefront on http://localhost:5173
```

Visit `http://localhost:5173` for the storefront, and
`http://localhost:5173/admin/login` for the admin panel (use the
`ADMIN_USERNAME`/`ADMIN_PASSWORD` you set in the backend `.env`).

## 3. Using the admin panel

1. Go to `/admin/login` and sign in.
2. **Categories** → add at least one category first (e.g. T-Shirts, Hoodies).
3. **Products** → add items, assign them to a category, set sizes/colors/price,
   upload photos.
4. **Theme & Colors** → pick colors for every part of the site. The live
   preview panel updates instantly as you pick. Click **Save changes** to
   make it permanent — every visitor will then see the new theme.
5. Also set your **WhatsApp number** here (you can change it any time without
   redeploying).

## 4. How WhatsApp checkout works

When a customer clicks **Checkout on WhatsApp** on the cart page, the site:

1. Builds a plain-text message listing every cart item (name, size, color,
   quantity, line price) and the total.
2. Opens `https://wa.me/<your-number>?text=<that message>` in a new tab.
3. WhatsApp (web or app, whichever the customer has) opens a chat with your
   number, with the message already typed in — the customer just hits send.

No payment integration, no order database — orders are confirmed and paid
for over WhatsApp, the same way you already work with clients.

## 5. Deployment (when you're ready)

This matches your usual stack:

- **Backend** → Render (free tier) + MongoDB Atlas. Set the same environment
  variables from `.env` in Render's dashboard. Remember to set `CLIENT_ORIGIN`
  to your deployed frontend's URL once you have it, or the browser will block
  API requests with a CORS error.
- **Frontend** → Render Static Site, Vercel, or Netlify. Set `VITE_API_URL`
  to your deployed backend's URL (e.g. `https://your-api.onrender.com/api`).
- **Images** → already wired to Cloudinary, so they'll work the same in
  production as in development once your Cloudinary keys are set.

## Notes

- The admin login is a single hardcoded username/password from environment
  variables (as requested) — there's no user database for admin accounts.
  If you ever want to add real multi-admin accounts with hashed passwords
  later, that's a separate, bigger change to the auth system.
- Cart contents are stored in the browser's `localStorage`, so they persist
  across page reloads but are per-device/per-browser (there's no user login
  for customers — by design, since checkout happens over WhatsApp, not a
  full account system).
