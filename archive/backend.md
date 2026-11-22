
# Backend Schema Document
## Property Management Analytics Dashboard

**Course:** BBT 2101 – Business Systems Analysis  
**Project:** Property Management Analytics Dashboard  
**Database:** PostgreSQL  
**Backend:** Serverless Edge Functions  
**Security:** PostgreSQL Row-Level Security (RLS)  
**Storage:** S3  
**Payment Integration:** M-Pesa  

---

## 1. Purpose

This document defines the proposed backend database schema for the Property Management Analytics Dashboard.

The schema provides a centralised structure for managing:

- Properties
- Units
- Tenants
- Rent payments
- Maintenance expenses
- General expenses
- Neon Auth user profiles and dashboard state

The database supports the dashboard's main analytics, including occupancy rate, rent collected, expenses, net income and tenant payment status.

The project requirements specify PostgreSQL as the database, with Row-Level Security and serverless edge functions forming part of the backend architecture.

---

# 2. Database Objectives

The database should:

1. Provide a single source of truth for property management data.
2. Maintain relationships between properties, units, tenants and payments.
3. Record maintenance and general expenses.
4. Support monthly financial calculations.
5. Support automatic occupancy calculations.
6. Track tenant payment status.
7. Support M-Pesa payment callbacks.
8. Protect data using appropriate access controls.
9. Commit data reliably to PostgreSQL.
10. Support up to 500 property/unit records while maintaining the required dashboard performance.

The reliability requirement states that data should commit to PostgreSQL immediately so that information is not lost following a crash or restart.

---

# 3. Core Database Entities

The proposed core entities are:

```text
NEON_AUTH_USER
    |
    | manages
    v
PROPERTY
    |
    | contains
    v
UNIT
    |
    | assigned to
    v
TENANT
    |
    | makes
    v
RENT_PAYMENT


UNIT
    |
    | has
    v
MAINTENANCE_EXPENSE


PROPERTY
    |
    | has
    v
GENERAL_EXPENSE
```

The relationships reflect the functional requirements for managing units, tenants, rent payments and expenses.

---

# 4. Authentication

Neon Managed Better Auth manages account creation, sign-in, password handling, and sessions. User credentials, sessions, and auth configuration are stored by Neon in the `neon_auth` schema. API routes validate Neon Auth bearer tokens against the branch JWKS and issuer, then derive the owner ID from the verified token `sub` claim.

Each database request runs in a transaction and sets `app.user_id` to that verified ID using transaction-local `set_config`. RLS policies use that setting to restrict profiles, dashboard state, and owner-scoped records. The browser must never submit an authoritative owner ID.

`user_dashboard_state` stores each user's dashboard data as JSONB. It starts empty for a new Neon Auth user. `user_profiles` stores the corresponding Neon Auth ID and optional display-profile fields. Existing Clerk IDs and their data remain as legacy, unmapped rows after the auth migration; they are not attached to new accounts.

---

# 5. Entity: Property

A property represents the overall property being managed.

Although the functional requirements focus specifically on units, tenants and financial information, a property-level entity is recommended so that units and expenses can be organised under individual properties.

### Table: `properties`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique property ID |
| `name` | VARCHAR | NOT NULL | Property name |
| `location` | VARCHAR | NULL | Property location |
| `created_at` | TIMESTAMP | NOT NULL | Creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

### Relationship

```text
PROPERTY 1 ──────── * UNIT
```

One property can contain multiple units.

---

# 6. Entity: Unit

The unit is one of the main operational entities in the system.

FR2 requires the administrator to add, edit or delete a unit with:

- Unique ID
- Rent in KES
- Occupancy status



### Table: `units`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique unit ID |
| `property_id` | UUID | FK → properties.id | Property containing the unit |
| `unit_number` | VARCHAR | NOT NULL | Unit identifier |
| `monthly_rent` | NUMERIC(12,2) | NOT NULL | Monthly rent in KES |
| `occupancy_status` | VARCHAR | NOT NULL | Occupied/Vacant |
| `created_at` | TIMESTAMP | NOT NULL | Creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

### Occupancy Status

Recommended allowed values:

```text
OCCUPIED
VACANT
```

### Business Rule

Each unit belongs to one property.

```text
PROPERTY 1 ──────── * UNIT
```

---

# 7. Entity: Tenant

FR3 requires administrators to add/edit tenants and assign each tenant to exactly one unit.

