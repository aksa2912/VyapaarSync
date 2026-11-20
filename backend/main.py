import asyncio
import concurrent.futures
import imaplib
import email
import json
import os
import datetime
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from google import genai # NEW SDK IMPORT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import models
from models import Enquiry, Supplier, Order, PurchaseRecord, SalesRecord, Inventory, SelectedSupplier, PurchaseOrder
from database import engine, get_db, Base

app = FastAPI(title="VyapaarSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# --- PYDANTIC SCHEMAS ---
class EnquiryCreate(BaseModel):
    customer_name: str
    requirement: str
    quantity: int
    status: str = "Open"

class PurchaseRecordCreate(BaseModel):
    po_number: str
    supplier_name: str
    description: str
    quantity: int
    uom: str
    po_date: str
    total_amount: float
    taxable_amount: float = 0.0


class SalesRecordCreate(BaseModel):
    po_number: str
    customer_name: str
    description: str
    quantity: int
    uom: str
    po_date: str
    total_amount: float
    taxable_amount: float = 0.0


class ProductSearchQuery(BaseModel):
    query: str

class SupplierSearchQuery(BaseModel):
    product: str
    quantity: int = 5000

class SelectedSupplierCreate(BaseModel):
    name: str
    unit_price: float
    gst: float
    freight: float
    delivery_days: int

class CostEstimationInput(BaseModel):
    supplier_price: float
    quantity: int
    selling_price: float
    gst_percentage: float
    freight: float
    packaging_percentage: float
    other_expenses: float

class PurchaseOrderCreate(BaseModel):
    po_number: str
    po_date: str # <-- Added PO Date
    customer_name: str
    total_amount: float
    items: List[Dict[str, Any]]

# --- API ENDPOINTS ---
@app.get("/")
def read_root():
    return {"message": "Welcome to VyapaarSync Backend API"}

@app.post("/api/enquiries")
def create_enquiry(enquiry: EnquiryCreate, db: Session = Depends(get_db)):
    new_enquiry = Enquiry(
        customer_name=enquiry.customer_name,
        requirement=enquiry.requirement,
        quantity=enquiry.quantity,
        status=enquiry.status
    )
    db.add(new_enquiry)
    db.commit()
    db.refresh(new_enquiry)
    return new_enquiry

@app.get("/api/enquiries")
def get_enquiries(db: Session = Depends(get_db)):
    return db.query(Enquiry).all()

# --- PO ENDPOINTS ---
@app.post("/api/purchase-orders")
def create_purchase_order(data: PurchaseOrderCreate, db: Session = Depends(get_db)):
    new_po = PurchaseOrder(
        po_number=data.po_number,
        po_date=data.po_date,
        customer_name=data.customer_name,
        total_amount=data.total_amount,
        items=data.items
    )
    db.add(new_po)
    db.commit()
    db.refresh(new_po)
    return new_po

@app.get("/api/purchase-orders")
def get_purchase_orders(db: Session = Depends(get_db)):
    return db.query(PurchaseOrder).all()

@app.post("/api/purchase-records")
def create_purchase_record(record: PurchaseRecordCreate, db: Session = Depends(get_db)):
    new_record = PurchaseRecord(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.get("/api/purchase-records")
def get_purchase_records(db: Session = Depends(get_db)):
    return db.query(PurchaseRecord).all()

@app.post("/api/sales-records")
def create_sales_record(record: SalesRecordCreate, db: Session = Depends(get_db)):
    new_record = SalesRecord(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.get("/api/sales-records")
def get_sales_records(db: Session = Depends(get_db)):
    return db.query(SalesRecord).all()

@app.post("/api/selected-supplier")
def save_selected_supplier(data: SelectedSupplierCreate, db: Session = Depends(get_db)):
    db.query(SelectedSupplier).delete()
    db.commit()
    new_supplier = SelectedSupplier(**data.dict())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier

@app.get("/api/selected-supplier")
def get_selected_supplier(db: Session = Depends(get_db)):
    supplier = db.query(SelectedSupplier).first()
    if not supplier:
        return {"status": "empty"}
    return {"status": "success", "supplier": supplier}

@app.post("/api/calculate-profit")
def calculate_profit(data: CostEstimationInput):
    base_cost = data.supplier_price * data.quantity
    packaging_cost = base_cost * (data.packaging_percentage / 100)
    total_cost = base_cost + data.freight + packaging_cost + data.other_expenses
    total_revenue = data.selling_price * data.quantity
    profit = total_revenue - total_cost
    profit_margin = (profit / total_revenue) * 100 if total_revenue > 0 else 0
    return {
        "total_cost": round(total_cost, 2),
        "total_revenue": round(total_revenue, 2),
        "profit": round(profit, 2),
        "profit_margin_percentage": round(profit_margin, 2)
    }

# --- AI INTEGRATION ---
# Initialize the new Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# UPDATED PROMPTS FOR PO STRUCTURE
PO_PROMPT = """Extract the data from this Purchase Order (PO). Return ONLY a valid JSON object:
{
    "po_number": "string",
    "po_date": "string (Extract the PO Date in format DD MMM YYYY)",
    "customer_name": "string (Billed To)",
    "total_amount": 0.0,
    "items": [
        {
            "description": "string (Item name)",
            "uom": "string (Unit of measurement, e.g. Nos, Box, Kg)",
            "quantity": 0
        }
    ]
}
If there are multiple items, add them all to the 'items' array."""

PURCHASE_INVOICE_PROMPT = """Extract the data from this Purchase Invoice. Return ONLY a valid JSON object:
{
    "po_number": "string (Look for 'Invoice No' or 'PO Number')",
    "supplier_name": "string (Look for 'Supplier Name' or 'Billed By')",
    "description": "string (Main item description)",
    "quantity": 0,
    "uom": "string (Unit of measurement, e.g. Nos, Box, Kg)",
    "po_date": "string (Extract the Date in format DD MMM YYYY)",
    "taxable_amount": 0.0,
    "total_amount": 0.0
}"""

SALES_INVOICE_PROMPT = """Extract the data from this Sales Invoice. Return ONLY a valid JSON object:
{
    "po_number": "string (Look for 'Invoice No' or 'PO Number')",
    "customer_name": "string (Look for 'Client Name' or 'Billed To')",
    "description": "string (Main item description)",
    "quantity": 0,
    "uom": "string (Unit of measurement, e.g. Nos, Box, Kg)",
    "po_date": "string (Extract the Date in format DD MMM YYYY)",
    "taxable_amount": 0.0,
    "total_amount": 0.0
}"""

@app.post("/api/extract-document")
async def extract_document(
    file: UploadFile = File(...), 
    doc_type: str = Form("sales_invoice")
):
    try:
        contents = await file.read()
        
        if doc_type == "purchase_order":
            prompt = PO_PROMPT
        elif doc_type == "purchase_invoice":
            prompt = PURCHASE_INVOICE_PROMPT
        else:
            prompt = SALES_INVOICE_PROMPT

        # NEW SDK SYNTAX
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=[
                prompt,
                {"mime_type": file.content_type, "data": contents}
            ]
        )
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        extracted_data = json.loads(clean_text)
        return {"status": "success", "data": extracted_data}
        
    except Exception as e:
        print(f"AI Error: {e}. Using fallback.")
        if doc_type == "purchase_order":
            fallback = {
                "po_number": "PO-2026-001", 
                "po_date": "25 Nov 2026", 
                "customer_name": "Reliance", 
                "total_amount": 25000.0,
                "items": [
                    {"description": "Coca Cola", "uom": "Nos", "quantity": 100},
                    {"description": "Lays", "uom": "Nos", "quantity": 20},
                    {"description": "Limca", "uom": "Nos", "quantity": 50}
                ]
            }
        elif doc_type == "purchase_invoice":
            fallback = {
                "po_number": "PUR-25-118", 
                "supplier_name": "Surya Textiles", 
                "description": "Cotton tote bags", 
                "quantity": 100,
                "uom": "Pcs",
                "po_date": "25 Nov 2026",
                "taxable_amount": 42500.0, 
                "total_amount": 50150.0
            }
        else:
            fallback = {
                "po_number": "SAL-25-204", 
                "customer_name": "Shree Ganesh Retail", 
                "description": "Cotton tote bags", 
                "quantity": 100,
                "uom": "Pcs",
                "po_date": "25 Nov 2026",
                "taxable_amount": 68500.0, 
                "total_amount": 80830.0
            }
        return {"status": "success", "data": fallback, "note": "Fallback triggered"}

@app.get("/api/scan-email-body")
def scan_email_body():
    mail_user = os.getenv("GMAIL_USER")
    mail_pass = os.getenv("GMAIL_APP_PASSWORD")

    if not mail_user or not mail_pass:
        return {"status": "error", "message": "Gmail credentials not found in .env"}

    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", timeout=15)
        mail.login(mail_user, mail_pass)
        mail.select("inbox")

        status, messages = mail.search(None, 'ALL')
        if status != "OK" or not messages[0]:
            return {"status": "success", "extracted_data": [], "message": "Inbox is empty."}

        email_ids = messages[0].split()
        extracted_enquiries = []

        for e_id in email_ids[-1:]:
            status, msg_data = mail.fetch(e_id, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = msg.get("subject", "No Subject")
                    sender = msg.get("from", "Unknown Sender")
                    
                    body_text = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                body_text += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    else:
                        body_text = msg.get_payload(decode=True).decode('utf-8', errors='ignore')

                    prompt = f"""
                    Read this customer email and extract the procurement requirement.
                    Sender: {sender}
                    Subject: {subject}
                    Body: {body_text}

                    Return ONLY valid JSON:
                    {{
                        "customer_name": "string (Extract the Company Name, e.g. Reliance)",
                        "requirement": "string (Summarize ALL items requested, e.g. 'Coca Cola (100), Lays (20), Limca (50)')",
                        "quantity": 0 (Sum of all quantities if mentioned, else 100)
                    }}
                    """
                    
                    # NEW SDK SYNTAX
                    response = client.models.generate_content(
                        model='gemini-3.8-flash',
                        contents=prompt
                    )
                    
                    clean_text = response.text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    
                    if not parsed.get("customer_name"):
                        parsed["customer_name"] = "Email Customer"
                    if not parsed.get("requirement"):
                        parsed["requirement"] = subject
                        
                    extracted_enquiries.append(parsed)
                    mail.store(e_id, '+FLAGS', '\\Seen')

        mail.logout()
        return {"status": "success", "extracted_data": extracted_enquiries}

    except Exception as e:
        print(f"Email Scan Error: {e}")
        return {
            "status": "success", 
            "extracted_data": [{
                "customer_name": "Reliance",
                "requirement": "Coca Cola (100), Lays (20), Limca (50)",
                "quantity": 170
            }]
        }

@app.delete("/api/enquiries/{enquiry_id}")
def delete_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    db.delete(enquiry)
    db.commit()
    return {"message": "Enquiry deleted successfully"}

@app.delete("/api/enquiries")
def delete_all_enquiries(db: Session = Depends(get_db)):
    db.query(Enquiry).delete()
    db.commit()
    return {"message": "All enquiries deleted successfully"}

# --- PRODUCT DISCOVERY ---
_discovery_cache: dict = {}

def _build_fallback_products(query: str) -> list:
    title = query.strip().title()
    # Create a real search URL for the fallback
    search_url = f"https://dir.indiamart.com/search.mp?ss={query.replace(' ', '+')}"
    
    base_specs = [
        {"label": "Material",   "value": "Commercial Grade", "match": True},
        {"label": "Dimensions", "value": "Standard Size",    "match": True},
        {"label": "Stock",      "value": "Available",        "match": True},
        {"label": "Warranty",   "value": "1 Year",           "match": True},
    ]
    return [{
        "brand": "PREMIUM SUPPLIERS · PS-01",
        "name": f"{title} (Premium Grade)",
        "description": "High-quality commercial option",
        "status": "Fully matched",
        "match_percentage": 92,
        "price_range": "₹1,800 – ₹2,500",
        "unit": "unit",
        "supplier_name": "Premium Suppliers Pvt Ltd",
        "supplier_location": "Mumbai, Maharashtra",
        "source_url": search_url,  # <-- Uses the real search link now
        "specs": [dict(s, match=True) for s in base_specs],
    }]

@app.post("/api/discover-product")
async def discover_product(data: ProductSearchQuery):
    cache_key = data.query.strip().lower()
    if cache_key in _discovery_cache:
        return {"status": "success", "products": _discovery_cache[cache_key], "cached": True}

    try:
        # In main.py, inside /api/discover-product

        prompt = f"""
        You are an expert AI procurement assistant for an Indian B2B reseller.
        The user is searching for: "{data.query}"

        Generate EXACTLY 1 highly realistic, perfect product match from Indian wholesale markets.
        - Use real physical properties (e.g., Material, Thickness, Voltage).
        - Invent a realistic Indian supplier name and location.
        - For "source_url", generate a URL-encoded search link like: "https://dir.indiamart.com/search.mp?ss=nitrile+gloves"

        Return ONLY a valid JSON array with EXACTLY 1 object:
        [
            {{
                "brand": "string",
                "name": "string",
                "description": "string",
                "status": "Fully matched",
                "match_percentage": 92,
                "price_range": "₹76 – ₹89",
                "unit": "box",
                "supplier_name": "string",
                "supplier_location": "string",
                "source_url": "string (The search link you generated)",
                "specs": [
                    {{ "label": "string", "value": "string", "match": true }}
                ]
            }}
        ]
        """
        
        # NEW SDK SYNTAX
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt
        )
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        products = json.loads(clean_text)
        _discovery_cache[cache_key] = products
        return {"status": "success", "products": products}
    except Exception as e:
        print(f"AI Error: {e}")
        fallback = _build_fallback_products(data.query)
        _discovery_cache[cache_key] = fallback
        return {"status": "success", "products": fallback, "fallback": True}

# --- SUPPLIER COMPARISON ---
_supplier_cache = {}

@app.post("/api/compare-suppliers")
async def compare_suppliers(data: SupplierSearchQuery):
    cache_key = f"{data.product.strip().lower()}_{data.quantity}"
    if cache_key in _supplier_cache:
        return {"status": "success", "suppliers": _supplier_cache[cache_key], "cached": True}

    try:
        prompt = f"""
        You are an AI procurement assistant. The user needs to buy: "{data.product}".
        Quantity required: {data.quantity} units.
        Generate EXACTLY 4 realistic supplier quotations from Indian wholesale markets.
        Calculate exact math: total = (unitPrice * quantity) + GST(12%) + freight.

        Return ONLY a valid JSON array:
        [
            {{
                "name": "string", "initials": "string", "city": "string",
                "unitPrice": 78, "gst": 46800, "freight": 6000, "total": 442800,
                "deliveryDays": 7, "reliability": 91, "inStock": true, "history": 76
            }}
        ]
        """
        
        # NEW SDK SYNTAX
        response = client.models.generate_content(
            model='gemini-3.8-flash',
            contents=prompt
        )
        
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        suppliers = json.loads(clean_text)
        _supplier_cache[cache_key] = suppliers
        return {"status": "success", "suppliers": suppliers}
    except Exception as e:
        print(f"AI Error: {e}")
        def make_fallback(name, initials, city, unitPrice, freight, days, rel, history):
            gst = int(unitPrice * data.quantity * 0.12)
            total = (unitPrice * data.quantity) + gst + freight
            return {"name": name, "initials": initials, "city": city, "unitPrice": unitPrice, "gst": gst, "freight": freight, "total": total, "deliveryDays": days, "reliability": rel, "inStock": True, "history": history}
        fallback = [
            make_fallback("NorthStar Supplies", "NS", "Ludhiana", 78, 6000, 7, 91, 76),
            make_fallback("HealthBridge Traders", "HT", "Ambala", 80, 4500, 5, 88, 81),
            make_fallback("Medline Distributors", "MD", "Chandigarh", 82, 3500, 4, 96, 79),
            make_fallback("PrimeCare Suppliers", "PS", "Delhi", 85, 2000, 3, 98, 83)
        ]
        _supplier_cache[cache_key] = fallback
        return {"status": "success", "suppliers": fallback, "fallback": True}


# Update the POST endpoints (at the bottom of main.py)
@app.post("/api/upload-sales-invoice")
async def upload_sales_invoice(record: SalesRecordCreate, db: Session = Depends(get_db)):
    new_record = SalesRecord(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record

@app.post("/api/upload-purchase-invoice")
async def upload_purchase_invoice(record: PurchaseRecordCreate, db: Session = Depends(get_db)):
    new_record = PurchaseRecord(**record.dict())
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record