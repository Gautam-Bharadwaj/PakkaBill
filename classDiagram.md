# Class Diagram — Layers & Design Patterns

```mermaid
classDiagram
  class BaseRepository {
    <<abstract>>
    #model: Model
    +findById(id)
    +findAll(filter)
    +create(data)
    +update(id, data)
    +softDelete(id)
  }

  class DealerRepository {
    +findByPhone(phone)
    +findActive(filter)
  }

  class ProductRepository {
    +findAvailable()
  }

  class InvoiceRepository {
    +findByInvoiceId(id)
    +listWithFilters(q)
  }

  class PaymentRepository {
    +findByInvoice(invoiceId)
  }

  BaseRepository <|-- DealerRepository
  BaseRepository <|-- ProductRepository
  BaseRepository <|-- InvoiceRepository
  BaseRepository <|-- PaymentRepository

  class InvoiceService {
    <<encapsulation>>
    -calculateLineProfit()
    -applyDiscountStrategy()
    +previewInvoice()
    +createInvoice()
  }

  class PaymentService {
    +recordPayment()
  }

  class PDFService {
    +generateInvoicePdf()
  }

  class QRService {
    +buildUpiUri()
    +toPngBuffer()
  }

  class WhatsAppService {
    +enqueue(message)
  }

  class NotificationService {
    <<Observer>>
    +on(event, handler)
    +emit(event, payload)
  }

  class MLService {
    +predictDemand()
    +analyzeDealers()
  }

  class DiscountStrategy {
    <<interface>>
    +apply(context)
  }

  class FlatDiscountStrategy {
    +apply(context)
  }

  class PercentageDiscountStrategy {
    +apply(context)
  }

  DiscountStrategy <|.. FlatDiscountStrategy
  DiscountStrategy <|.. PercentageDiscountStrategy

  class InvoiceFactory {
    <<Factory>>
    +buildLineItems(dto)
  }

  InvoiceService --> InvoiceRepository
  InvoiceService --> DealerRepository
  InvoiceService --> ProductRepository
  InvoiceService --> PDFService
  InvoiceService --> InvoiceFactory
  InvoiceService --> DiscountStrategy
  PaymentService --> PaymentRepository
  PaymentService --> InvoiceRepository
  PaymentService --> NotificationService
  NotificationService --> WhatsAppService
  InvoiceService --> NotificationService
  MLService --> MLService : Singleton HTTP client
```

**Patterns (summary)**

| Pattern | Where |
|---------|--------|
| Repository | All `*Repository` classes — DB access only |
| Factory | `InvoiceFactory` — builds line items / DTOs |
| Observer | `NotificationService` — payment / invoice events → WhatsApp |
| Strategy | `DiscountStrategy` implementations — swappable discounts |
| Singleton | DB connection, Redis client, `NotificationService` instance |