### Table: `tenants`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique tenant ID |
| `unit_id` | UUID | FK → units.id | Tenant's assigned unit |
| `full_name` | VARCHAR | NOT NULL | Tenant name |
| `phone_number` | VARCHAR | NULL | Tenant contact number |
| `email` | VARCHAR | NULL | Tenant email |
| `created_at` | TIMESTAMP | NOT NULL | Creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

### Relationship

```text
UNIT 1 ──────── 1 TENANT
```

For the Phase 1 business rule, a tenant is assigned to exactly one unit.

The schema should enforce that a tenant cannot exist without an assigned unit.

---

# 8. Entity: Rent Payment

Rent payments are central to the dashboard's financial analytics.

FR5 requires the system to record:

- Tenant
- Amount
- Date
- Tenant/unit relationship

FR6 requires the system to show whether each tenant has paid or is unpaid for the current month.

### Table: `rent_payments`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique payment ID |
| `tenant_id` | UUID | FK → tenants.id | Tenant making payment |
| `unit_id` | UUID | FK → units.id | Unit associated with payment |
| `amount` | NUMERIC(12,2) | NOT NULL | Amount paid in KES |
| `payment_date` | DATE | NOT NULL | Date payment was received |
| `payment_method` | VARCHAR | NOT NULL | Payment method |
| `payment_status` | VARCHAR | NOT NULL | Payment state |
| `transaction_reference` | VARCHAR | UNIQUE | External payment reference |
| `created_at` | TIMESTAMP | NOT NULL | Record creation date |

### Recommended Payment Status Values

```text
PENDING
CONFIRMED
FAILED
```

### Recommended Payment Method

```text
MPESA
```

The exact status values and field names are implementation decisions rather than explicitly defined in the project presentation.

---

# 9. M-Pesa Payment Integration

The project identifies M-Pesa as an external payment gateway.

The intended flow is:

```text
Tenant
   |
   | Rent payment
   v
M-Pesa
   |
   | Callback / confirmation
   v
Edge Function
   |
   | Validate & process
   v
PostgreSQL
   |
   v
rent_payments
```

The M-Pesa gateway processes rent payments and notifies the system through a callback once the payment is confirmed.

### Recommended additional table: `payment_transactions`

This table can store gateway-specific information separately from the main rent-payment record.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Transaction ID |
| `payment_id` | UUID | FK | Related rent payment |
| `provider` | VARCHAR | NOT NULL | Payment provider |
| `provider_reference` | VARCHAR | UNIQUE | M-Pesa transaction reference |
| `request_reference` | VARCHAR | NULL | Gateway request/reference |
| `status` | VARCHAR | NOT NULL | Gateway transaction status |
| `callback_received_at` | TIMESTAMP | NULL | Callback timestamp |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

This table is a **recommended implementation enhancement**. The project confirms the M-Pesa integration and webhook requirement but does not prescribe a specific transaction table structure.

---

# 10. Entity: Maintenance Expense

FR7 requires maintenance expenses to record:

- Unit
- Description
- Cost
- Date



### Table: `maintenance_expenses`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique expense ID |
| `unit_id` | UUID | FK → units.id | Unit receiving maintenance |
| `description` | TEXT | NOT NULL | Description of maintenance |
| `cost` | NUMERIC(12,2) | NOT NULL | Maintenance cost in KES |
| `expense_date` | DATE | NOT NULL | Date expense occurred |
| `created_at` | TIMESTAMP | NOT NULL | Record creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

### Relationship

```text
UNIT 1 ──────── * MAINTENANCE_EXPENSE
```

---

# 11. Entity: General Expense

FR8 requires general expenses to record:

- Category
- Amount
- Date



### Table: `general_expenses`

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique expense ID |
| `property_id` | UUID | FK → properties.id | Property associated with expense |
| `category` | VARCHAR | NOT NULL | Expense category |
| `amount` | NUMERIC(12,2) | NOT NULL | Expense amount in KES |
| `expense_date` | DATE | NOT NULL | Date expense occurred |
| `description` | TEXT | NULL | Optional description |
| `created_at` | TIMESTAMP | NOT NULL | Record creation date |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

### Relationship

```text
PROPERTY 1 ──────── * GENERAL_EXPENSE
```

---

# 12. Entity Relationship Model

The overall database relationship can be represented as:

