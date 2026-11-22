Technology Stack Document
Property Management Analytics Dashboard
Project: Property Management Analytics Dashboard
Course: BBT 2101 – Business Systems Analysis
Document Version: 1.0
Purpose: Define the technologies, frameworks, infrastructure, development tools, and technical architecture to be used to build, test, deploy, and maintain the application.
1. Technology Stack Overview
The application will use a modern web-based architecture consisting of:
Layer	Technology
Frontend	React
Programming Language	TypeScript
Build Tool	Vite
UI Styling	Tailwind CSS
UI Components	shadcn/ui
Backend	Serverless Edge Functions
Database	PostgreSQL
Database Security	PostgreSQL Row-Level Security
File Storage	S3
Payment Gateway	M-Pesa
Hosting	Edge CDN
Deployment	Automated CI/CD
Security	SSL/HTTPS
Diagrams	Lucidchart
Source Control	GitHub


These technologies are the technology choices identified in the project presentation.  property_dashboard_presentation
2. Technology Architecture
The application will follow a layered web application architecture.
┌─────────────────────────────────────────────────────┐
│                    USER LAYER                       │
│                                                     │
│              Administrator / Browser               │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                  │
│                                                     │
│ React + TypeScript + Vite                           │
│ Tailwind CSS + shadcn/ui                            │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                  │
│                                                     │
│ Serverless Edge Functions                           │
│                                                     │
│ Authentication                                      │
│ Business Logic                                      │
│ Analytics Calculations                              │
│ API Endpoints                                       │
│ M-Pesa Webhooks                                     │
└───────────────┬───────────────────┬─────────────────┘
                │                   │
                ▼                   ▼
┌────────────────────────┐   ┌────────────────────────┐
│    DATA LAYER          │   │   EXTERNAL SERVICES    │
│                        │   │                        │
│ PostgreSQL             │   │ M-Pesa                 │
│ Row-Level Security     │   │ Payment Gateway        │
└───────────┬────────────┘   └────────────┬───────────┘
            │                             │
            ▼                             ▼
┌────────────────────────┐       ┌────────────────────┐
│      S3 STORAGE        │       │ Payment Callbacks  │
│                        │       │ / Webhooks         │
└────────────────────────┘       └────────────────────┘

3. Frontend Technology
3.1 React
Purpose: Build the application's user interface.
React will be responsible for creating:
- Dashboard
- Navigation
- Property screens
- Unit management
- Tenant management
- Payment screens
- Maintenance screens
- Expense screens
- Reports
- Charts
- Forms
- Tables
- Modals
Why React?
React is suitable for the project because the application contains many interactive screens and data-driven components that need to update without full-page reloads.
4. Programming Language
4.1 TypeScript
Purpose: Primary programming language for the frontend application.
TypeScript will provide:
- Static typing
- Better development-time error detection
- Typed API responses
- Typed database models/interfaces
- Better maintainability
- Improved IDE support
Example conceptual model
interface Tenant {
  tenantId: string;
  name: string;
  phone: string;
  unitId: string;
}

This makes the structure of application data explicit.
5. Build Tool
5.1 Vite
Purpose: Development server and frontend build system.
Vite will be responsible for:
- Local development
- Fast development builds
- Production builds
- Frontend asset bundling
- Environment configuration
The project presentation explicitly identifies Vite as part of the frontend stack.  property_dashboard_presentation
6. Styling Framework
6.1 Tailwind CSS
Purpose: Application styling and responsive UI design.
Tailwind will be used to build:
- Layouts
- Responsive pages
- Forms
- Tables
- Cards
- Navigation
- Dashboard components
- Buttons
- Alerts
- Modals
Design objective
The application should have a consistent visual language across every screen.
7. UI Component Library
7.1 shadcn/ui
Purpose: Reusable interface components.
shadcn/ui will provide the foundation for components such as:
- Buttons
- Dialogs
- Dropdowns
- Inputs
- Select fields
- Tables
- Cards
- Tabs
- Alerts
- Navigation elements
This reduces the need to build every UI component from scratch while allowing the team to customize the interface.
The project presentation identifies shadcn/ui alongside React, TypeScript, Vite and Tailwind CSS.  property_dashboard_presentation
8. Backend Technology
8.1 Serverless Edge Functions
Purpose: Backend API and business logic.
The backend will handle:
- Authentication logic
- Property operations
- Unit operations
- Tenant operations
- Payment processing
- Expense operations
- Analytics calculations
- Database operations
- M-Pesa callbacks/webhooks
The project specifically identifies serverless edge functions as the backend approach.  property_dashboard_presentation
9. Backend Responsibilities
The backend should sit between the frontend and database.
React Frontend
      │
      │ API Request
      ▼
