# Eightlife Nonprofit Operations - File Structure

## 📦 Download Package
**File**: `eightlife-nonprofit-operations-complete.zip` (92 KB)
**Location**: `/tmp/eightlife-nonprofit-operations-complete.zip`

## 📁 Project Structure

```
eightlife-nonprofit-operations/
│
├── README.md                      # Project overview and setup guide
├── DEPLOYMENT.md                  # Deployment instructions for Emergent
├── LICENSE                        # MIT License
├── .gitignore                     # Git ignore patterns
│
├── backend/                       # FastAPI Backend
│   ├── server.py                  # Main FastAPI application (470 lines)
│   ├── requirements.txt           # Python dependencies
│   └── .env.example              # Environment variables template
│
├── frontend/                      # React Frontend
│   ├── public/
│   │   └── index.html            # HTML template with Google Fonts
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx    # Top navigation bar
│   │   │   │   └── Sidebar.jsx   # Left sidebar navigation
│   │   │   │
│   │   │   └── ui/               # Shadcn UI components (30+ components)
│   │   │       ├── alert.jsx
│   │   │       ├── badge.jsx
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── dialog.jsx
│   │   │       ├── input.jsx
│   │   │       ├── select.jsx
│   │   │       ├── sonner.jsx    # Toast notifications
│   │   │       └── ... (25+ more)
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & JWT handling
│   │   │
│   │   ├── hooks/
│   │   │   └── use-toast.js      # Toast notification hook
│   │   │
│   │   ├── lib/
│   │   │   └── utils.js          # Utility functions (cn, etc.)
│   │   │
│   │   ├── pages/                # All application pages
│   │   │   ├── Login.jsx         # Staff login page
│   │   │   ├── Dashboard.jsx     # Main dashboard with KPIs & share widget
│   │   │   ├── Inventory.jsx     # Inventory management with batch tracking
│   │   │   ├── Donations.jsx     # Donation source tracking
│   │   │   ├── Distributions.jsx # Distribution logging
│   │   │   ├── Forecasting.jsx   # Statistical forecasting & logistics planning
│   │   │   ├── Alerts.jsx        # Alert management & SMS notifications
│   │   │   ├── Reports.jsx       # Donor impact reports with CSV export
│   │   │   ├── ClientRequests.jsx # Client request management
│   │   │   └── ClientRequestPortal.jsx # Public client portal (/request)
│   │   │
│   │   ├── utils/
│   │   │   └── api.js            # API client functions
│   │   │
│   │   ├── App.js                # Main app component with routing
│   │   ├── App.css               # Global styles
│   │   ├── index.js              # React entry point
│   │   └── index.css             # Tailwind imports
│   │
│   ├── package.json              # Node dependencies & scripts
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── craco.config.js           # Create React App configuration
│   ├── jsconfig.json             # JavaScript path aliases (@/)
│   ├── components.json           # Shadcn UI configuration
│   ├── .env.example             # Frontend environment variables
│   └── README.md                # Frontend-specific documentation
│
└── scripts/
    └── seed_data.py              # Database seeding script
```

## 🔑 Key Files

### Backend (`backend/server.py`)
- **Lines**: 470
- **Models**: User, InventoryBatch, Distribution, FoodRequest, Alert
- **Auth**: JWT with bcrypt password hashing
- **API Routes**: 18 endpoints
  - Auth: /api/auth/register, /api/auth/login, /api/auth/me
  - Inventory: CRUD operations with batch tracking
  - Distributions: Logging and history
  - Food Requests: Public endpoint + staff management
  - Alerts: Auto-generation on dashboard load
  - Analytics: Dashboard stats, forecasting, donor impact
  - Logistics: Distribution planning table
  - Events: Next event info for share widget
  - Notifications: SMS to volunteers