```text
┌───────────────────┐
│    PROPERTIES     │
├───────────────────┤
│ id PK             │
│ name              │
│ location          │
└─────────┬─────────┘
          │
          │ 1:M
          ▼
┌───────────────────┐
│       UNITS       │
├───────────────────┤
│ id PK             │
│ property_id FK    │
│ unit_number       │
│ monthly_rent      │
│ occupancy_status  │
└───────┬─────┬─────┘
        │     │
        │     │ 1:M
        │     ▼
        │  ┌─────────────────────┐
        │  │ MAINTENANCE_EXPENSES│
        │  ├─────────────────────┤
        │  │ id PK               │
        │  │ unit_id FK          │
        │  │ description         │
        │  │ cost                │
        │  │ expense_date        │
        │  └─────────────────────┘
        │
        │ 1:1
        ▼
┌───────────────────┐
│      TENANTS      │
├───────────────────┤
│ id PK             │
│ unit_id FK        │
│ full_name         │
│ phone_number      │
│ email             │
└─────────┬─────────┘
          │
          │ 1:M
          ▼
┌───────────────────┐
│   RENT_PAYMENTS   │
├───────────────────┤
│ id PK             │
│ tenant_id FK      │
│ unit_id FK        │
│ amount            │
│ payment_date      │
│ payment_method    │
│ payment_status    │
│ transaction_ref   │
└───────────────────┘


┌─────────────────────┐
│  GENERAL_EXPENSES   │
├─────────────────────┤
│ id PK               │
│ property_id FK      │
│ category            │
│ amount              │
│ expense_date        │
│ description         │
└─────────────────────┘
```

---

# 13. Key Relationships

| Relationship | Cardinality | Purpose |
|---|---:|---|
| Property → Unit | 1:M | A property contains multiple units |
| Unit → Tenant | 1:1 | A tenant is assigned to one unit |
| Tenant → Rent Payment | 1:M | A tenant can make multiple payments |
| Unit → Rent Payment | 1:M | A unit can have multiple rent payments |
| Unit → Maintenance Expense | 1:M | A unit can have multiple maintenance expenses |
| Property → General Expense | 1:M | A property can have multiple general expenses |

---

# 14. Dashboard Calculations

The schema is designed to support the calculations specified in FR4 and FR9.

## 14.1 Occupancy Rate

```text
Occupancy Rate =
(Occupied Units ÷ Total Units) × 100
```

The result should be displayed to **1 decimal place**.

Example:

```text
Total Units = 20
Occupied Units = 16

Occupancy Rate =
16 ÷ 20 × 100
= 80.0%
```

---

## 14.2 Rent Collected

For a selected month:

```text
Rent Collected =
SUM(confirmed rent payments)
```

---

## 14.3 Total Expenses

```text
Total Expenses =
Maintenance Expenses
+
General Expenses
```

---

## 14.4 Net Income

```text
Net Income =
Rent Collected − Total Expenses
```

The dashboard must be able to show rent collected, total expenses and net income for a chosen month.

---

# 15. Monthly Payment Status

The system must determine whether each tenant has paid or is unpaid for the current month.

Conceptually:

```text
For each active tenant:

IF confirmed payment exists
for the current month
    → PAID
ELSE
    → UNPAID
```

This status can be calculated dynamically rather than stored as a separate field.

### Recommended approach

Do **not** store `paid/unpaid` permanently in the tenant table.

Instead, calculate it from `rent_payments`.

This prevents the database from having conflicting information.

---

# 16. Database Constraints

The following constraints are recommended.

### Primary Keys

Every core table should have a unique primary key.

```text
UUID
```

### Foreign Keys

Foreign keys should maintain relationships between entities.

Examples:

```text
units.property_id
        → properties.id

tenants.unit_id
        → units.id

rent_payments.tenant_id
        → tenants.id

rent_payments.unit_id
        → units.id

maintenance_expenses.unit_id
        → units.id

general_expenses.property_id
        → properties.id
```

### Required Values

Important financial and relationship fields should not accept NULL values.

Examples:

```text
monthly_rent
amount
cost
expense_date
payment_date
tenant_id
unit_id
```

### Financial Values

Money should use:

```text
NUMERIC(12,2)
```

rather than floating-point types.

---

# 17. Data Integrity Rules

The backend should enforce the following rules:

### Rule 1 — Unique Units

Each unit must have a unique identifier within its property.

### Rule 2 — Tenant Assignment

