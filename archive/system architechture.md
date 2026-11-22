Product Requirements Document (PRD)
Property Management Analytics Dashboard
Project: Property Management Analytics Dashboard
Course: BBT 2101 – Business Systems Analysis
Version: 1.0
Primary User: Administrator / Property Manager
Database: PostgreSQL
Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
Backend: Serverless Edge Functions
Payment Gateway: M-Pesa
Storage: S3
Hosting: Edge CDN with CI/CD and SSL  
1. Executive Summary
The Property Management Analytics Dashboard is a centralized web-based system designed to help property managers manage and monitor property operations from a single platform.
The current problem is that property managers rely on scattered spreadsheets to manage properties, units, tenants, rent payments, maintenance expenses, and general expenses. This makes it difficult to obtain an accurate, real-time view of property performance and can result in delayed decisions, missed payments, uncontrolled maintenance costs, and difficulty determining profitability.  property_dashboard_presentation
The proposed product consolidates this information into one centralized dashboard and provides visual analytics for:
- Occupancy
- Rent collection
- Payment status
- Expenses
- Income
- Net income
- Profitability
- Property performance
The initial version will use an Administrator/Property Manager-only model. Tenants will interact indirectly through the M-Pesa payment process, while additional user types such as landlords, maintenance staff, and accountants are deferred to a future iteration.  property_dashboard_presentation
2. Product Vision
Vision
To provide property managers with a single, reliable and easy-to-use platform for managing property operations and making faster, data-driven decisions.

The system should transform fragmented property management data into actionable information.
Product Goal
The product should allow an administrator to:
1. Manage properties and units.
2. Manage tenants.
3. Track rent payments.
4. Monitor outstanding rent.
5. Record maintenance expenses.
6. Record general expenses.
7. Automatically calculate occupancy.
8. Monitor income and expenses.
9. Determine net income and profitability.
10. Visualize property performance through dashboards and reports.
3. Problem Statement
Property managers currently have difficulty managing property information because relevant data is distributed across multiple spreadsheets.
This creates three major problems:
3.1 Scattered Data
Property, tenant, payment, maintenance and expense information does not exist in a single source of truth.
3.2 Slow Decision-Making
Managers cannot quickly obtain a current picture of property performance.
3.3 Missed Issues
The lack of centralized analytics makes it harder to identify:
- Late or missing rent payments
- High maintenance expenditure
- Increasing expenses
- Low occupancy
- Poor-performing properties
- Reduced profitability
The product addresses these issues by centralizing the information and converting it into actionable KPIs.  property_dashboard_presentation
4. Product Scope
4.1 In Scope
The first release will include:
Property Management
- Property records
- Unit records
- Unit rent
- Occupancy status
Tenant Management
- Tenant records
- Tenant-to-unit assignment
- Tenant information
Rent Management
- Rent payment records
- Payment dates
- Payment amounts
- Payment status
- Current-month payment monitoring
Expense Management
- Maintenance expenses
- General expenses
- Expense categories
- Expense dates
- Expense amounts
Analytics
- Occupancy rate
- Rent collected
- Total expenses
- Net income
- Income vs expenses
- Occupancy trends
Authentication
- Administrator login
- Username/password authentication
- Invalid-login error handling
M-Pesa Integration
- Rent payment processing
- Payment confirmation
- Payment callback/webhook
- Automatic payment-status update
These requirements are directly aligned with the functional requirements identified in the project specification.  property_dashboard_presentation
5. Out of Scope – Version 1
The following should not be included in the first version unless the project scope is deliberately expanded:
- Tenant login accounts
- Landlord login
- Maintenance staff login
- Accountant login
- Payroll
- Property purchase/sale management
- Property valuation
- Lease document management
- Automated accounting
- Bank reconciliation
- Tax management
- AI property forecasting
- Mobile application
- Multi-company management
The presentation specifically identifies Landlord/Owner, Maintenance Staff and Accountant accounts as future functionality after the Administrator-only version has been validated.  property_dashboard_presentation
6. Target Users
6.1 Administrator / Property Manager
Primary user
The administrator will be responsible for:
- Logging into the system
- Managing properties
- Managing units
- Managing tenants
- Monitoring rent
- Recording expenses
- Reviewing analytics
- Monitoring property performance
The Administrator is the only direct system user in Version 1.  property_dashboard_presentation
6.2 Tenant
Indirect user
The tenant does not log into the dashboard.
The tenant's main interaction is:
Pay rent → M-Pesa processes payment → M-Pesa sends callback → system records payment → tenant payment status updates.