Edge Function
      │
      ├── Validate Request
      ├── Authenticate User
      ├── Apply Business Rules
      ├── Query Database
      ├── Perform Calculations
      └── Return Response
              │
              ▼
        React Frontend

The frontend should not directly implement critical business logic.
For example, the calculation:
Net Income =
Rent Collected - Total Expenses

should be reliably calculated by the application/backend logic rather than being trusted solely to browser-side calculations.
10. Database Technology
10.1 PostgreSQL
Purpose: Primary relational database.
PostgreSQL will store the application's core data.
Main data groups
Users
Properties
Units
Tenants
Payments
Maintenance Expenses
General Expenses

The project explicitly specifies PostgreSQL as the database.  property_dashboard_presentation
11. PostgreSQL Data Model
Conceptually:
PROPERTY
   │
   └──< UNIT
          │
          └── TENANT
                 │
                 └──< PAYMENT

UNIT
 │
 └──< MAINTENANCE_EXPENSE

GENERAL_EXPENSE

The database should enforce relationships between these records rather than relying exclusively on frontend validation.
12. Database Security
12.1 Row-Level Security
PostgreSQL Row-Level Security (RLS) will be incorporated into the database security design.
The project specifically identifies PostgreSQL with Row-Level Security.  property_dashboard_presentation
The objective is to ensure database records cannot be accessed outside the permissions defined by the application.
Although Version 1 has only one administrator role, implementing appropriate database-level security establishes a stronger foundation for future roles such as:
- Landlord
- Accountant
- Maintenance Staff
Those roles are identified as future iterations in the project scope.  property_dashboard_presentation
13. Authentication
Authentication will protect the administrative application.
Authentication flow
Administrator
      ↓
Username + Password
      ↓
Authentication Service
      ↓
Validate Credentials
      │
 ┌────┴─────┐
 ▼          ▼
Invalid    Valid
 │          │
 ▼          ▼
Error     Session
            │
            ▼
        Dashboard

The functional requirements specifically require username/password login and an on-screen error for invalid attempts.  property_dashboard_presentation
14. Password Security
Passwords must never be stored as plain text.
The project specifies one-way password hashing such as bcrypt.  property_dashboard_presentation
Conceptually:
User Password
      ↓
Secure Hash Function
      ↓
Password Hash
      ↓
PostgreSQL

During authentication:
Entered Password
      ↓
Hash Verification
      ↓
Compare with Stored Hash

15. Payment Technology
15.1 M-Pesa
Purpose: Rent payment processing.
M-Pesa is the external payment gateway specified in the project.  property_dashboard_presentation
The system should integrate M-Pesa for rent collection and payment confirmation.
16. M-Pesa Integration Architecture
                    TENANT
                       │
                       ▼
                  M-PESA
                       │
                       ▼
                Payment Process
                       │
                       ▼
              Payment Confirmation
                       │
                       ▼
             Webhook / Callback
                       │
                       ▼
              Serverless Function
                       │
                       ▼
                Validate Data
                       │
                       ▼
                PostgreSQL
                       │
                       ▼
              Payment Record
                       │
                       ▼
                 Analytics
                       │
                       ▼
                  Dashboard

The implementation plan specifically assigns an M-Pesa gateway integration and webhook listener.  property_dashboard_presentation
17. Payment Data Requirements
A payment record should conceptually contain:
Field	Purpose
Payment ID	Unique payment
Tenant ID	Tenant making payment
Unit ID	Associated unit
Amount	Amount paid
Payment Date	Date payment was made
Status	Payment status
Transaction Reference	M-Pesa transaction reference