A tenant must be assigned to one unit.

### Rule 3 — Valid Payments

A rent payment must reference an existing tenant and unit.

### Rule 4 — Valid Expenses

Maintenance expenses must reference an existing unit.

### Rule 5 — Positive Financial Values

Rent, payment and expense amounts should not be negative.

### Rule 6 — Payment Verification

A payment should only contribute to financial analytics once it has been confirmed.

### Rule 7 — Occupancy Consistency

Occupancy should be derived from unit occupancy data rather than manually entered into dashboard analytics.

---

# 18. Row-Level Security

PostgreSQL Row-Level Security is part of the specified technology stack.

Because Phase 1 has only one direct system-user role — Administrator/Property Manager — the initial security model can be simple.

### Phase 1

```text
Administrator
     |
     ├── Read properties
     ├── Create/update/delete units
     ├── Create/update tenants
     ├── Record expenses
     ├── View payments
     └── View analytics
```

The database should prevent unauthorised users from directly accessing protected records.

### Future Expansion

The presentation states that Landlord/Owner, Maintenance Staff and Accountant accounts may be introduced in a future iteration.

The RLS design should therefore be structured so that additional roles can be introduced later.

---

# 19. Backend Access Layer

The application should not allow the frontend to directly perform unrestricted database operations.

The intended architecture is:

```text
React Frontend
       |
       v
Serverless Edge Functions
       |
       v
PostgreSQL
```

The project specifically identifies serverless edge functions as the database access layer and backend implementation technology.

Edge functions should handle:

- Authentication
- Validation
- CRUD operations
- Business rules
- Occupancy calculations
- Financial calculations
- Payment processing
- M-Pesa callbacks
- Dashboard data aggregation

---

# 20. Recommended Backend API Structure

The exact API naming convention is **not specified in the project source**, so the following is a recommended implementation structure. Protected endpoints verify Neon Auth bearer tokens; Neon Managed Better Auth handles account creation, sign-in, and sign-out.

```text
/properties
    GET    /properties
    POST   /properties
    GET    /properties/:id
    PATCH  /properties/:id
    DELETE /properties/:id

/units
    GET    /units
    POST   /units
    PATCH  /units/:id
    DELETE /units/:id

/tenants
    GET    /tenants
    POST   /tenants
    PATCH  /tenants/:id

/payments
    GET    /payments
    POST   /payments

/mpesa
    POST   /callback

/expenses
    GET    /expenses
    POST   /expenses

/dashboard
    GET    /summary
    GET    /occupancy
    GET    /income-expenses
```

These endpoints are proposed for implementation and are not requirements explicitly stated in the presentation.

---

# 21. Dashboard Query Structure

The dashboard will need aggregated queries rather than retrieving every individual record whenever possible.

A conceptual dashboard response could contain:

```text
Dashboard Summary

{
    occupancyRate,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    rentCollected,
    totalExpenses,
    netIncome,
    paidTenants,
    unpaidTenants
}
```

This allows the frontend to receive the information required for the KPI cards and charts in a single dashboard request.

---

# 22. Performance Considerations

NFR1 requires the dashboard to load within **3 seconds** with up to **500 property/unit records**.

Recommended database optimisations include indexes on:

```text
properties.id

units.property_id
units.occupancy_status

tenants.unit_id

rent_payments.tenant_id
rent_payments.unit_id
rent_payments.payment_date
rent_payments.payment_status

maintenance_expenses.unit_id
maintenance_expenses.expense_date

general_expenses.property_id
general_expenses.expense_date
```

These indexes are implementation recommendations intended to support the stated performance requirement.

---

# 23. Transaction Handling

Database transactions should be used where multiple related records must be updated together.

For example, when confirming a payment:

```text
BEGIN

1. Validate M-Pesa callback
2. Verify transaction reference
3. Create/update payment transaction
4. Create confirmed rent payment
5. Commit

COMMIT
```

If any required operation fails:

```text
ROLLBACK
```

This helps preserve the project's requirement for reliable PostgreSQL data commits.

---

# 24. S3 Storage

S3 storage is included in the project's backend technology stack.

However, the current functional requirements do not explicitly define which files must be stored.

Therefore:

**Confirmed:**

```text
S3 is part of the backend technology stack.
```

**Not yet defined:**

```text
Which specific user-uploaded files are required.
```

If file uploads are later introduced, a recommended table could be:

### `files`

