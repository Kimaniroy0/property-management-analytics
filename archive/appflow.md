PROPERTY MANAGEMENT ANALYTICS DASHBOARD
Complete Application Flow Document
Document Version: 1.0
Product: Property Management Analytics Dashboard
Primary User: Administrator / Property Manager
Indirect User: Tenant
External System: M-Pesa
Database: PostgreSQL  
1. Application Overview
The application is a centralized property-management system designed to bring together:
- Property information
- Unit information
- Tenant information
- Rent payments
- Maintenance expenses
- General expenses
- Occupancy information
- Income
- Profitability
- Analytics and reporting
The application replaces the fragmented spreadsheet-based process identified in the project problem statement with a centralized dashboard.  property_dashboard_presentation
2. High-Level Application Flow
The entire application can be viewed as this flow:
                         ┌──────────────────┐
                         │      START       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  SIGN-UP PAGE    │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                 No session                  Neon Auth session
                 │                           │
                 ▼                           ▼
             ┌─────────────┐          ┌──────────────────┐
             │  SIGN-UP /  │          │    DASHBOARD     │
             │ SIGN-IN     │          └────────┬─────────┘
             └─────────────┘                   │
                            ┌──────────┼──────────┐
                            ▼          ▼          ▼
                       Properties   Tenants   Payments   Expenses
                            └──────────┴──────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   ANALYTICS  │
                               └──────────────┘

3. Entry Point
3.1 Application Launch
When the user opens the application:
Application Opens
       ↓
Check Authentication Session
       ↓
       ├── Neon Auth confirms session → Dashboard
       │
       └── No session → Neon Auth sign-up page (with sign-in for existing accounts)

The application must not render dashboard pages until Neon Auth confirms an authenticated session. Account creation and sign-in are handled by Neon Managed Better Auth; no local credentials or demo-session fallback are available.
5. Main Application Shell
Once authenticated, the administrator enters the main application.
Main Navigation
┌──────────────────────────────────────────────────────┐
│ PROPERTY MANAGEMENT             Admin ▼     Logout   │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│ Dashboard    │                                       │
│              │                                       │
│ Properties   │          PAGE CONTENT                 │
│              │                                       │
│ Units        │                                       │
│              │                                       │
│ Tenants      │                                       │
│              │                                       │
│ Payments     │                                       │
│              │                                       │
│ Maintenance  │                                       │
│              │                                       │
│ Expenses     │                                       │
│              │                                       │
│ Reports      │                                       │
│              │                                       │
└──────────────┴───────────────────────────────────────┘

6. Dashboard Flow
The Dashboard is the primary landing page after login.
The purpose is to give the administrator an immediate view of property performance.
The project specifically identifies these dashboard metrics:
- Occupancy rate
- Income vs expenses
- Payment status
- Profitability
- Visual KPIs and reports  property_dashboard_presentation
6.1 Dashboard Loading
Dashboard
    ↓
Retrieve Current Data
    ↓
Calculate KPIs
    ↓
Load Charts
    ↓
Display Dashboard

7. Dashboard KPI Flow
The dashboard should display the following core KPIs:
                    DASHBOARD
                        │
       ┌────────────────┼─────────────────┐
       ▼                ▼                 ▼
   Total Units      Occupancy         Rent Collected
       │                │                 │
       │                ▼                 │
       │          Occupied/Vacant         │
       │                                  │
       └───────────────┬──────────────────┘
                       ▼
                   Expenses
                       │
                       ▼
                  Net Income

8. Dashboard Date Filter
The administrator should be able to select a month.
Example:
              October 2026 ▼

Changing the month should update financial and payment-related information.
Select Month
     ↓
Load Month Data
     ↓
Calculate
     ├── Rent Collected
     ├── Expenses
     ├── Net Income
     └── Payment Status
     ↓
Refresh Dashboard