The exact final database schema should be confirmed during ERD/database design.
18. File Storage
18.1 Amazon S3
Purpose: File/object storage.
The project identifies S3 storage as part of the backend infrastructure.  property_dashboard_presentation
Potential uses include future storage of:
- Property documents
- Receipts
- Maintenance photographs
- Tenant documents
- Reports
- Other property-related files
Important scope distinction
File storage is part of the identified technology stack, but the current functional requirements do not define a specific document-management feature.
Therefore:
S3 is part of the technical architecture, but document management should not be treated as a mandatory Version 1 feature unless the team explicitly adds it to the requirements.

19. Hosting
19.1 Edge CDN
The project specifies deployment using an Edge CDN.  property_dashboard_presentation
The hosting layer will deliver the web application to users.
Conceptually:
GitHub
   ↓
CI/CD Pipeline
   ↓
Production Build
   ↓
Edge CDN
   ↓
Administrator Browser

20. SSL / HTTPS
The application will use SSL/HTTPS.
This is particularly important because the application handles:
- Authentication
- Tenant information
- Payment information
- Financial information
The project identifies SSL as part of the hosting approach.  property_dashboard_presentation
21. CI/CD
Automated Deployment
The project specifies automated CI/CD.
The intended flow is:
Developer
   ↓
Git Commit
   ↓
GitHub
   ↓
CI/CD Pipeline
   ↓
Build
   ↓
Tests
   ↓
Deployment
   ↓
Edge CDN

This allows the team to continuously integrate changes while reducing manual deployment work.
22. Source Control
22.1 GitHub
Purpose:
- Source-code management
- Collaboration
- Version control
- Branch management
- Code review
- Project history
The project identifies GitHub as the collaboration tool.  property_dashboard_presentation
23. Recommended Git Workflow
For the team, a simple workflow would be:
main
 │
 ├── develop
 │
 ├── feature/authentication
 │
 ├── feature/dashboard
 │
 ├── feature/tenants
 │
 ├── feature/payments
 │
 └── feature/expenses

Developers should work on feature branches and merge completed work into the shared development branch before production.
This branching strategy is a recommended implementation practice, not a requirement explicitly stated in the project presentation.
24. API Architecture
The backend should expose APIs through serverless edge functions.
Conceptual API structure:
/api
 │
 ├── /auth
 │
 ├── /properties
 │
 ├── /units
 │
 ├── /tenants
 │
 ├── /payments
 │
 ├── /maintenance
 │
 ├── /expenses
 │
 └── /analytics

The exact endpoint naming should be finalized during system architecture design.
25. API Responsibilities
Authentication API
POST /auth/login

Responsible for:
- Receiving credentials
- Validating credentials
- Creating authenticated session
Unit API
Potential operations:
GET    /units
POST   /units
GET    /units/:id
PUT    /units/:id
DELETE /units/:id

Tenant API
GET    /tenants
POST   /tenants
GET    /tenants/:id
PUT    /tenants/:id
DELETE /tenants/:id

Payment API
GET  /payments
GET  /payments/:id
POST /payments/webhook

The webhook endpoint is particularly important for M-Pesa integration.
Expense APIs
GET    /maintenance
POST   /maintenance
PUT    /maintenance/:id
DELETE /maintenance/:id

and:
GET    /expenses
POST   /expenses
PUT    /expenses/:id
DELETE /expenses/:id

Analytics API
Potential endpoint:
GET /analytics/dashboard?month=2026-10

The API could return:
{
  "totalUnits": 100,
  "occupiedUnits": 85,
  "occupancyRate": 85.0,
  "rentCollected": 2500000,
  "totalExpenses": 650000,
  "netIncome": 1850000
}

This is an illustrative API structure, not a confirmed implementation requirement.
26. Frontend Architecture
The React application should be organized into reusable components.
src/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── properties/
│   ├── units/
│   ├── tenants/
│   ├── payments/
│   ├── expenses/
│   └── reports/
│
├── pages/
│   ├── Login
│   ├── Dashboard
│   ├── Properties
│   ├── Units
│   ├── Tenants
│   ├── Payments
│   ├── Maintenance
│   ├── Expenses
│   └── Reports
│
├── services/
│
├── types/
│
├── hooks/
│
└── utils/