| Field | Type | Description |
|---|---|---|
| `id` | UUID | File ID |
| `entity_type` | VARCHAR | Related entity |
| `entity_id` | UUID | Related record |
| `file_name` | VARCHAR | Original file name |
| `storage_key` | TEXT | S3 object key |
| `created_at` | TIMESTAMP | Upload timestamp |

This should remain optional until the project defines a concrete file-upload requirement.

---

# 25. Auditability

For a production implementation, the backend may also maintain an audit log.

### Recommended table: `audit_logs`

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Audit record ID |
| `user_id` | VARCHAR | Neon Auth ID of the user performing the action |
| `action` | VARCHAR | CREATE/UPDATE/DELETE |
| `entity_type` | VARCHAR | Affected entity |
| `entity_id` | UUID | Affected record |
| `created_at` | TIMESTAMP | Action time |

This is a **recommended enhancement**, not a functional requirement currently specified in the project presentation.

---

# 26. Schema Summary

| Table | Primary Purpose |
|---|---|
| `properties` | Property information |
| `units` | Property units and occupancy |
| `tenants` | Tenant records and unit assignment |
| `rent_payments` | Rent payment records |
| `payment_transactions` | M-Pesa transaction tracking |
| `maintenance_expenses` | Unit maintenance costs |
| `general_expenses` | General property expenses |
| `files` | Optional S3 file metadata |
| `audit_logs` | Optional activity tracking |

---

# 27. Implementation Priority

### Phase 1 — Core Schema

Required for the MVP:

```text
properties
units
tenants
rent_payments
maintenance_expenses
general_expenses
```

### Phase 2 — Payment Integration

```text
payment_transactions
M-Pesa callback handling
```

### Phase 3 — Supporting Infrastructure

```text
S3 file metadata
audit logs
additional role support
```

The project work plan places PostgreSQL schema/RLS and the database access layer before backend business logic and M-Pesa integration.

---

# 28. Final Backend Architecture

```text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │  Dashboard / Forms    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Serverless Edge      │
                    │ Functions            │
                    │                      │
                    │ • Authentication     │
                    │ • Validation         │
                    │ • Business Logic     │
                    │ • Calculations       │
                    │ • APIs               │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐              ┌────────────────┐
       │   PostgreSQL    │              │      S3        │
       │                 │              │    Storage     │
       │ • Properties    │              └────────────────┘
       │ • Units         │
       │ • Tenants       │
       │ • Payments      │
       │ • Expenses      │
       │ • RLS           │
       └────────┬────────┘
                ▲
                │
       ┌────────┴────────┐
       │     M-Pesa      │
       │ Payment Gateway │
       └─────────────────┘
```

---

# 29. Schema-to-Requirement Traceability

| Requirement | Database Component |
|---|---|
| FR1 – Account authentication | Neon Managed Better Auth accounts and sessions |
| FR2 – Manage units | `properties`, `units` |
| FR3 – Manage tenants | `tenants`, `units` |
| FR4 – Occupancy calculation | `units.occupancy_status` |
| FR5 – Record rent payments | `rent_payments`, `payment_transactions` |
| FR6 – Paid/unpaid status | `rent_payments` |
| FR7 – Maintenance expenses | `maintenance_expenses` |
| FR8 – General expenses | `general_expenses` |
| FR9 – Monthly financial summary | `rent_payments`, `maintenance_expenses`, `general_expenses` |
| FR10 – Analytics charts | Aggregated queries across the above tables |
| NFR2 – Password security | Neon Managed Better Auth credentials |
| NFR3 – Data reliability | PostgreSQL transactions/commits |
| NFR1 – Performance | Indexing and efficient aggregation |

---

# 30. Final Schema Decision

The recommended core relational structure is:

```text
PROPERTIES
     │
     └── UNITS
          │
          ├── TENANTS
          │     │
          │     └── RENT_PAYMENTS
          │
          └── MAINTENANCE_EXPENSES

PROPERTIES
     │
     └── GENERAL_EXPENSES
```

This schema provides the database foundation required for the project's Phase 3 **Database Implementation**, followed by the backend business logic, internal APIs and M-Pesa integration planned in Phase 4.

**Important:** The entities and relationships directly required by the project have been separated from implementation recommendations such as `payment_transactions`, `audit_logs`, `files`, specific API endpoints and particular indexes. These recommendations can be finalised during the system-design/implementation stage.