FR9 requires the system to show rent collected, total expenses and net income for a chosen month.  property_dashboard_presentation
9. Property Management Flow
Property Screen
The property section manages the properties owned/managed by the administrator.
Flow
Properties
    │
    ├── View Properties
    │
    ├── Add Property
    │
    ├── Edit Property
    │
    └── View Property Details

9.1 Add Property
Click "Add Property"
       ↓
Property Form
       ↓
Enter Details
       ↓
Validate
       │
   ┌───┴────┐
   │        │
Invalid    Valid
   │        │
   ▼        ▼
Error     Save
Message     │
            ▼
      Property List

Property Information
Recommended fields:
- Property name
- Location
- Description
- Property status
Note: The original project requirements explicitly define units rather than a detailed property-management data-entry process. Therefore, the additional property fields above should be treated as design recommendations rather than confirmed source requirements.
10. Unit Management Flow
Unit management is a core Version 1 function.
FR2 requires the administrator to add, edit or delete a unit with:
- Unique ID
- Rent
- Occupancy status  property_dashboard_presentation
10.1 Unit List
Units
 │
 ├── Search
 ├── Filter
 ├── Add Unit
 │
 └── Unit Table
       │
       ├── Unit ID
       ├── Rent
       ├── Occupancy
       └── Actions
             ├── View
             ├── Edit
             └── Delete

11. Add Unit Flow
Click "Add Unit"
       ↓
Unit Form
       ↓
Enter:
  Unit ID
  Rent
  Property
       ↓
Validate
       │
   ┌───┴────┐
   │        │
Invalid    Valid
   │        │
   ▼        ▼
Error      Save
             │
             ▼
        Unit Created
             │
             ▼
        Unit List

12. Edit Unit Flow
Unit List
    ↓
Select Unit
    ↓
Click Edit
    ↓
Load Existing Data
    ↓
Modify Details
    ↓
Validate
    ↓
Save
    ↓
Update Database
    ↓
Refresh Unit List

13. Delete Unit Flow
Because deleting a unit can affect tenant and payment relationships, the UI should require confirmation.
Unit List
    ↓
Click Delete
    ↓
Confirmation Dialog
    │
    ├── Cancel → Return to List
    │
    └── Confirm
          ↓
     Validate Dependencies
          ↓
     Delete / Reject

Recommended confirmation:
"Are you sure you want to delete this unit?"

14. Tenant Management Flow
The administrator can add/edit tenants and assign them to units.
FR3 specifically requires tenants to be assigned to exactly one unit.  property_dashboard_presentation
Tenant Flow
Tenants
   │
   ├── View Tenants
   ├── Add Tenant
   ├── Edit Tenant
   └── View Tenant

15. Add Tenant Flow
Add Tenant
    ↓
Tenant Form
    ↓
Enter Tenant Details
    ↓
Select Unit
    ↓
Validate Assignment
    │
    ├── Unit unavailable
    │        ↓
    │      Error
    │
    └── Unit available
             ↓
          Save Tenant
             ↓
       Assign Unit
             ↓
      Mark Unit Occupied
             ↓
        Tenant List

16. Tenant-to-Unit Relationship
The system should maintain:
PROPERTY
   │
   ▼
 UNIT
   │
   │ assigned to
   ▼
 TENANT

When a tenant is assigned to a vacant unit:
Unit Status:
VACANT
   ↓
Tenant Assigned
   ↓
Unit Status:
OCCUPIED

This status should contribute to the occupancy calculation.
17. Tenant Detail Flow
Selecting a tenant should provide:
Tenant Details
     │
     ├── Personal Information
     │
     ├── Assigned Unit
     │
     ├── Monthly Rent
     │
     ├── Current Payment Status
     │
     └── Payment History