This structure is recommended for maintainability; the project source specifies the frontend technologies but does not prescribe a particular folder structure.
27. State Management
The frontend will need to manage:
- Authentication state
- Current administrator session
- Dashboard data
- Selected month
- Form state
- Loading states
- Error states
- Table/filter state
The specific state-management library is not specified in the project source.
Therefore, the project should not add a state-management library such as Redux or Zustand unless the team determines it is necessary.
For the current application size, React's built-in state mechanisms may be sufficient.
28. Data Validation
Validation should occur at multiple levels.
Frontend Validation
       ↓
Backend Validation
       ↓
Database Constraints

Example
For unit creation:
Unit ID
   ↓
Required?
   ↓
Unique?
   ↓
Valid Format?
   ↓
Backend Validation
   ↓
Database Constraint

This prevents invalid data from entering the system.
29. Business Logic Layer
The backend should contain the major business calculations.
Occupancy
Occupied Units
÷
Total Units
× 100

Total Expenses
Maintenance Expenses
+
General Expenses

Net Income
Rent Collected
-
Total Expenses

These calculations are directly connected to the functional requirements.  property_dashboard_presentation
30. Analytics Technology Flow
PostgreSQL
     ↓
Serverless Edge Function
     ↓
Aggregate Data
     ↓
Calculate KPIs
     ↓
Return Structured Data
     ↓
React
     ↓
Dashboard Cards
     +
Charts
     +
Tables

31. Charting
The application requires visual analytics, including income vs expenses or occupancy over time.  property_dashboard_presentation
A charting library is not explicitly specified in the project source.
Therefore, the technology choice for charting should be finalized during implementation.
The key requirement is that the selected library must support:
- Line charts
- Bar charts
- Responsive rendering
- Dynamic data
- Date-based datasets
32. Performance Architecture
The project specifies:
Dashboard loads within 3 seconds with up to 500 property/unit records.  property_dashboard_presentation

To support this requirement:
Browser
   ↓
Optimized API
   ↓
Efficient Database Query
   ↓
Aggregated Results
   ↓
Small Response Payload
   ↓
Fast Dashboard Rendering

The application should avoid downloading unnecessary historical data to the browser.
33. Reliability Architecture
The project requires data to be committed to PostgreSQL immediately so that information is not lost during a crash or restart.  property_dashboard_presentation
The flow should therefore be:
User Action
    ↓
Backend
    ↓
Database Transaction
    ↓
Successful Commit
    ↓
Response to User

The UI should not display an operation as successful until the backend confirms the database operation.
34. Security Architecture
The overall security model should be:
             ┌─────────────────┐
             │ Administrator   │
             └────────┬────────┘
                      │
                 HTTPS/SSL
                      │
                      ▼
             ┌─────────────────┐
             │ Authentication  │
             └────────┬────────┘
                      │
                  Session
                      │
                      ▼
             ┌─────────────────┐
             │ Edge Functions  │
             └────────┬────────┘
                      │
                Authorization
                      │
                      ▼
             ┌─────────────────┐
             │   PostgreSQL    │
             │      + RLS      │
             └─────────────────┘

35. External System Integration
The main external integration in Version 1 is:
PROPERTY MANAGEMENT SYSTEM
          │
          │
          ▼
       M-PESA

The project explicitly identifies M-Pesa as the payment gateway.  property_dashboard_presentation
Other external integrations are not currently specified.
36. Development Tools
Tool	Purpose
GitHub	Version control/collaboration
Lucidchart	ERD, architecture and system diagrams
React	Frontend
TypeScript	Programming language
Vite	Build/development
Tailwind CSS	Styling
shadcn/ui	UI components
PostgreSQL	Database
Edge Functions	Backend
S3	Storage
Edge CDN	Hosting
CI/CD	Automated deployment


The first two tools are explicitly identified under the project's "Tools & Techniques" section.  property_dashboard_presentation
37. Environment Structure
The project should maintain separate environments:
Development
     ↓
Testing
     ↓
Production

Development
Used by developers for active implementation.
Testing
Used for integration and end-to-end testing.
Production
Used by the final deployed application.
This separation is recommended to reduce the risk of development changes affecting the live system.
38. Environment Variables
Sensitive configuration should not be hardcoded into the source code.
Examples include:
DATABASE_URL
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_CALLBACK_URL
AUTH_SECRET
S3_ACCESS_KEY
S3_SECRET_KEY