This makes the tenant an external participant rather than an authenticated application user.
6.3 M-Pesa
External system
M-Pesa acts as the payment processor.
Its responsibility is to:
1. Receive/process rent payment.
2. Confirm successful payment.
3. Send a callback/webhook.
4. Allow the property management system to update the corresponding payment record.
7. User Stories
Authentication
US-01
As an administrator, I want to log in using my username and password so that only authorized users can access the dashboard.
US-02
As an administrator, I want to receive an error message when my credentials are invalid so that I know my login attempt failed.
Property & Unit Management
US-03
As an administrator, I want to add a unit so that I can maintain an accurate record of available rental units.
US-04
As an administrator, I want to edit unit information so that property records remain accurate.
US-05
As an administrator, I want to delete a unit so that outdated records can be removed.
US-06
As an administrator, I want to assign a rent amount to each unit so that expected rental income can be tracked.
US-07
As an administrator, I want to see whether a unit is occupied so that I can monitor occupancy.
8. Tenant Requirements
US-08
As an administrator, I want to create tenant records so that I can associate tenants with rental units.
US-09
As an administrator, I want to edit tenant information so that tenant records remain current.
US-10
As an administrator, I want to assign a tenant to a unit so that the system knows which unit the tenant occupies.
Business Rule
A tenant may be assigned to exactly one unit at a time, as specified by FR3.  property_dashboard_presentation
9. Rent & Payment Requirements
9.1 Payment Recording
The system shall record:
- Tenant
- Unit
- Amount
- Payment date
- Payment status
- Payment reference/transaction information
The core requirement specifies recording a rent payment with tenant, amount and date, linked to the tenant/unit.  property_dashboard_presentation
9.2 Payment Status
The system shall show whether each tenant has:
Paid
or
Unpaid
for the current month.
Example
Tenant	Unit	Monthly Rent	Current Month
Tenant A	A-01	KES 30,000	Paid
Tenant B	A-02	KES 30,000	Unpaid
Tenant C	B-01	KES 35,000	Paid


10. M-Pesa Integration
The system shall integrate with M-Pesa to automate rent payment confirmation.
Proposed flow
Tenant
   ↓
M-Pesa Payment
   ↓
M-Pesa Processing
   ↓
Payment Confirmation
   ↓
Webhook / Callback
   ↓
Backend
   ↓
Payment Record
   ↓
Tenant Payment Status
   ↓
Analytics Dashboard

Requirements
The system must:
1. Receive payment information.
2. Validate the callback.
3. Identify the relevant tenant/payment.
4. Record the transaction.
5. Update payment status.
6. Prevent duplicate payment records.
7. Make the updated information available to the dashboard.
The project plan explicitly includes M-Pesa gateway integration and a webhook listener.  property_dashboard_presentation
11. Maintenance Management
The administrator shall be able to record maintenance expenses.
Each maintenance record should contain:
- Unit
- Description
- Cost
- Date
This directly corresponds to FR7.  property_dashboard_presentation
Example
Unit	Description	Cost	Date
A-01	Plumbing repair	KES 8,000	15 Oct
B-04	Electrical repair	KES 5,500	17 Oct


