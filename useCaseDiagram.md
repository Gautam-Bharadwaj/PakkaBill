# Use Case Diagram | PakkaBill

```mermaid
flowchart LR
    User([Executive Owner])
    
    subgraph "PakkaBill Application"
        direction TB
        UC1(Authenticate via OTP)
        UC2(Manage Dealer Profiles)
        UC3(Manage Product SKUs)
        UC4(Create Sequential Invoice)
        UC5(Execute Smart GST Calculation)
        UC6(Query AI Assistant)
        UC7(Track Payments)
        UC8(Generate Executive PDF)
        UC9(WhatsApp Smart Share)
    end
    
    User --- UC1
    User --- UC2
    User --- UC3
    User --- UC4
    User --- UC6
    User --- UC7
    User --- UC9
    
    UC4 -. include .-> UC5
    UC4 -. include .-> UC8
```