These are examples of configuration values; the exact names depend on the final implementation.
39. Testing Technology Strategy
The project work plan explicitly includes:
- Unit testing
- Integration testing
- End-to-end testing
- Bug fixing  property_dashboard_presentation
Testing pyramid
             ┌───────────────┐
             │ End-to-End    │
             └───────┬───────┘
                     │
             ┌───────▼───────┐
             │ Integration   │
             └───────┬───────┘
                     │
        ┌────────────▼────────────┐
        │       Unit Tests        │
        └─────────────────────────┘

The specific testing framework is not defined in the project source and should be selected during implementation.
40. Testing Scope
Unit Tests
Test:
- Occupancy calculation
- Net-income calculation
- Expense calculation
- Payment-status calculation
- Validation functions
Integration Tests
Test:
- Frontend → API
- API → PostgreSQL
- M-Pesa → webhook → database
- Database → analytics
End-to-End Tests
Test complete workflows:
Login
 ↓
Create Unit
 ↓
Create Tenant
 ↓
Assign Tenant
 ↓
Record Payment
 ↓
Record Expense
 ↓
View Dashboard

41. Technology Decision Matrix
Requirement	Technology	Reason
Interactive UI	React	Component-based interface
Type safety	TypeScript	Safer application development
Fast builds	Vite	Modern frontend build tooling
Styling	Tailwind CSS	Rapid consistent styling
UI components	shadcn/ui	Reusable components
Backend	Edge Functions	Serverless backend
Relational data	PostgreSQL	Structured property/payment data
Database security	RLS	Database-level access control
Payments	M-Pesa	Rent payment processing
File storage	S3	Object/file storage
Hosting	Edge CDN	Web application delivery
Deployment	CI/CD	Automated delivery
Version control	GitHub	Team collaboration
Diagrams	Lucidchart	System design


42. Technology Stack Diagram
The final stack can be summarized as:
┌─────────────────────────────────────────────────────┐
│                     FRONTEND                        │
│                                                     │
│  React                                              │
│  TypeScript                                         │
│  Vite                                               │
│  Tailwind CSS                                       │
│  shadcn/ui                                          │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                     BACKEND                         │
│                                                     │
│  Serverless Edge Functions                          │
│  Authentication                                     │
│  Business Logic                                     │
│  Analytics                                          │
│  M-Pesa Webhooks                                    │
└──────────────┬───────────────────┬──────────────────┘
               │                   │
               ▼                   ▼
┌──────────────────────┐   ┌─────────────────────────┐
│      DATABASE        │   │    EXTERNAL SERVICES    │
│                      │   │                         │
│ PostgreSQL           │   │ M-Pesa                  │
│ Row-Level Security   │   │ S3                      │
└──────────┬───────────┘   └─────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│                    HOSTING                          │
│                                                     │
│ Edge CDN                                             │
│ SSL / HTTPS                                         │
│ Automated CI/CD                                     │
└─────────────────────────────────────────────────────┘

43. Confirmed vs Recommended Technology
To avoid accidentally presenting assumptions as requirements, the technology decisions should be classified as follows.
Confirmed by Project
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Row-Level Security
- Serverless Edge Functions
- S3
- Edge CDN
- CI/CD
- SSL
- Lucidchart
- GitHub
- M-Pesa
These are explicitly listed in the project's technology/tool section.  property_dashboard_presentation
Not Yet Specified
The project source does not specify:
- Exact React routing library
- Exact state-management library
- Exact charting library
- Exact testing framework
- Exact authentication library/service
- Exact API naming convention
- Exact database migration tool
- Exact logging/monitoring platform
- Exact CI/CD provider
- Exact S3-compatible implementation
- Exact deployment provider
These should be decided during the detailed system design/implementation stage rather than being treated as already approved project requirements.
44. Final Recommended Stack
For the project documentation, I would present the final stack as:
FRONTEND
React
TypeScript
Vite
Tailwind CSS
shadcn/ui

BACKEND
Serverless Edge Functions

DATABASE
PostgreSQL
Row-Level Security

PAYMENTS
M-Pesa

STORAGE
S3

HOSTING
Edge CDN
SSL/HTTPS
Automated CI/CD

DEVELOPMENT
GitHub
Lucidchart