12. General Expense Management
The administrator shall be able to record expenses unrelated to individual maintenance activities.
Each expense should include:
- Category
- Amount
- Date
Examples:
- Security
- Cleaning
- Utilities
- Administration
- Insurance
- Supplies
- Other
This corresponds to FR8.  property_dashboard_presentation
13. Dashboard Requirements
The dashboard is the core product interface.
It should provide an immediate overview of property performance.
13.1 KPI Cards
The dashboard should display key metrics such as:
Total Units
Number of rental units in the system.
Occupied Units
Number of currently occupied units.
Occupancy Rate
Calculated as:
Occupied Units ÷ Total Units × 100
The result must be displayed to 1 decimal place.  property_dashboard_presentation
Rent Collected
Total rent received during the selected month.
Total Expenses
Total maintenance and general expenses during the selected month.
Net Income
Rent Collected − Total Expenses
14. Analytics
14.1 Income vs Expenses
The dashboard should visually compare:
- Rent income
- Expenses
The administrator should be able to identify whether income is exceeding expenditure.
14.2 Occupancy Analytics
The dashboard should show:
- Current occupancy
- Vacant units
- Occupancy percentage
- Occupancy trend over time
14.3 Payment Analytics
The system should make it easy to identify:
- Paid tenants
- Unpaid tenants
- Total expected rent
- Total collected rent
- Outstanding rent
14.4 Profitability
For a selected month:
Net Income = Rent Collected − Total Expenses
The functional specification explicitly requires rent collected, total expenses and net income to be shown for a chosen month.  property_dashboard_presentation
15. Reporting Requirements
The system should provide visual reports rather than requiring the administrator to manually calculate results.
Minimum Version 1 reporting should include:
Report 1 – Occupancy
- Total units
- Occupied units
- Vacant units
- Occupancy %
Report 2 – Rent Collection
- Expected rent
- Collected rent
- Outstanding rent
- Paid tenants
- Unpaid tenants
Report 3 – Expenses
- Maintenance expenses
- General expenses
- Total expenses
Report 4 – Profitability
- Total income
- Total expenses
- Net income
16. Date / Month Filtering
The analytics dashboard should allow the administrator to select a month.
For example:
< October 2026 >

Changing the selected month should update:
- Rent collected
- Expenses
- Net income
- Payment status
- Income/expense charts
This is important because FR9 specifically requires financial information to be displayed for a chosen month.  property_dashboard_presentation
17. Functional Requirements Matrix
ID	Requirement	Priority
FR1	Administrator login	Must Have
FR2	Add/edit/delete units	Must Have
FR3	Add/edit tenants and assign units	Must Have
FR4	Calculate occupancy rate	Must Have
FR5	Record rent payments	Must Have
FR6	Show current-month payment status	Must Have
FR7	Record maintenance expenses	Must Have
FR8	Record general expenses	Must Have
FR9	Calculate monthly financial performance	Must Have
FR10	Display analytics charts	Must Have
FR11	M-Pesa payment integration	Must Have
FR12	M-Pesa callback/webhook processing	Must Have


FR1–FR10 are directly defined in the source project specification; FR11–FR12 expand the payment-gateway requirement already included in the project architecture/work plan.  property_dashboard_presentation  property_dashboard_presentation
18. Business Rules
BR1 – Unique Unit
Every unit must have a unique identifier.
Example:
A-001
A-002
B-001

BR2 – Tenant Assignment
A tenant can be assigned to exactly one unit at a time.
BR3 – Occupancy
A unit is considered occupied when it has an active tenant assignment.
BR4 – Occupancy Rate
Occupancy Rate =
Occupied Units / Total Units × 100

Rounded to one decimal place.
BR5 – Monthly Payment Status
A tenant is marked Paid when a valid rent payment has been recorded for the relevant month.
Otherwise, the tenant is Unpaid.
BR6 – Net Income
Net Income =
Rent Collected − Total Expenses

BR7 – Expense Classification
Every expense must be classified as either:
- Maintenance expense
- General expense
BR8 – Payment Confirmation
A payment received through M-Pesa should not be marked as successfully paid until the relevant confirmation/callback has been processed.
BR9 – Duplicate Payments
The system should prevent the same M-Pesa transaction from being recorded more than once.
19. Data Requirements
A suitable Version 1 data model should contain at least the following entities.
User
Field	Description
user_id	Unique identifier
username	Login username
password_hash	Encrypted/hashed password
role	Administrator


Property
Field	Description
property_id	Unique property ID
property_name	Property name
location	Property location
created_at	Creation timestamp


Unit
Field	Description
unit_id	Unique unit ID
property_id	Associated property
unit_number	Unit identifier
rent_amount	Monthly rent
occupancy_status	Occupied/Vacant