18. Payment Management Flow
Payment management is one of the most important application flows.
The application must support both:
1. Payment information coming through M-Pesa.
2. Administrator visibility of payment records.
The project specifies that rent payments are recorded against the tenant/unit and that the current month's payment status is shown.  property_dashboard_presentation
19. M-Pesa Payment Flow
The full external payment flow is:
                 TENANT
                    │
                    ▼
              Initiates Rent
                    │
                    ▼
                 M-PESA
                    │
                    ▼
             Payment Processing
                    │
             ┌──────┴──────┐
             │             │
           Failed       Successful
             │             │
             ▼             ▼
        Payment Failed   Callback
                           │
                           ▼
                     Backend/Webhook
                           │
                           ▼
                   Validate Transaction
                           │
                           ▼
                   Identify Tenant/Unit
                           │
                           ▼
                    Create Payment
                           │
                           ▼
                   Update Payment Status
                           │
                           ▼
                     Update Analytics
                           │
                           ▼
                      Dashboard

The work plan specifically includes M-Pesa gateway integration and a webhook listener.  property_dashboard_presentation
20. Payment Callback Flow
The webhook should follow this sequence:
M-Pesa Callback
      ↓
Receive Request
      ↓
Validate Callback
      ↓
Check Transaction Reference
      ↓
Already Processed?
   ┌──┴───┐
  YES    NO
   │      │
   ▼      ▼
Ignore  Process
          │
          ▼
      Identify Tenant
          │
          ▼
       Identify Unit
          │
          ▼
      Record Payment
          │
          ▼
     Update Status
          │
          ▼
      Recalculate
        Analytics

21. Payment Status Flow
Each tenant should have a current-month payment status.
Current Month
      ↓
Check Tenant Payments
      ↓
      ├── Successful payment exists
      │          ↓
      │        PAID
      │
      └── No successful payment
                 ↓
              UNPAID

22. Payment Screen
The administrator should be able to view:
PAYMENTS

Filter: [Month ▼]

Tenant       Unit      Amount       Date       Status
-----------------------------------------------------
Tenant A     A-01     KES 30,000   02 Oct      PAID
Tenant B     A-02     KES 30,000      —        UNPAID
Tenant C     B-01     KES 35,000   05 Oct      PAID

23. Payment Detail Flow
Payment List
     ↓
Select Payment
     ↓
Payment Details
     │
     ├── Tenant
     ├── Unit
     ├── Amount
     ├── Date
     ├── Status
     └── Transaction Reference

24. Maintenance Management Flow
FR7 requires the administrator to log:
- Unit
- Description
- Cost
- Date  property_dashboard_presentation
Maintenance Flow
Maintenance
     │
     ├── View Records
     ├── Add Maintenance
     ├── Edit Record
     └── Delete Record

25. Add Maintenance Flow
Click "Add Maintenance"
        ↓
Maintenance Form
        ↓
Select Unit
        ↓
Enter Description
        ↓
Enter Cost
        ↓
Select Date
        ↓
Validate
        ↓
Save
        ↓
Database
        ↓
Update Expense Totals
        ↓
Dashboard Updated

26. General Expense Flow
FR8 requires general expenses to contain:
- Category
- Amount
- Date  property_dashboard_presentation
Expense Flow
Expenses
    │
    ├── View Expenses
    ├── Add Expense
    ├── Edit Expense
    └── Delete Expense

27. Add General Expense
Add Expense
     ↓
Select Category
     ↓
Enter Amount
     ↓
Select Date
     ↓
Validate
     ↓
Save
     ↓
Database
     ↓
Recalculate Total Expenses
     ↓
Recalculate Net Income
     ↓
Dashboard Updated

28. Expense Calculation Flow
The application should combine:
Maintenance Expenses
          +
General Expenses
          │
          ▼
   Total Expenses

Then:
Rent Collected
      −
Total Expenses
      │
      ▼
Net Income

29. Reports Flow
The Reports section should provide the administrator with structured performance information.
Reports
   │
   ├── Occupancy
   │
   ├── Rent Collection
   │
   ├── Expenses
   │
   └── Profitability

30. Occupancy Report Flow
Open Occupancy Report
       ↓
