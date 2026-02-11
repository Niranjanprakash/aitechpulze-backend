# AI Tech Pulze Backend

Backend API for AI Tech Pulze - Professional Technology Solutions Platform

## Features

- User Authentication (JWT)
- Project Management
- Payment Integration (Razorpay, PhonePe, Paytm)
- File Upload System
- Email Notifications
- WhatsApp Integration
- Admin Dashboard
- Activity Logging

## Tech Stack

- Node.js & Express
- PostgreSQL (Neon)
- Sequelize ORM
- JWT Authentication
- Multer (File Uploads)
- Nodemailer (Email)
- Razorpay, PhonePe, Paytm (Payments)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/Niranjanprakash/aitechpulze-backend.git
cd aitechpulze-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Start the server:
```bash
npm start
# or for development
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## API Endpoints

- `/api/auth` - Authentication
- `/api/projects` - Project management
- `/api/payments` - Payment processing
- `/api/admin` - Admin operations
- `/api/dashboard` - Dashboard data
- `/api/contact` - Contact form
- `/api/messages` - Messaging system

## Deployment

Configured for Vercel deployment with `vercel.json`.

## License

ISC