Tenant
Field	Description
tenant_id	Unique tenant ID
name	Tenant name
phone	Tenant phone
email	Tenant email
unit_id	Assigned unit


Payment
Field	Description
payment_id	Unique payment ID
tenant_id	Tenant
unit_id	Unit
amount	Payment amount
payment_date	Date paid
status	Paid/Pending/Failed
transaction_reference	M-Pesa reference


Maintenance Expense
Field	Description
maintenance_id	Unique ID
unit_id	Related unit
description	Maintenance description
cost	Cost
date	Expense date


General Expense
Field	Description
expense_id	Unique ID
category	Expense category
amount	Amount
date	Expense date


20. High-Level ERD Relationship
The proposed data relationships can be represented as:
PROPERTY
   │
   │ 1:N
   ▼
 UNIT
   │
   │ 1:0..1
   ▼
 TENANT
   │
   │ 1:N
   ▼
 PAYMENT


UNIT
 │
 └──────────────► MAINTENANCE_EXPENSE


GENERAL_EXPENSE

A more complete conceptual structure is:
                    ┌──────────────┐
                    │   PROPERTY   │
                    └──────┬───────┘
                           1│
                            │
                           N│
                    ┌──────▼───────┐
                    │     UNIT     │
                    └───┬─────┬────┘
                        │     │
                       1│     │1
                        │     │
                       0..1   N
                        │     │
                ┌───────▼┐   ┌▼────────────────┐
                │ TENANT │   │   MAINTENANCE   │
                └────┬───┘   │    EXPENSE      │
                     │       └─────────────────┘
                    1│
                     │
                    N│
                ┌────▼─────┐
                │ PAYMENT  │
                └──────────┘

                ┌─────────────────┐
                │ GENERAL EXPENSE │
                └─────────────────┘

The final ERD should be reviewed against the project's database design before implementation.
21. System Architecture Requirements
The presentation identifies the intended technology stack as React/TypeScript/Vite/Tailwind/shadcn/ui on the frontend, PostgreSQL with Row-Level Security and serverless edge functions on the backend, S3 storage, and edge-CDN hosting with CI/CD and SSL.  property_dashboard_presentation
High-level architecture
                    ┌───────────────────┐
                    │ Administrator     │
                    │ Web Browser       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ React Frontend    │
                    │ TypeScript        │
                    │ Tailwind/shadcn   │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Edge Functions    │
                    │ Business Logic    │
                    │ APIs              │
                    └──────┬───────┬────┘
                           │       │
                ┌──────────┘       └───────────┐
                ▼                              ▼
       ┌─────────────────┐             ┌──────────────┐
       │ PostgreSQL      │             │ M-Pesa       │
       │ Database        │             │ Gateway      │
       └─────────────────┘             └──────┬───────┘
                                              │
                                              │ Callback
                                              ▼
                                      ┌──────────────┐
                                      │ Edge Function│
                                      └──────────────┘

22. Security Requirements
Security is particularly important because the system stores:
- Tenant information
- Payment information
- Financial information
- Login credentials
The project specification requires passwords to be stored using a one-way hash such as bcrypt, rather than plain text.  property_dashboard_presentation
Requirements
1. Passwords must never be stored in plain text.
2. Authentication must be required before dashboard access.
3. Database access should use appropriate authorization controls.
4. M-Pesa callbacks must be validated.
5. Sensitive payment information should not be exposed unnecessarily.
6. HTTPS/SSL must be used.
7. Database Row-Level Security should be implemented as planned.
8. Sessions should expire appropriately.
9. Users should not be able to access unauthorized resources.
23. Non-Functional Requirements
The project already establishes five major NFR categories.  property_dashboard_presentation
NFR1 – Performance
The dashboard must load within 3 seconds with up to 500 property/unit records.
Acceptance criteria
With 500 records:
Dashboard initial load ≤ 3 seconds under normal operating conditions.