### Frontend Pages
- **Dashboard.jsx** (280 lines): KPIs, quick actions, alerts overview, share widget
- **Inventory.jsx** (265 lines): Batch management with expiration tracking
- **Donations.jsx** (110 lines): Source breakdown and recent donations
- **Distributions.jsx** (175 lines): Log distributions with household/individual counts
- **Forecasting.jsx** (200 lines): Charts, logistics planning table, historical data
- **Alerts.jsx** (160 lines): Alert list with severity badges and SMS button
- **Reports.jsx** (220 lines): Donor impact card with metrics + CSV export
- **ClientRequests.jsx** (165 lines): Manage incoming client requests
- **ClientRequestPortal.jsx** (320 lines): Public portal with item selection & scheduling
- **Login.jsx** (110 lines): Staff authentication

### Configuration Files
- **package.json**: React 19, TailwindCSS, Shadcn UI, Recharts, Framer Motion, Axios, Sonner
- **requirements.txt**: FastAPI, Motor, PyMongo, bcrypt, PyJWT, python-dotenv
- **tailwind.config.js**: Color scheme, font families, component utilities
- **.env.example**: Template for environment variables (no secrets)

## 📊 Code Statistics
- **Total Files**: 100+
- **Lines of Code**: ~8,000+
- **Backend**: Python (FastAPI)
- **Frontend**: React (JSX/JavaScript)
- **Styling**: TailwindCSS
- **Components**: 30+ Shadcn UI components
- **Pages**: 10 (1 public, 9 protected)
- **API Endpoints**: 18

## 🎨 Design Systems

### Staff Portal (Trust & Precision)
- **Colors**: Deep Navy (#1E293B), White (#F8FAFC)
- **Fonts**: Manrope (headings), Inter (body), JetBrains Mono (codes)
- **Components**: Dense tables, dark sidebar, professional

### Client Portal (Community & Earth)
- **Colors**: Warm Beige (#FDFCF8), Terracotta (#E07A5F), Sage (#81B29A)
- **Fonts**: Fraunces (serif headings), Figtree (body)
- **Components**: Spacious cards, wizard flow, warm imagery

## 🚀 Getting Started

### Quick Setup
```bash
# Extract the zip file
unzip eightlife-nonprofit-operations-complete.zip
cd github-export

# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt
cd .. && python scripts/seed_data.py
cd backend && uvicorn server:app --reload

# Frontend (new terminal)
cd frontend
cp .env.example .env
yarn install
yarn start
```

### Default Credentials
- Email: admin@eightlife.org
- Password: admin123

### Access Points
- Staff Portal: http://localhost:3000/login
- Client Portal: http://localhost:3000/request

## 📦 GitHub Push Commands

```bash
# Initialize Git (if not already)
git init
git add .
git commit -m "Initial commit: Eightlife Nonprofit Operations"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/eightlife-nonprofit.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔒 Security Notes

Before deploying to production:
1. Change `JWT_SECRET` in backend/.env to a secure random string
2. Update `CORS_ORIGINS` to your production domain
3. Use strong database credentials
4. Never commit .env files to Git (they're in .gitignore)

## 📚 Documentation

- `README.md` - Project overview and features
- `DEPLOYMENT.md` - Detailed deployment guide for Emergent platform
- `LICENSE` - MIT License
- Each component has inline comments

## 🎯 Features Included

✅ JWT authentication with bcrypt
✅ Batch-level inventory tracking with expiration dates
✅ Auto-alert generation (critical/warning/info)
✅ Statistical demand forecasting (no AI)
✅ Distribution logistics planning table
✅ Donor impact report card with metrics
✅ Share widget (QR Code, Copy Link, Twitter)
✅ SMS volunteer notifications
✅ CSV export for reports
✅ Mobile-responsive client portal
✅ Loading states, error states, empty states
✅ 30+ Shadcn UI components
✅ Two distinct design systems
✅ Public client portal (no login)
✅ Protected staff portal (JWT)

---

**Package Ready for GitHub!** 🚀
