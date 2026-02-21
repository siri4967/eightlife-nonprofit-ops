import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

async def seed_data():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Create admin user
    existing_admin = await db.users.find_one({"email": "admin@eightlife.org"})
    if not existing_admin:
        hashed_pw = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        await db.users.insert_one({
            "id": "admin-001",
            "email": "admin@eightlife.org",
            "password": hashed_pw,
            "role": "admin",
            "created_at": "2026-01-15T10:00:00Z"
        })
        print("✅ Admin user created: admin@eightlife.org / admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create sample inventory
    inventory_count = await db.inventory_batches.count_documents({})
    if inventory_count == 0:
        sample_inventory = [
            {
                "id": "inv-001",
                "item_name": "Canned Beans",
                "category": "Canned",
                "quantity": 150,
                "unit": "cans",
                "source": "Donation",
                "received_date": "2026-01-10",
                "expiration_date": "2027-01-10",
                "storage_location": "Warehouse A-1",
                "created_at": "2026-01-10T10:00:00Z"
            },
            {
                "id": "inv-002",
                "item_name": "Rice (White)",
                "category": "Dry",
                "quantity": 200,
                "unit": "lbs",
                "source": "USDA",
                "received_date": "2026-01-12",
                "expiration_date": "2027-06-12",
                "storage_location": "Warehouse A-2",
                "created_at": "2026-01-12T10:00:00Z"
            },
            {
                "id": "inv-003",
                "item_name": "Fresh Apples",
                "category": "Fresh",
                "quantity": 80,
                "unit": "lbs",
                "source": "Second Harvest Heartland",
                "received_date": "2026-01-14",
                "expiration_date": "2026-01-21",
                "storage_location": "Cooler B-1",
                "created_at": "2026-01-14T10:00:00Z"
            },
            {
                "id": "inv-004",
                "item_name": "Milk (Whole)",
                "category": "Dairy",
                "quantity": 60,
                "unit": "gallons",
                "source": "Donation",
                "received_date": "2026-01-15",
                "expiration_date": "2026-01-25",
                "storage_location": "Refrigerator C-1",
                "created_at": "2026-01-15T10:00:00Z"
            },
            {
                "id": "inv-005",
                "item_name": "Frozen Chicken",
                "category": "Frozen",
                "quantity": 40,
                "unit": "lbs",
                "source": "USDA",
                "received_date": "2026-01-13",
                "expiration_date": "2026-07-13",
                "storage_location": "Freezer D-1",
                "created_at": "2026-01-13T10:00:00Z"
            }
        ]
        await db.inventory_batches.insert_many(sample_inventory)
        print(f"✅ Created {len(sample_inventory)} sample inventory items")
    else:
        print(f"ℹ️  Inventory already has {inventory_count} items")
    
    # Create sample distributions
    dist_count = await db.distributions.count_documents({})
    if dist_count == 0:
        sample_distributions = [
            {
                "id": "dist-001",
                "date": "2025-12-15",
                "location_id": "LOC-001",
                "households_served": 45,
                "individuals_served": 180,
                "items_distributed": [],
                "created_at": "2025-12-15T10:00:00Z"
            },
            {
                "id": "dist-002",
                "date": "2025-12-22",
                "location_id": "LOC-002",
                "households_served": 38,
                "individuals_served": 152,
                "items_distributed": [],
                "created_at": "2025-12-22T10:00:00Z"
            },
            {
                "id": "dist-003",
                "date": "2026-01-05",
                "location_id": "LOC-001",
                "households_served": 52,
                "individuals_served": 208,
                "items_distributed": [],
                "created_at": "2026-01-05T10:00:00Z"
            }
        ]
        await db.distributions.insert_many(sample_distributions)
        print(f"✅ Created {len(sample_distributions)} sample distributions")
    else:
        print(f"ℹ️  Distributions already has {dist_count} records")
    
    client.close()
    print("\n🎉 Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(seed_data())