NFR2 – Security
Passwords must be securely hashed.
The system must also protect financial and tenant data.
NFR3 – Reliability
Data should be committed to PostgreSQL immediately so information is not lost following a crash or restart.
NFR4 – Usability
The interface should be understandable without requiring a user manual.
The UI should use:
- Clear labels
- Consistent navigation
- Familiar terminology
- Clear buttons
- Meaningful error messages
- Simple charts
NFR5 – Compatibility
The application should operate using the existing technology stack without requiring additional infrastructure.  property_dashboard_presentation
24. UI / UX Requirements
The recommended primary navigation is:
Dashboard
│
├── Properties
│
├── Units
│
├── Tenants
│
├── Payments
│
├── Maintenance
│
├── Expenses
│
└── Reports

Dashboard Layout
A recommended layout:
┌─────────────────────────────────────────────────────┐
│ PROPERTY MANAGEMENT DASHBOARD          Oct 2026 ▼  │
├─────────────┬─────────────┬─────────────┬──────────┤
│ Total Units │ Occupied    │ Rent        │ Expenses │
│     120     │    108      │ KES 3.2M    │ KES 850K │
├─────────────┴─────────────┴─────────────┴──────────┤
│                                                     │
│              INCOME VS EXPENSES                     │
│                    📊                               │
│                                                     │
├──────────────────────────────┬──────────────────────┤
│ OCCUPANCY TREND              │ PAYMENT STATUS       │
│ 📈                           │ Paid: 90%            │
│                              │ Unpaid: 10%          │
├──────────────────────────────┴──────────────────────┤
│ Outstanding Payments                                │
│ Tenant     Unit       Rent       Status             │
│ ...                                                 │
└─────────────────────────────────────────────────────┘

25. Error Handling Requirements
The system should provide clear messages for:
Login
"Invalid username or password."

Required Field
"This field is required."

Invalid Amount
"Please enter a valid amount."

Duplicate Unit
"A unit with this ID already exists."

Payment Failure
"Payment could not be confirmed."

M-Pesa Callback Error
"Payment confirmation could not be processed."

Errors should be understandable to a non-technical property manager.
26. Acceptance Criteria
Authentication
Given valid administrator credentials
When the administrator logs in
Then the dashboard should open.
Given invalid credentials
When the administrator attempts to log in
Then an error should be displayed.
Unit Management
Given the administrator is authenticated
When they create a valid unit
Then the unit should appear in the unit list and database.
Tenant Assignment
Given an available unit
When the administrator assigns a tenant
Then the unit should become occupied.
Occupancy
Given 80 occupied units and 100 total units
When the dashboard calculates occupancy
Then it should display:
80.0%
Payment
Given a successful M-Pesa payment
When the callback is received
Then the payment should be recorded and the tenant's payment status updated.
Expenses
Given a maintenance expense of KES 10,000
When the administrator saves the record
Then total expenses should increase by KES 10,000.
Net Income
Given:
- Rent collected = KES 500,000
- Expenses = KES 150,000
Then:
Net Income = KES 350,000
27. Analytics Calculation Requirements
Occupancy
Occupancy %
= (Occupied Units / Total Units) × 100

Round to one decimal place.
Expected Rent
Expected Rent
= Sum of monthly rent of occupied units

Rent Collected
Rent Collected
= Sum of successful rent payments
within selected month

Outstanding Rent
Outstanding Rent
= Expected Rent − Rent Collected

Total Expenses
Total Expenses
= Maintenance Expenses
+ General Expenses

Net Income
Net Income
= Rent Collected − Total Expenses

28. Reporting & Visualization Requirements
FR10 specifically requires charts for either income vs expenses or occupancy over time.  property_dashboard_presentation
I recommend implementing both because they provide different management insights.
Chart 1
Income vs Expenses
Month
│
├── Income
└── Expenses

Chart 2
Occupancy Trend
Occupancy %
100 ┤
 90 ┤       ╭──╮
 80 ┤   ╭───╯  ╰──
 70 ┤───╯
    └────────────────
       Aug Sep Oct

