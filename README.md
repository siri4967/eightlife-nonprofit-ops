# Eightlife Nonprofit Operations

A full-stack web application for food banks and food shelves, featuring separate portals for staff operations and client requests.

## 🌐 Live Demo
- **Client Portal (no login):** https://nonprofit-portal-4.preview.emergentagent.com/request
- **Staff Portal:** https://nonprofit-portal-4.preview.emergentagent.com/login
- **Demo login:** admin@eightlife.org / admin123

## 🎯 Features

### Staff Portal
- **Dashboard**: Real-time overview with KPIs (inventory items, pending requests, expiring items, low stock alerts)
- **Inventory Management**: Batch-level tracking with expiration dates and storage locations
- **Donation Tracking**: Monitor sources (Donation, USDA, Second Harvest Heartland)
- **Distribution Management**: Log households and individuals served
- **Demand Forecasting**: Statistical model based on historical data (no AI/LLM)
- **Alerts System**: Expiration risk and low stock notifications with SMS capability
- **Reports**: Donor impact metrics with CSV export
- **Client Requests**: View and manage incoming requests

### Client Portal
- **Public Access**: No login required
- **Category-based Browsing**: Visual food selection (Dry, Dairy, Canned, Frozen, Fresh)
- **Simple Request Flow**: 
  1. Select items and quantities
  2. Schedule pickup (location, date, time)
  3. Receive confirmation number (TS-XXXXXX format)
- **Warm, Welcoming Design**: Completely different UX from staff portal

## 🛠 Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI, Recharts, Framer Motion
- **Backend**: Python FastAPI (async)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT-based with bcrypt password hashing
- **No AI APIs**: Purely statistical forecasting

## 🚀 Getting Started

### Default Credentials
- **Email**: admin@eightlife.org
- **Password**: admin123

### Access Points
- **Client Portal**: `/request` (no login required)
- **Staff Portal**: `/login` then `/dashboard`

## 🎨 Design System

### Staff Portal
- **Theme**: Trust & Precision
- **Colors**: Deep Navy (#1E293B), White (#F8FAFC)
- **Fonts**: Manrope (headings), Inter (body), JetBrains Mono (codes)
- **Layout**: Dense, sidebar navigation, data tables

### Client Portal
- **Theme**: Community & Earth
- **Colors**: Warm Beige (#FDFCF8), Terracotta (#E07A5F), Sage (#81B29A)
- **Fonts**: Fraunces (serif headings), Figtree (body)
- **Layout**: Spacious, wizard flow, large touch targets

---

Built with ❤️ for food banks and food shelves
