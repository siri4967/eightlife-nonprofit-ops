# Deployment Guide

## Emergent Platform Deployment

This application is optimized for deployment on [Emergent](https://emergent.sh).

### Quick Deploy

1. Fork/clone this repository
2. Connect to Emergent platform
3. Click "Deploy" button
4. Wait 10-15 minutes for deployment
5. Access your app at the provided production URL

### Environment Variables

The following environment variables are automatically configured by Emergent:

**Backend:**
- `MONGO_URL` - MongoDB connection string (auto-configured)
- `DB_NAME` - Database name (auto-configured)
- `CORS_ORIGINS` - CORS allowed origins
- `JWT_SECRET` - Secret key for JWT tokens

**Frontend:**
- `REACT_APP_BACKEND_URL` - Backend API URL (auto-configured)

### Resource Allocation

- **CPU**: 250m per service
- **Memory**: 1Gi per service
- **Replicas**: 2 for high availability
- **Cost**: ~50 credits/month

### Tech Stack

- **Frontend**: React 19, TailwindCSS, Shadcn UI
- **Backend**: FastAPI (Python), async/await
- **Database**: MongoDB with Motor (async driver)
- **Auth**: JWT with bcrypt

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB 6.0+
- Yarn

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd eightlife-nonprofit-operations
```

2. **Backend setup**
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python ../scripts/seed_data.py
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

3. **Frontend setup** (in new terminal)
```bash
cd frontend
cp .env.example .env
yarn install
yarn start
```

4. **Access the app**
- Staff Portal: http://localhost:3000/login
- Client Portal: http://localhost:3000/request
- Default credentials: admin@eightlife.org / admin123

## Features

### Staff Portal
- Dashboard with real-time KPIs
- Inventory management with batch tracking
- Donation source tracking
- Distribution logging
- Statistical demand forecasting
- Alert system with SMS notifications
- Donor impact reports with CSV export
- Client request management

### Client Portal (Public)
- No login required
- Category-based food browsing
- Item selection and quantity input
- Pickup scheduling
- Confirmation number generation (TS-XXXXXX)

## Production Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Update CORS_ORIGINS to your production domain
- [ ] Review and adjust MongoDB indexes
- [ ] Set up backup strategy for MongoDB
- [ ] Configure monitoring and logging
- [ ] Test all critical flows
- [ ] Review security settings

## Support

For issues or questions:
- Platform: [Emergent Documentation](https://emergent.sh/docs)
- GitHub Issues: Create an issue in this repository