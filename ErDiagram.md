# ER Diagram — MongoDB Collections

```mermaid
erDiagram
  USER ||--o{ SESSION : "owns refresh tokens"

  DEALER ||--o{ INVOICE : "places"
  DEALER ||--o{ PAYMENT : "pays"
  DEALER ||--o{ MESSAGE : "notified"

  PRODUCT ||--o{ INVOICE_ITEM : "snapshot at billing"

  INVOICE ||--|{ INVOICE_ITEM : "contains embedded"
  INVOICE ||--o{ PAYMENT : "receives"
  INVOICE ||--o{ MESSAGE : "optional link"

  USER {
    objectId _id PK
    string phone UK
    string pinHash
    string refreshTokenHash
    date createdAt
  }

  DEALER {
    objectId _id PK
    string name
    string phone
    string shopName
    number creditLimit
    number pendingAmount
    number totalPurchased
    boolean isActive
    date createdAt
  }

  PRODUCT {
    objectId _id PK
    string name
    number sellingPrice
    object costBreakdown
    number manufacturingCost
    number stockQuantity
    number lowStockThreshold
    boolean isArchived
    date createdAt
  }

  INVOICE {
    objectId _id PK
    string invoiceId UK
    objectId dealerId FK
    object dealerSnapshot
    array items
    number subtotal
    number gstAmount
    number totalAmount
    number totalProfit
    number amountPaid
    number amountDue
    string paymentStatus
    string pdfPath
    date createdAt
  }

  INVOICE_ITEM {
    objectId productId FK
    object productSnapshot
    number quantity
    number unitPrice
    number discount
    number lineTotal
    number lineProfit
  }

  PAYMENT {
    objectId _id PK
    objectId invoiceId FK
    objectId dealerId FK
    number amount
    string mode
    string upiRef
    date recordedAt
  }

  MESSAGE {
    objectId _id PK
    objectId dealerId FK
    objectId invoiceId FK
    string type
    string phone
    string content
    string status
    date sentAt
  }
```

**Relationships**

- One **Dealer** has many **Invoices** and many **Payments**.
- **Invoice** embeds **InvoiceItem** documents (product snapshot + line economics).
- **Payment** references both **Invoice** and **Dealer** for fast ledger queries.
- **Message** optionally references **Invoice** for template context.