Retrieve Units
       ↓
Count Total Units
       ↓
Count Occupied Units
       ↓
Calculate
       ↓
Display:
  Total Units
  Occupied Units
  Vacant Units
  Occupancy %

Formula
Occupied Units
─────────────── × 100
 Total Units

The project specifies that occupancy must be calculated to 1 decimal place.  property_dashboard_presentation
31. Financial Report Flow
Select Month
      ↓
Retrieve Payments
      ↓
Calculate Rent Collected
      ↓
Retrieve Expenses
      ↓
Calculate Total Expenses
      ↓
Calculate Net Income
      ↓
Display Report

32. Profitability Flow
                  SELECT MONTH
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    Rent Collected              Expenses
          │                         │
          └────────────┬────────────┘
                       ▼
                 NET INCOME
                       │
                       ▼
                PROFITABILITY

33. Analytics Flow
The analytics engine should consolidate data from the database.
                 DATABASE
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
     Units        Payments     Expenses
       │            │            │
       └────────────┼────────────┘
                    ▼
              ANALYTICS ENGINE
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
    Occupancy     Income     Expenses
        │           │           │
        └───────────┼───────────┘
                    ▼
                Net Income
                    │
                    ▼
                DASHBOARD

34. Chart Flow
The project requires visual analytics such as income vs expenses or occupancy over time.  property_dashboard_presentation
Recommended flow:
Database
   ↓
Aggregate Data
   ↓
Analytics API
   ↓
Frontend
   ↓
Chart Component
   ↓
Visual Representation

35. Income vs Expenses Chart
Select Month / Period
        ↓
Retrieve Income
        ↓
Retrieve Expenses
        ↓
Group by Period
        ↓
Send Data to Chart
        ↓
Render Chart

36. Occupancy Trend Chart
Retrieve Historical Unit Data
       ↓
Calculate Occupancy by Month
       ↓
Group Results
       ↓
Send to Chart
       ↓
Render Occupancy Trend

37. Search & Filtering Flow
Where applicable, list pages should support searching/filtering.
Example:
Search Tenant
     ↓
Enter Search Term
     ↓
Query Data
     ↓
Filter Results
     ↓
Display Matching Tenants

Similarly:
Payment Filter
    ↓
Select Month
    ↓
Select Status
    ↓
Display Results

These are recommended UX features rather than explicit requirements in the source presentation.
38. Global Data Flow
The overall information flow through the system is:
                    ┌───────────────┐
                    │     ADMIN     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  WEB FRONTEND │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ EDGE FUNCTIONS│
                    └───────┬───────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ PROPERTY │  │ TENANT   │  │ PAYMENT  │
        │ / UNIT   │  │ DATA     │  │ DATA     │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    ┌───────────────┐
                    │  POSTGRESQL   │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
         Analytics      Reports       Dashboard

39. Complete End-to-End Operational Flow
This is the main business flow of the application.
NEON AUTHENTICATION
     ↓
DASHBOARD
     ↓
CREATE PROPERTY
     ↓
CREATE UNITS
     ↓
SET UNIT RENT
     ↓
ADD TENANTS
     ↓
ASSIGN TENANTS TO UNITS
     ↓
UNITS BECOME OCCUPIED
     ↓
OCCUPANCY CALCULATED
     ↓
TENANTS PAY RENT
     ↓
M-PESA PROCESSES PAYMENT
     ↓
CALLBACK RECEIVED
     ↓
PAYMENT VALIDATED
     ↓
PAYMENT RECORDED
     ↓
TENANT MARKED PAID
     ↓
RENT COLLECTION UPDATED
     ↓
ADMIN RECORDS MAINTENANCE
     ↓
ADMIN RECORDS GENERAL EXPENSES
     ↓
TOTAL EXPENSES CALCULATED
     ↓
NET INCOME CALCULATED
     ↓
ANALYTICS UPDATED
     ↓
DASHBOARD REFRESHED
     ↓
