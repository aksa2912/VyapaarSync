from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from database import Base
import datetime

class Enquiry(Base):
    __tablename__ = "enquiries"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    requirement = Column(String)
    quantity = Column(Integer)
    status = Column(String, default="Open")
    created_at = Column(DateTime, default=datetime.datetime.now)

class Supplier(Base):
    __tablename__ = "suppliers"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    product_description = Column(String)
    unit_price = Column(Float)
    gst = Column(Float)
    delivery_days = Column(Integer)

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String)
    customer_name = Column(String)
    po_date = Column(String)
    amount = Column(Float)
    status = Column(String)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String)
    po_date = Column(String)
    customer_name = Column(String)
    total_amount = Column(Float)
    items = Column(JSON)

class PurchaseRecord(Base):
    __tablename__ = "purchase_records"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String)
    supplier_name = Column(String)
    description = Column(String)
    quantity = Column(Integer)
    uom = Column(String)
    po_date = Column(String)
    total_amount = Column(Float)
    taxable_amount = Column(Float)

class SalesRecord(Base):
    __tablename__ = "sales_records"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String)
    customer_name = Column(String)
    description = Column(String)
    quantity = Column(Integer)
    uom = Column(String)
    po_date = Column(String)
    total_amount = Column(Float)
    taxable_amount = Column(Float)

class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = {'schema': 'public'}
    
    id = Column(Integer, primary_key=True, index=True)
    product_description = Column(String)
    quantity_in_stock = Column(Integer)
    previous_purchase_price = Column(Float)

class SelectedSupplier(Base):
    __tablename__ = "selected_supplier"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit_price = Column(Float, default=0.0)
    gst = Column(Float, default=0.0)
    freight = Column(Float, default=0.0)
    delivery_days = Column(Integer, default=0)