29. Performance Requirements
The system must support at least:
- 500 property/unit records
- Dashboard calculations
- Tenant records
- Payment records
- Expense records
- Analytics queries
The dashboard should not retrieve unnecessary records when calculating monthly analytics.
For example, selecting October 2026 should primarily query the data required for October rather than loading the entire payment history into the browser.
30. Reliability Requirements
The system must:
- Persist data immediately.
- Avoid losing successful transactions.
- Handle failed requests gracefully.
- Prevent duplicate payment callbacks.
- Maintain consistent relationships between tenants, units and payments.
- Provide appropriate error handling when external payment services are unavailable.
31. Auditability
Although not explicitly listed as a functional requirement in the presentation, it would be beneficial for the system design to maintain timestamps such as:
- created_at
- updated_at
- payment_received_at
This will make troubleshooting and future auditing easier.
This should be treated as a recommended enhancement, not a mandatory source requirement.
32. Future Product Roadmap
The first release should establish the core platform.
Version 1
Administrator-only
- Properties
- Units
- Tenants
- Payments
- Expenses
- Dashboard
- Analytics
- M-Pesa
Version 2
Add:
- Landlord portal
- Maintenance staff portal
- Accountant portal
- Role-based permissions
Version 3
Potential advanced capabilities:
- Automated tenant reminders
- Lease management
- Maintenance ticket management
- Financial reports
- Document management
- Advanced property comparisons
- Automated monthly statements
- Mobile application
- Predictive analytics
The first three additional user roles are already identified in the source presentation as future functionality.  property_dashboard_presentation
33. MVP Definition
The Minimum Viable Product should be considered complete when an administrator can perform this entire workflow:
LOGIN
  ↓
CREATE PROPERTY
  ↓
CREATE UNITS
  ↓
SET RENT
  ↓
ADD TENANTS
  ↓
ASSIGN TENANTS TO UNITS
  ↓
RECEIVE / RECORD RENT
  ↓
M-PESA CALLBACK
  ↓
UPDATE PAYMENT STATUS
  ↓
RECORD EXPENSES
  ↓
VIEW DASHBOARD
  ↓
VIEW OCCUPANCY
  ↓
VIEW INCOME
  ↓
VIEW EXPENSES
  ↓
VIEW NET INCOME

This should be the central end-to-end scenario used during integration testing.
34. Development Priorities
Based on the existing project work plan, the implementation should follow the project's sequence:
Phase 1 – Requirements
Already completed.
Phase 2 – System Design
Current design focus:
- ERD
- System architecture
- Use-case diagrams
- Dashboard wireframes
The presentation identifies these three design deliverables as the major Phase 2 activities.  property_dashboard_presentation
Phase 3 – Database
- PostgreSQL schema
- Row-Level Security
- Database access layer
Phase 4 – Backend
- Business logic
- Calculations
- APIs
- M-Pesa integration
- Webhooks
Phase 5 – Frontend
- React dashboard
- Forms
- Navigation
- Charts
Phase 6 – Integration & Testing
- Frontend/backend integration
- Database integration
- M-Pesa integration
- Unit testing
- Integration testing
- End-to-end testing
Phase 7 – Refinement
- Security validation
- Performance optimization
- Documentation
- Final presentation
These phases correspond closely to the project's existing work plan.  property_dashboard_presentation
35. Product Success Criteria
The product will be considered successful when:
Operational
- The administrator can manage all required property data from one system.
- No core operational process requires maintaining separate spreadsheets.
Financial
- Rent payments can be tracked accurately.
- Expenses can be recorded accurately.
- Monthly net income can be calculated automatically.
Analytical
- Occupancy can be determined immediately.
- Payment issues can be identified quickly.
- Income and expenses can be compared visually.
Technical
- Dashboard loads within 3 seconds for the specified dataset.
- Data persists reliably.
- Passwords are securely hashed.
- M-Pesa callbacks update payments correctly.
Usability
- An administrator can use the system without a manual.
- Key information is visible immediately after login.
36. Final Product Definition
The product can ultimately be summarized as:
A centralized property management analytics platform that allows property managers to manage units, tenants, rent payments and expenses while providing real-time visibility into occupancy, income, expenses and profitability.

The most important product principle should be:
Input data once → automatically calculate → visualize → make decisions.
That directly addresses the project's core problem of fragmented spreadsheets and slow access to property-performance information.