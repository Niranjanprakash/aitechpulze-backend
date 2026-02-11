# 🚀 AI Tech Pulze Backend - PostgreSQL Edition

## 📋 Overview
Backend API for AI Tech Pulze platform, migrated from MySQL to PostgreSQL for serverless deployment on Vercel.

## 🗄️ Database
- **Type**: PostgreSQL 14+
- **ORM**: Sequelize 6.x
- **Providers**: Neon, Supabase, Railway (recommended)

## 🛠️ Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio
- **WhatsApp**: Meta Business API
- **Payments**: Razorpay

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create `.env` file:
```env
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
PORT=5000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
# ... other variables (see .env.example)
```

### 3. Initialize Database
Run the PostgreSQL schema:
```bash
psql "your_database_url" -f database/schema-postgres.sql
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id/verify` - Verify payment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-projects` - Get recent projects

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files/:id` - Get file

### Other
- `POST /api/contact` - Contact form
- `POST /api/whatsapp/send` - Send WhatsApp message
- `GET /api/health` - Health check

## 🧪 Testing

### Test All Endpoints
```bash
# Linux/Mac
./test-api.sh http://localhost:5000

# Windows
test-api.bat http://localhost:5000
```

### Manual Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123","phone":"1234567890"}'
```

## 🚀 Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Add Environment Variables
Go to Vercel Dashboard → Settings → Environment Variables and add all variables from `.env.example`.

## 📁 Project Structure
```
backend/
├── config/
│   └── database.js          # PostgreSQL connection
├── database/
│   ├── schema-postgres.sql  # PostgreSQL schema
│   └── schema.sql           # Original MySQL schema (deprecated)
├── middleware/
│   └── auth.js              # JWT authentication
├── models/
│   ├── index.js             # Model associations
│   ├── User.js              # User model
│   ├── Project.js           # Project model
│   ├── Payment.js           # Payment model
│   ├── ActivityLog.js       # Activity log model
│   └── ProjectFile.js       # Project file model
├── routes/
│   ├── auth.js              # Auth routes
│   ├── projects.js          # Project routes
│   ├── payments.js          # Payment routes
│   ├── dashboard.js         # Dashboard routes
│   ├── files.js             # File routes
│   └── contact.js           # Contact routes
├── services/
│   ├── razorpayService.js   # Razorpay integration
│   ├── paytmService.js      # Paytm integration
│   └── phonePeService.js    # PhonePe integration
├── utils/
│   ├── email.js             # Email utilities
│   ├── sms.js               # SMS utilities
│   ├── whatsapp.js          # WhatsApp utilities
│   └── activityLogger.js    # Activity logging
├── uploads/                 # File uploads directory
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Main server file
├── vercel.json              # Vercel configuration
└── package.json             # Dependencies
```

## 🔒 Security Features
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection prevention (Sequelize)
- ✅ XSS protection

## 🔄 Migration from MySQL
This backend was migrated from MySQL to PostgreSQL. Key changes:
- Database driver: `mysql2` → `pg`
- Connection: Individual params → `DATABASE_URL`
- Schema: MySQL syntax → PostgreSQL syntax
- All business logic: **UNCHANGED**
- All API endpoints: **UNCHANGED**

See `MIGRATION-SUMMARY.md` for complete details.

## 📊 Database Schema

### Tables:
- `users` - User accounts
- `admins` - Admin accounts
- `projects` - Project requests
- `project_files` - Project file uploads
- `payments` - Payment records
- `messages` - Project messages
- `notifications` - System notifications
- `activity_logs` - User activity logs
- `project_status` - Project status types

### Relationships:
- User → Projects (1:N)
- User → Payments (1:N)
- Project → Payments (1:N)
- Project → Files (1:N)
- Project → Messages (1:N)

## 🐛 Troubleshooting

### Connection Issues
```bash
# Test database connection
psql "your_database_url"
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### SSL Certificate Issues
```javascript
// In config/database.js, set:
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false  // For development only
  }
}
```

## 📚 Documentation
- [Deployment Guide](../DEPLOYMENT-GUIDE.md)
- [Migration Summary](../MIGRATION-SUMMARY.md)
- [Database Comparison](../DATABASE-COMPARISON.md)
- [Quick Reference](../QUICK-REFERENCE.md)

## 🤝 Contributing
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License
ISC

## 👥 Authors
AI Tech Pulze Team

## 🆘 Support
For issues or questions:
- Email: aitechpulze@gmail.com
- WhatsApp: +91 9585776088

---

**✅ Ready for serverless deployment on Vercel!** 🚀