ADMIN REVIEWS PERFORMANCE

40. Exception Flows
The application should also define what happens when something goes wrong.
40.1 Authentication Failure
Neon Auth sign-up / sign-in
 ↓
Neon Auth rejects credentials or verification
 ↓
The sign-in or sign-up form displays the authentication error
 ↓
Remain in the authentication flow

40.2 Duplicate Unit ID
Add Unit
 ↓
Duplicate ID
 ↓
Validation Error
 ↓
Remain on Form

40.3 Invalid Tenant Assignment
Assign Tenant
 ↓
Unit Already Occupied
 ↓
Error
 ↓
Select Another Unit

40.4 Failed M-Pesa Payment
Payment Initiated
 ↓
M-Pesa
 ↓
FAILED
 ↓
No successful payment recorded
 ↓
Tenant remains UNPAID

40.5 Duplicate M-Pesa Callback
Callback Received
 ↓
Check Transaction Reference
 ↓
Already Exists
 ↓
Do Not Create Duplicate
 ↓
Return Successful Response

40.6 Database Failure
User Action
 ↓
Database Request
 ↓
Failure
 ↓
Error Response
 ↓
Display User-Friendly Error
 ↓
Do Not Pretend Transaction Succeeded

41. Logout Flow
Dashboard
   ↓
Sign out with Neon Auth
   ↓
Neon Auth ends the session
   ↓
Return to the Neon Auth sign-up page

After logout:
Protected Page
      ↓
No Valid Session
      ↓
Show Neon Auth sign-up page

42. Navigation Flow
The recommended complete navigation hierarchy is:
NEON AUTH SIGN-UP / SIGN-IN
 │
 ▼
DASHBOARD
 │
 ├───────────────┐
 ▼               ▼
PROPERTIES      REPORTS
 │               │
 └──► UNITS      ├── Occupancy
       │         ├── Payments
       ▼         ├── Expenses
    TENANTS      └── Profitability
       │
       ▼
   PAYMENTS
       │
       ▼
  MAINTENANCE
       │
       ▼
   EXPENSES

43. Application State Flow
The frontend should conceptually maintain these states:
LOADING
   ↓
SUCCESS
   │
   ├── DISPLAY DATA
   │
   └── USER ACTION
          ↓
       API REQUEST
          ↓
     ┌────┴─────┐
     ▼          ▼
 SUCCESS       ERROR
     │          │
     ▼          ▼
 UPDATE UI   ERROR MESSAGE

This pattern should be consistent throughout the application.
44. Database-to-UI Flow
For a normal dashboard request:
Administrator
     ↓
Open Dashboard
     ↓
Frontend Request
     ↓
Backend / Edge Function
     ↓
PostgreSQL
     ↓
Retrieve:
  Units
  Tenants
  Payments
  Expenses
     ↓
Calculate KPIs
     ↓
Return JSON
     ↓
Frontend
     ↓
Render KPI Cards
     ↓
Render Charts
     ↓
Render Tables

45. Security Flow
The application should follow:
User
 ↓
Neon Auth authentication
 ↓
Authentication
 ↓
Session
 ↓
Authorization
 ↓
Protected API
 ↓
Database

The project specifies secure password hashing and PostgreSQL Row-Level Security as part of its technical approach.  property_dashboard_presentation  property_dashboard_presentation
46. Recommended Screen Inventory
For the actual application, I would define the following screens.
#	Screen	Purpose
01	Sign-up / Sign-in	Neon Auth account authentication
02	Dashboard	Overall property performance
03	Properties	Property list
04	Add Property	Create property
05	Property Details	Property information
06	Units	Unit management
07	Add/Edit Unit	Unit management form
08	Unit Details	Unit information
09	Tenants	Tenant management
10	Add/Edit Tenant	Tenant form
11	Tenant Details	Tenant/payment overview
12	Payments	Payment monitoring
13	Payment Details	Transaction details
14	Maintenance	Maintenance records
15	Add/Edit Maintenance	Maintenance form
16	Expenses	General expenses
17	Add/Edit Expense	Expense form
18	Reports	Analytics/reporting
19	Occupancy Report	Occupancy analytics
20	Financial Report	Income/expenses
21	Profitability Report	Net income
22	Settings/Profile	Administrator settings
23	Error/404	Invalid route
24	Unauthorized	Access denied

