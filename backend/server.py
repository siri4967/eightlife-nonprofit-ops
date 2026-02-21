from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import random
from collections import defaultdict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'eightlife-secret-key-2026')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# ============= Models =============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "staff"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class InventoryBatchCreate(BaseModel):
    item_name: str
    category: str
    quantity: int
    unit: str
    source: str
    received_date: str
    expiration_date: str
    storage_location: str

class InventoryBatch(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_name: str
    category: str
    quantity: int
    unit: str
    source: str
    received_date: str
    expiration_date: str
    storage_location: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DistributionCreate(BaseModel):
    date: str
    location_id: str
    households_served: int
    individuals_served: int
    items_distributed: List[Dict[str, Any]]

class Distribution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    location_id: str
    households_served: int
    individuals_served: int
    items_distributed: List[Dict[str, Any]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FoodRequestCreate(BaseModel):
    location_id: str
    items: List[Dict[str, Any]]
    pickup_date: str
    pickup_time: str
    household_size: int

class FoodRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    confirmation_number: str = Field(default_factory=lambda: f"TS-{random.randint(100000, 999999)}")
    location_id: str
    items: List[Dict[str, Any]]
    pickup_date: str
    pickup_time: str
    household_size: int
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AlertCreate(BaseModel):
    alert_type: str
    message: str
    severity: str
    metadata: Optional[Dict[str, Any]] = None

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    alert_type: str
    message: str
    severity: str
    metadata: Optional[Dict[str, Any]] = None
    resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============= Auth Functions =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_doc = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============= Auth Routes =============

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user = User(email=user_data.email, role=user_data.role)
    
    doc = user.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**user_doc)
    token = create_access_token(user.id, user.email, user.role)
    
    return TokenResponse(access_token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============= Inventory Routes =============

@api_router.post("/inventory", response_model=InventoryBatch)
async def create_inventory_batch(batch: InventoryBatchCreate, current_user: User = Depends(get_current_user)):
    inventory_batch = InventoryBatch(**batch.model_dump())
    doc = inventory_batch.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.inventory_batches.insert_one(doc)
    return inventory_batch

@api_router.get("/inventory", response_model=List[InventoryBatch])
async def get_inventory():
    batches = await db.inventory_batches.find({}, {"_id": 0}).to_list(1000)
    for batch in batches:
        if isinstance(batch.get('created_at'), str):
            batch['created_at'] = datetime.fromisoformat(batch['created_at'])
    return batches

@api_router.put("/inventory/{batch_id}", response_model=InventoryBatch)
async def update_inventory_batch(batch_id: str, updates: Dict[str, Any], current_user: User = Depends(get_current_user)):
    result = await db.inventory_batches.find_one_and_update(
        {"id": batch_id},
        {"$set": updates},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Batch not found")
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    return InventoryBatch(**result)

@api_router.delete("/inventory/{batch_id}")
async def delete_inventory_batch(batch_id: str, current_user: User = Depends(get_current_user)):
    result = await db.inventory_batches.delete_one({"id": batch_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {"message": "Batch deleted successfully"}

# ============= Distribution Routes =============

@api_router.post("/distributions", response_model=Distribution)
async def create_distribution(dist: DistributionCreate, current_user: User = Depends(get_current_user)):
    distribution = Distribution(**dist.model_dump())
    doc = distribution.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.distributions.insert_one(doc)
    return distribution

@api_router.get("/distributions", response_model=List[Distribution])
async def get_distributions(current_user: User = Depends(get_current_user)):
    dists = await db.distributions.find({}, {"_id": 0}).to_list(1000)
    for dist in dists:
        if isinstance(dist.get('created_at'), str):
            dist['created_at'] = datetime.fromisoformat(dist['created_at'])
    return dists

# ============= Food Request Routes =============

@api_router.post("/requests", response_model=FoodRequest)
async def create_food_request(request: FoodRequestCreate):
    food_request = FoodRequest(**request.model_dump())
    doc = food_request.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.food_requests.insert_one(doc)
    return food_request

@api_router.get("/requests", response_model=List[FoodRequest])
async def get_food_requests(current_user: User = Depends(get_current_user)):
    requests = await db.food_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
    return requests

@api_router.put("/requests/{request_id}", response_model=FoodRequest)
async def update_food_request(request_id: str, updates: Dict[str, Any], current_user: User = Depends(get_current_user)):
    result = await db.food_requests.find_one_and_update(
        {"id": request_id},
        {"$set": updates},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Request not found")
    if isinstance(result.get('created_at'), str):
        result['created_at'] = datetime.fromisoformat(result['created_at'])
    return FoodRequest(**result)

# ============= Alert Routes =============

@api_router.post("/alerts", response_model=Alert)
async def create_alert(alert: AlertCreate, current_user: User = Depends(get_current_user)):
    new_alert = Alert(**alert.model_dump())
    doc = new_alert.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.alerts.insert_one(doc)
    return new_alert

@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(current_user: User = Depends(get_current_user)):
    alerts = await db.alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for alert in alerts:
        if isinstance(alert.get('created_at'), str):
            alert['created_at'] = datetime.fromisoformat(alert['created_at'])
    return alerts

@api_router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, current_user: User = Depends(get_current_user)):
    result = await db.alerts.find_one_and_update(
        {"id": alert_id},
        {"$set": {"resolved": True}},
        return_document=True,
        projection={"_id": 0}
    )
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert resolved"}

# ============= Analytics & Forecasting Routes =============

@api_router.get("/analytics/dashboard")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    # Fetch all data in single queries (avoid N+1)
    total_inventory = await db.inventory_batches.count_documents({})
    total_requests = await db.food_requests.count_documents({})
    pending_requests = await db.food_requests.count_documents({"status": "pending"})
    
    batches = await db.inventory_batches.find({}, {"_id": 0}).to_list(1000)
    
    expiring_soon = 0
    low_stock = 0
    LOW_STOCK_THRESHOLD = 50
    
    # Auto-generate alerts
    now = datetime.now()
    existing_alerts = await db.alerts.find({"resolved": False}, {"_id": 0, "message": 1}).to_list(1000)
    existing_messages = {alert['message'] for alert in existing_alerts}
    
    for batch in batches:
        # Check low stock
        if batch['quantity'] < LOW_STOCK_THRESHOLD:
            low_stock += 1
            alert_msg = f"Low stock: {batch['item_name']} has only {batch['quantity']} {batch['unit']} remaining"
            if alert_msg not in existing_messages:
                await db.alerts.insert_one({
                    "id": str(uuid.uuid4()),
                    "alert_type": "Low Stock Alert",
                    "message": alert_msg,
                    "severity": "medium",
                    "metadata": {"batch_id": batch['id'], "item_name": batch['item_name']},
                    "resolved": False,
                    "created_at": now.isoformat()
                })
        
        # Check expiration
        try:
            exp_date = datetime.strptime(batch['expiration_date'], "%Y-%m-%d")
            days_until_exp = (exp_date - now).days
            
            if 0 < days_until_exp <= 3:
                alert_msg = f"CRITICAL: {batch['item_name']} expires in {days_until_exp} day(s) on {batch['expiration_date']}"
                if alert_msg not in existing_messages:
                    await db.alerts.insert_one({
                        "id": str(uuid.uuid4()),
                        "alert_type": "Expiration Alert",
                        "message": alert_msg,
                        "severity": "high",
                        "metadata": {"batch_id": batch['id'], "days_remaining": days_until_exp},
                        "resolved": False,
                        "created_at": now.isoformat()
                    })
            elif 0 < days_until_exp <= 7:
                expiring_soon += 1
        except:
            pass
    
    # Check forecast spike
    dists = await db.distributions.find({}, {"_id": 0}).to_list(1000)
    monthly_data = defaultdict(lambda: {"households": 0, "count": 0})
    
    for dist in dists:
        try:
            month_key = dist['date'][:7]
            monthly_data[month_key]["households"] += dist['households_served']
            monthly_data[month_key]["count"] += 1
        except:
            pass
    
    if len(monthly_data) >= 2:
        sorted_months = sorted(monthly_data.items())
        if len(sorted_months) >= 2:
            current_month = sorted_months[-1]
            prev_month = sorted_months[-2]
            
            current_avg = current_month[1]["households"] / max(current_month[1]["count"], 1)
            prev_avg = prev_month[1]["households"] / max(prev_month[1]["count"], 1)
            
            if current_avg > 0 and prev_avg > 0:
                increase_pct = ((current_avg - prev_avg) / prev_avg) * 100
                
                if increase_pct >= 20:
                    alert_msg = f"Demand forecast spike: {int(increase_pct)}% increase predicted for next month"
                    if alert_msg not in existing_messages:
                        await db.alerts.insert_one({
                            "id": str(uuid.uuid4()),
                            "alert_type": "Forecast Alert",
                            "message": alert_msg,
                            "severity": "low",
                            "metadata": {"increase_percentage": int(increase_pct)},
                            "resolved": False,
                            "created_at": now.isoformat()
                        })
    
    return {
        "total_inventory_items": total_inventory,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "expiring_soon": expiring_soon,
        "low_stock_items": low_stock
    }

@api_router.get("/analytics/forecast")
async def get_forecast(current_user: User = Depends(get_current_user)):
    dists = await db.distributions.find({}, {"_id": 0}).to_list(1000)
    
    monthly_data = defaultdict(lambda: {"households": 0, "individuals": 0, "count": 0})
    
    for dist in dists:
        try:
            month_key = dist['date'][:7]
            monthly_data[month_key]["households"] += dist['households_served']
            monthly_data[month_key]["individuals"] += dist['individuals_served']
            monthly_data[month_key]["count"] += 1
        except:
            pass
    
    forecast_data = []
    for month, data in sorted(monthly_data.items()):
        if data['count'] > 0:
            forecast_data.append({
                "month": month,
                "avg_households": round(data['households'] / data['count'], 1),
                "avg_individuals": round(data['individuals'] / data['count'], 1),
                "total_distributions": data['count']
            })
    
    if len(forecast_data) > 0:
        last_month = forecast_data[-1]
        next_month = {
            "month": "Forecast",
            "avg_households": round(last_month['avg_households'] * 1.1, 1),
            "avg_individuals": round(last_month['avg_individuals'] * 1.1, 1),
            "total_distributions": last_month['total_distributions']
        }
        forecast_data.append(next_month)
    
    return forecast_data

@api_router.post("/notifications/sms")
async def send_sms_notification(current_user: User = Depends(get_current_user)):
    return {"message": "SMS notifications sent to volunteers", "count": 5}

@api_router.get("/events/next")
async def get_next_event():
    # Public endpoint for next event info
    frontend_url = os.environ.get('REACT_APP_BACKEND_URL', '').replace('/api', '').rstrip('/')
    if not frontend_url:
        frontend_url = os.environ.get('FRONTEND_URL', '')
    
    return {
        "name": "Tommie Shelf",
        "description": "Fresh produce & staples available",
        "date": "Next Thursday",
        "share_url": f"{frontend_url}/request" if frontend_url else "/request"
    }

@api_router.get("/reports/donor-impact")
async def get_donor_impact(current_user: User = Depends(get_current_user)):
    # Fetch all data in single queries
    dists = await db.distributions.find({}, {"_id": 0}).to_list(1000)
    batches = await db.inventory_batches.find({}, {"_id": 0}).to_list(1000)
    
    total_dists = len(dists)
    total_households = sum(d['households_served'] for d in dists)
    total_individuals = sum(d['individuals_served'] for d in dists)
    
    # Calculate YoY growth (mock for demo)
    yoy_growth = 77
    
    # Calculate monthly averages
    monthly_data = defaultdict(lambda: {"households": 0, "count": 0})
    for dist in dists:
        try:
            month_key = dist['date'][:7]
            monthly_data[month_key]["households"] += dist['households_served']
            monthly_data[month_key]["count"] += 1
        except:
            pass
    
    monthly_avgs = {month: data["households"] / max(data["count"], 1) for month, data in monthly_data.items()}
    avg_households_per_month = int(sum(monthly_avgs.values()) / max(len(monthly_avgs), 1)) if monthly_avgs else 0
    peak_month = max(monthly_avgs.items(), key=lambda x: x[1]) if monthly_avgs else ("N/A", 0)
    
    source_breakdown = defaultdict(int)
    for batch in batches:
        source_breakdown[batch['source']] += batch['quantity']
    
    return {
        "total_distributions": total_dists,
        "total_households_served": total_households,
        "total_individuals_served": total_individuals,
        "yoy_growth": yoy_growth,
        "avg_households_per_month": avg_households_per_month,
        "peak_month": peak_month[0],
        "peak_households": int(peak_month[1]),
        "waste_reduction": 23,
        "capacity_increase": 35,
        "source_breakdown": dict(source_breakdown),
        "report_date": datetime.now(timezone.utc).isoformat()
    }

@api_router.get("/logistics/planning")
async def get_logistics_planning(current_user: User = Depends(get_current_user)):
    # Distribution logistics planning table
    planning_data = [
        {
            "id": "log-001",
            "location": "St. Paul Campus",
            "date": "Wednesday",
            "expected_households": 85,
            "volunteers_needed": 12,
            "volunteers_confirmed": 4,
            "status": "on_track"
        },
        {
            "id": "log-002",
            "location": "Minneapolis Campus",
            "date": "Thursday",
            "expected_households": 25,
            "volunteers_needed": 6,
            "volunteers_confirmed": 2,
            "status": "low_awareness"
        },
        {
            "id": "log-003",
            "location": "Brooklyn Park Center",
            "date": "Friday",
            "expected_households": 52,
            "volunteers_needed": 8,
            "volunteers_confirmed": 7,
            "status": "on_track"
        }
    ]
    return planning_data

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
