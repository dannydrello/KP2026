# Kitchen Pastries - E-Commerce Platform

A full-stack e-commerce application for a bakery/pastry shop with integrated payment processing.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Express.js + Node.js
- **Database:** PocketBase (SQLite)
- **Payment:** Paydestal
- **Notifications:** WhatsApp Business API (optional)

## Project Structure

```
├── apps/
│   ├── web/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── api/              # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   └── payment.js
│   │   │   └── main.js
│   │   └── package.json
│   │
│   └── pocketbase/       # PocketBase database
│       ├── pb_data/      # Database files (gitignored)
│       └── pocketbase    # Binary executable
│
└── package.json          # Root workspace config
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install web app dependencies
cd apps/web && npm install

# Install API dependencies
cd apps/api && npm install
```

### 2. Configure Environment

Create `apps/api/.env`:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Paydestal Payment Gateway (get from https://dashboard.paydestal.com)
PAYDESTAL_PUBLIC_KEY=your_public_key_here
PAYDESTAL_SECRET_KEY=your_secret_key_here
PAYDESTAL_MODE=sandbox  # Use 'sandbox' for testing, 'production' for live

# PocketBase Database
POCKETBASE_URL=http://localhost:8090

# Optional: WhatsApp Notifications
WHATSAPP_INTEGRATION_ENABLED=false
```

### 3. Start Services

**Terminal 1 - PocketBase (Database):**
```bash
cd apps/pocketbase
./pocketbase serve --http=0.0.0.0:8090
```

**Terminal 2 - API Server:**
```bash
cd apps/api
npm run dev
```

**Terminal 3 - Web App:**
```bash
cd apps/web
npm run dev
```

### 4. Access the Application

- Web: http://localhost:3000
- API: http://localhost:3001
- PocketBase Admin: http://localhost:8090/_/

## Payment Integration

This application uses **Paydestal** for payment processing.

### How It Works

1. Customer adds items to cart and proceeds to checkout
2. Customer fills shipping/payment details
3. On "Complete Payment", order is created in database
4. Paydestal payment popup opens
5. Customer completes payment in the secure Paydestal window
6. Paydestal sends webhook notification on payment completion
7. Order status is updated to "completed"
8. Customer sees success page

### Testing Payments

Use Paydestal's sandbox mode for testing:

```env
PAYDESTAL_MODE=sandbox
```

Test cards and credentials are available in your Paydestal dashboard.

### Common Issues

See [FIXES.md](./FIXES.md) for detailed troubleshooting.

## Development

### Adding New Pages

1. Create page component in `apps/web/src/pages/`
2. Add route in `apps/web/src/App.jsx`
3. Update navigation links if needed

### Database Schema

The `transactions` collection is auto-created on first run with these fields:

- `orderId` (text, unique) - Order reference
- `status` (select) - pending/completed/failed
- `amount` (number) - Payment amount
- `currency` (text) - NGN
- `customerEmail` (email)
- `customerName` (text)
- `customerPhone` (text)
- `street`, `city`, `country` (text)
- `orderItems` (json) - Cart items
- `paydestal_reference` (text)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payment/config` | GET | Get Paydestal public config |
| `/payment/initiate` | POST | Create new order |
| `/payment/verify/:orderId` | GET | Check payment status |
| `/payment/webhook` | POST | Paydestal callback |

## Deployment

### Production Build

```bash
# Build web app
cd apps/web
npm run build

# Start API in production mode
cd apps/api
NODE_ENV=production npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
PAYDESTAL_MODE=production
PAYDESTAL_PUBLIC_KEY=pk_live_...
PAYDESTAL_SECRET_KEY=sk_live_...
```

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:8090 | xargs kill -9
```

### Database Issues

If the `transactions` collection is missing:
1. Stop PocketBase
2. Delete `apps/pocketbase/pb_data/` (WARNING: loses all data)
3. Restart PocketBase - migrations will auto-run

### Payment Popup Not Opening

1. Check browser console for errors
2. Ensure popups are allowed for the site
3. Check that `PAYDESTAL_PUBLIC_KEY` is valid
4. See [FIXES.md](./FIXES.md) for more details

## Security Notes

- Never commit `.env` files
- Keep `PAYDESTAL_SECRET_KEY` secure (server-side only)
- PocketBase admin credentials should be changed from defaults
- Use HTTPS in production

## License

Private - All rights reserved.