47. Core User Journey
The most important journey to demonstrate in your presentation is:
"From property setup to profitability"
ADMIN
 │
 ├── Creates Property
 │
 ├── Creates Units
 │
 ├── Sets Rent
 │
 ├── Adds Tenant
 │
 ├── Assigns Tenant
 │
 └── Monitors Occupancy
          │
          ▼
       TENANT
          │
          └── Pays Rent
                 │
                 ▼
               M-PESA
                 │
                 ▼
             CALLBACK
                 │
                 ▼
              SYSTEM
                 │
                 ├── Records Payment
                 ├── Updates Status
                 └── Updates Income
                          │
                          ▼
                     ADMIN
                          │
                          ├── Records Maintenance
                          ├── Records Expenses
                          │
                          ▼
                    TOTAL EXPENSES
                          │
                          ▼
                      NET INCOME
                          │
                          ▼
                     DASHBOARD
                          │
                          ▼
                  BUSINESS DECISION

48. MVP Critical Path
If your team needs to prioritize development, this is the critical application flow:
AUTHENTICATION
      ↓
PROPERTY / UNIT
      ↓
TENANT
      ↓
PAYMENT
      ↓
M-PESA
      ↓
EXPENSES
      ↓
ANALYTICS
      ↓
DASHBOARD

Everything else should support this path.
49. Final Application Flow Map
The complete Version 1 system can therefore be represented as:
                              ┌───────────────┐
                              │ NEON AUTH SIGN-UP │
                              │   / SIGN-IN   │
                              └───────┬───────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │   DASHBOARD   │
                              └───────┬───────┘
                                      │
           ┌──────────────┬───────────┼────────────┬──────────────┐
           │              │           │            │              │
           ▼              ▼           ▼            ▼              ▼
      PROPERTIES        UNITS      TENANTS      PAYMENTS       EXPENSES
           │              │           │            │              │
           │              │           │            │        ┌─────┴──────┐
           │              │           │            │        │            │
           │              │           │            │        ▼            ▼
           │              │           │            │   MAINTENANCE    GENERAL
           │              │           │            │    EXPENSES      EXPENSES
           │              │           │            │        │            │
           └──────────────┴───────────┴────────────┘        │            │
                                      │                     └─────┬──────┘
                                      │                           │
                                      ▼                           ▼
                               ┌───────────────┐          ┌──────────────┐
                               │   POSTGRESQL  │◄─────────│   EXPENSES   │
                               └───────┬───────┘          └──────────────┘
                                       │
                       ┌───────────────┼────────────────┐
                       │               │                │
                       ▼               ▼                ▼
                  OCCUPANCY         INCOME          EXPENSES
                       │               │                │
                       └───────────────┼────────────────┘
                                       ▼
                                ┌───────────────┐
                                │  NET INCOME   │
                                └───────┬───────┘
                                        │
                                        ▼
                                ┌───────────────┐
                                │   ANALYTICS   │
                                └───────┬───────┘
                                        │
                        ┌───────────────┼───────────────┐
                        ▼               ▼               ▼
                   KPI CARDS         CHARTS          REPORTS

External M-Pesa flow
TENANT
  │
  ▼
M-PESA
  │
  ▼
PAYMENT CONFIRMATION
  │
  ▼
WEBHOOK
  │
  ▼
BACKEND
  │
  ▼
POSTGRESQL
  │
  ▼
PAYMENT STATUS
  │
  ▼
ANALYTICS
  │
  ▼
DASHBOARD