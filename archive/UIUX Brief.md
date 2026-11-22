
# UI/UX Design Brief
## Property Management Analytics Dashboard

**Course:** BBT 2101 – Business Systems Analysis  
**Project:** Property Management Analytics Dashboard  
**Design Direction:** Elegant • Modern • Professional • Responsive

---

## 1. Design Objective

The Property Management Analytics Dashboard should provide property managers with a **clean, elegant and easy-to-understand interface** for monitoring property performance.

The interface should make important information immediately visible, particularly:

- Occupancy
- Rent collection
- Tenant payment status
- Expenses
- Net income
- Maintenance costs
- Property performance
- Financial trends

The design should support the project's goal of giving the Administrator/Property Manager a centralised and visually clear view of property performance.

---

# 2. Overall Visual Direction

The visual identity should communicate:

**Elegant + Premium + Trustworthy + Calm + Professional**

The dashboard should avoid looking like a generic corporate admin panel.

Instead, it should have a refined property-management aesthetic with:

- Warm neutral backgrounds
- Deep maroon accents
- Bottle green or navy blue supporting colours
- White/cream content cards
- Subtle borders
- Soft shadows
- Generous spacing
- Clean typography
- Minimal visual clutter

### Design Keywords

> **Elegant | Sophisticated | Minimal | Premium | Professional | Data-focused**

---

# 3. Colour Palette

The primary colour system should use **Beige + Maroon + Bottle Green/Navy Blue**.

### Primary Palette

| Colour | Suggested Hex | Usage |
|---|---|---|
| Warm Beige | `#F3EDE3` | Main background |
| Light Cream | `#FAF8F3` | Cards / surfaces |
| Deep Maroon | `#641F2B` | Primary brand/accent colour |
| Dark Maroon | `#48151F` | Hover states / headings |
| Bottle Green | `#164A3A` | Positive metrics / secondary accent |
| Deep Navy | `#172A3A` | Alternative secondary colour |
| Soft Gold | `#B89A62` | Small premium accent |
| Charcoal | `#252525` | Primary text |
| Muted Grey | `#747474` | Secondary text |
| Border Beige | `#DED6C9` | Borders/dividers |

### Colour Strategy

Use **beige as the visual foundation**.

Use **maroon as the main identity colour**.

Use **bottle green OR navy blue** as the secondary data/interaction colour.

Gold should be used sparingly for premium details rather than becoming a major UI colour.

---

# 4. Recommended Colour Combination

The preferred combination is:

```text
                 PROPERTY DASHBOARD

        Beige Background
               │
               ├── Maroon → Primary actions / branding
               │
               ├── Bottle Green → Positive financial data
               │
               ├── Navy → Information / secondary data
               │
               └── Gold → Small premium accents
```

### Example

**Maroon**
- Primary buttons
- Active navigation
- Important headings
- Selected states

**Bottle Green**
- Income
- Paid
- Occupied
- Positive financial indicators

**Navy**
- Information
- Secondary analytics
- Neutral data visualisation

**Beige**
- Overall page background
- Dashboard canvas

---

# 5. Typography

The typography should feel sophisticated without sacrificing readability.

### Recommended Font Pair

**Primary:** Inter

**Alternative:** Manrope

### Typography Hierarchy

```text
Page Heading
32–36px
Semi-bold

Section Heading
20–24px
Semi-bold

Card Heading
15–18px
Medium/Semi-bold

KPI Number
28–36px
Bold

Body
14–16px
Regular

Supporting Text
12–14px
Regular
```

Typography should have enough contrast and spacing to allow the dashboard to be understood quickly.

---

# 6. Layout System

The desktop dashboard should use a **sidebar + main content layout**.

```text
┌─────────────────────────────────────────────────────────────┐
│                     TOP HEADER                              │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│   SIDEBAR     │              MAIN CONTENT                   │
│               │                                             │
│ Dashboard     │  Welcome / Page Heading                     │
│ Properties    │                                             │
│ Units         │  Filters                                    │
│ Tenants       │                                             │
│ Payments      │  KPI Cards                                  │
│ Expenses      │                                             │
│ Reports       │  Charts                                     │
│               │                                             │
│ Settings      │  Tables / Activity                          │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

The layout should feel spacious rather than compressed.

---

# 7. Navigation

## Desktop

Use a vertical sidebar.

### Navigation Items

**Dashboard**

**Properties**

**Units**

**Tenants**

**Payments**

**Expenses**

**Reports**

---

### Bottom Navigation Area

**Settings**

**Logout**

The project identifies the Administrator/Property Manager as the main system user in Phase 1, so navigation should be designed around their operational workflow.

---

# 8. Sidebar Design

The sidebar should be elegant and relatively minimal.

### Suggested Appearance

- Dark maroon or deep navy background
- Cream/white text
- Maroon/green active indicator depending on chosen sidebar colour
- Simple line icons
- Property Management Dashboard logo/wordmark at top
- User profile at bottom

Example:

```text
┌────────────────────┐
│  ◈ PROPERTY        │
│    DASHBOARD       │
│                    │
│  ◆ Dashboard       │
│    Properties      │
│    Units           │
│    Tenants         │
│    Payments        │
│    Expenses        │
│    Reports         │
│                    │
│ ─────────────────  │
│    Settings        │
│    Logout          │
└────────────────────┘
```

---

# 9. Dashboard Home

The dashboard is the most important screen.

It should answer:

> **"How is my property performing right now?"**

within a few seconds.

---

## Dashboard Header

Example:

```text
Good morning, Administrator

Here's your property performance overview.

[ October 2026 ▼ ]          [ Export Report ]
```

The month/date selector should control the financial metrics displayed on the dashboard.

FR9 requires the system to provide rent collected, total expenses and net income for a chosen month.

---

# 10. KPI Cards

The first major section should contain four primary KPI cards.

### Card 1 — Occupancy

```text
OCCUPANCY

84.6%

17 / 20 units occupied

↑ 4.2%
```

### Card 2 — Rent Collected

```text
RENT COLLECTED

KES 485,000

This month

↑ 8.4%
```

### Card 3 — Total Expenses

```text
TOTAL EXPENSES

KES 126,500

This month

↓ 3.1%
```

### Card 4 — Net Income

```text
NET INCOME

KES 358,500

This month

↑ 11.8%
```

The actual figures above are design examples only.

---

# 11. KPI Card Design

Cards should have:

- Cream/white background
- Very subtle border
- 12–16px radius
- Soft shadow
- Large metric
- Small supporting text
- Small icon
- Optional trend indicator

Avoid excessive colours.

For example:

**Green = positive**

**Maroon = important**

**Navy = informational**

---

# 12. Analytics Section

The dashboard should then move into visual analytics.

### Recommended Layout

```text
┌──────────────────────────────────┐
│ Income vs Expenses               │
│                                  │
│     ╭───╮                        │
│  ╭──╯   ╰──╮                    │
│ ╭╯         ╰──╮                 │
│                                  │
└──────────────────────────────────┘

┌────────────────────┐
│ Occupancy          │
│                    │
│       84.6%        │
│     ◯────────      │
│                    │
└────────────────────┘
```

FR10 requires an income-vs-expenses or occupancy-over-time chart.

---

# 13. Charts

Charts should use the same visual language as the rest of the interface.

### Income vs Expenses

Recommended:

- Line chart or bar chart
- Maroon = income
- Navy/green = expenses
- Beige chart background
- Minimal grid lines

### Occupancy

Recommended:

- Donut chart
- Bottle green = occupied
- Light beige/grey = vacant

### Design Principle

Charts should communicate information first and decoration second.

Avoid:

- 3D charts
- excessive gradients
- unnecessary legends
- excessive colours
- visual clutter

---

# 14. Payment Status Section

A dedicated section should display tenant payment status.

Example:

```text
RENT PAYMENT STATUS

┌─────────────────────────────────────────────┐
│ Tenant             Unit       Status        │
├─────────────────────────────────────────────┤
│ Raj Patel          A-102      ● PAID        │
│ Priya Shah         A-103      ● PAID        │
│ John Kamau         B-201      ● UNPAID      │
│ Sarah Wanjiku      B-202      ● PAID        │
└─────────────────────────────────────────────┘

                 View All Payments →
```

FR6 requires the system to show each tenant's paid/unpaid status for the current month.

---

# 15. Status Indicators

Use clear visual indicators.

### Paid

Bottle Green:

```text
● PAID
```

### Unpaid

Maroon:

```text
● UNPAID
```

### Pending

Navy/neutral:

```text
● PENDING
```

Avoid relying on colour alone.

Each status should also contain readable text or an icon so that information remains accessible.

---

# 16. Properties Screen

The properties screen should provide an overview of managed properties.

Example:

```text
Properties

[ + Add Property ]

┌─────────────────────────────────────────┐
│ Green View Apartments                   │
│ Nairobi                                 │
│                                         │
│ 24 Units     21 Occupied     87.5%      │
│                                         │
│ View Property →                         │
└─────────────────────────────────────────┘
```

---

# 17. Units Screen

The units screen should focus on quick management.

### Desktop

Use a clean data table:

```text
Unit     Property       Rent        Status       Tenant
A-101    Green View     25,000      Occupied     Raj Patel
A-102    Green View     25,000      Vacant       —
A-103    Green View     27,000      Occupied     Priya Shah
```

Actions:

```text
View | Edit | Delete
```

FR2 requires adding, editing and deleting units.

---

# 18. Tenants Screen

The tenant interface should prioritise:

- Tenant name
- Unit
- Contact
- Rent
- Payment status

Example:

```text
TENANTS

[ Search tenants... ]       [ Add Tenant ]

Name              Unit      Rent       Status
Raj Patel         A-101     25,000     Paid
Priya Shah        A-103     27,000     Paid
John Kamau        B-201     22,000     Unpaid
```

---

# 19. Payments Screen

The payment screen should show:

- Tenant
- Unit
- Amount
- Date
- Payment method
- Status
- Transaction reference

Example:

```text
PAYMENTS

[ Search ] [ Month ▼ ] [ Status ▼ ]

Tenant       Amount      Date       Status
Raj Patel    25,000      01 Oct     Confirmed
Priya Shah   27,000      02 Oct     Confirmed
John Kamau   22,000      —          Unpaid
```

M-Pesa-confirmed payments should flow into the payment records through the backend callback architecture defined for the project.

---

# 20. Expenses Screen

Separate the expense interface into:

### Maintenance Expenses

```text
Unit
Description
Cost
Date
```

### General Expenses

```text
Category
Description
Amount
Date
```

This directly reflects FR7 and FR8.

---

# 21. Reports Screen

The reports page should provide a more detailed analytical view.

Possible sections:

### Financial Summary

```text
Rent Collected
− Maintenance Expenses
− General Expenses
────────────────────
Net Income
```

### Occupancy

```text
Total Units
Occupied
Vacant
Occupancy %
```

### Payment Performance

```text
Paid
Unpaid
Pending
Collection Rate
```

The report design should remain visually consistent with the dashboard rather than becoming a completely separate interface.

---

# 22. Forms

Forms should use a clean two-column layout on desktop.

Example:

```text
Add New Tenant

Full Name
[____________________________]

Phone Number
[____________________________]

Email
[____________________________]

Unit
[ Select Unit ▼ ]

              [ Cancel ] [ Add Tenant ]
```

### Form Principles

- Clear labels
- Large input areas
- Visible validation
- Minimal required fields
- Clear primary action
- Easy cancellation
- Helpful error messages

---

# 23. Modal Design

Small actions such as editing a unit or adding a tenant can use modal dialogs.

Example:

```text
┌──────────────────────────────────┐
│ Edit Unit                    ×   │
│                                  │
│ Unit Number                      │
│ [ A-101                       ]  │
│                                  │
│ Monthly Rent                     │
│ [ KES 25,000                  ]  │
│                                  │
│ Occupancy                        │
│ [ Occupied ▼                  ]  │
│                                  │
│             Cancel   Save Changes│
└──────────────────────────────────┘
```

---

# 24. Mobile Responsive Design

The dashboard must be fully responsive.

The mobile experience should not simply shrink the desktop interface.

It should **reorganise the interface for smaller screens**.

---

## Desktop

```text
Sidebar + Main Content

┌───────┬───────────────────────┐
│       │                       │
│ SIDE  │       CONTENT         │
│ BAR   │                       │
│       │                       │
└───────┴───────────────────────┘
```

## Tablet

```text
Compact Sidebar + Content
```

## Mobile

```text
┌─────────────────────────┐
│ ☰   Dashboard       ◉   │
├─────────────────────────┤
│                         │
│ Occupancy               │
│ 84.6%                   │
│                         │
│ Rent Collected          │
│ KES 485,000             │
│                         │
│ Expenses                │
│ KES 126,500             │
│                         │
│ Net Income              │
│ KES 358,500             │
│                         │
│ Income vs Expenses      │
│                         │
│ Payment Status          │
│                         │
└─────────────────────────┘
```

---

# 25. Mobile Navigation

On mobile, the desktop sidebar should become either:

### Option A — Hamburger Menu

```text
☰
```

opens a slide-out navigation drawer.

### Option B — Bottom Navigation

Recommended primary mobile navigation:

```text
┌───────────────────────────────┐
│ Home  Properties  Payments    │
│       Expenses    More        │
└───────────────────────────────┘
```

The hamburger/drawer approach is preferred if there are too many navigation items.

---

# 26. Mobile KPI Cards

Desktop:

```text
┌────────────┐ ┌────────────┐
│ Occupancy  │ │ Rent       │
│ 84.6%      │ │ 485,000    │
└────────────┘ └────────────┘
```

Mobile:

```text
┌──────────────────────┐
│ Occupancy            │
│ 84.6%                │
│ 17 of 20 units       │
└──────────────────────┘

┌──────────────────────┐
│ Rent Collected       │
│ KES 485,000          │
│ This month           │
└──────────────────────┘
```

Cards should stack vertically or use a 2-column grid depending on screen width.

---

# 27. Responsive Breakpoints

Recommended design breakpoints:

| Device | Width | Layout |
|---|---:|---|
| Mobile | < 640px | Single column |
| Tablet | 640–1024px | 1–2 columns |
| Desktop | 1024px+ | Sidebar + multi-column |
| Large Desktop | 1440px+ | Wider content area |

These are design recommendations and can be adjusted during implementation.

---

# 28. Responsive Tables

Large tables should not simply overflow the screen.

On mobile, tables should transform into cards.

### Desktop

```text
Tenant | Unit | Rent | Status | Date
```

### Mobile

```text
┌────────────────────────┐
│ Raj Patel              │
│ Unit A-101             │
│ KES 25,000             │
│ ● PAID                 │
│ Paid: 01 Oct 2026      │
└────────────────────────┘
```

This provides a much better mobile experience.

---

# 29. Spacing & Component Style

The design should use generous spacing.

### Recommended

- Card padding: 20–24px
- Section spacing: 28–40px
- Border radius: 12–16px
- Button radius: 8–10px
- Input height: 44–48px

Avoid overly rounded "bubble" interfaces.

The aesthetic should remain sophisticated and professional.

---

# 30. Icons

Use a consistent line-icon system.

Icons should be:

- Simple
- Thin/medium weight
- Consistent size
- Used to support labels rather than replace them

Suggested icon categories:

```text
Dashboard    → Grid
Properties   → Building
Units        → Door/Home
Tenants      → Users
Payments     → Wallet
Expenses     → Receipt
Reports      → Chart
Settings     → Gear
```

---

# 31. Interaction Design

Interactions should feel subtle and polished.

### Hover

Cards/buttons can have:

- Slight elevation
- Subtle background change
- Small transition

### Buttons

Primary:

```text
[ + Add Tenant ]
```

Secondary:

```text
[ Export Report ]
```

Destructive:

```text
[ Delete Unit ]
```

Delete actions should always require confirmation.

---

# 32. Empty States

Instead of displaying blank tables, provide useful empty states.

Example:

```text
             ◇

       No tenants yet

Add your first tenant to
start managing occupancy
and payment status.

       [ + Add Tenant ]
```

---

# 33. Loading States

Use skeleton loading rather than blank screens.

Example:

```text
┌──────────────────────┐
│ ███████████          │
│ █████                │
│ █████████████        │
└──────────────────────┘
```

This helps maintain the perception of a fast interface.

---

# 34. Error States

Errors should be understandable.

Avoid:

```text
ERROR 500
```

Prefer:

```text
Unable to load payment data.

Please try again.

[ Try Again ]
```

FR1 specifically requires an on-screen error for invalid login attempts.

---

# 35. Login Screen

The login page should establish the premium visual identity immediately.

```text
┌──────────────────────────────────────────────────┐
│                                                  │
│                  ◈                               │
│            PROPERTY DASHBOARD                    │
│                                                  │
│       Property Management Analytics              │
│                                                  │
│       Username                                   │
│       [____________________________]             │
│                                                  │
│       Password                                   │
│       [____________________________]             │
│                                                  │
│       [          Sign In          ]              │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Visual Direction

Use:

- Beige background
- Maroon primary button
- Dark navy/maroon typography
- Minimal decorative elements
- Elegant property-related visual treatment

---

# 36. Accessibility

The interface should remain usable for different users.

Requirements:

- Strong text/background contrast
- Visible focus states
- Keyboard navigation
- Readable font sizes
- Labels on all form inputs
- Colour should not be the only way of communicating status
- Touch targets should be large enough on mobile

---

# 37. Design System Components

The UI should be built around reusable components.

### Core Components

```text
Button
Input
Select
Date Picker
Modal
Card
Badge
Table
Tabs
Dropdown
Toast
Alert
Tooltip
Chart
Sidebar
Navbar
Pagination
Empty State
Loading Skeleton
```

This fits well with the project's React, TypeScript, Tailwind CSS and shadcn/ui technology stack.

---

# 38. Dashboard Component Hierarchy

```text
App
│
├── Authentication
│   └── Login
│
└── Dashboard Layout
    │
    ├── Sidebar
    ├── Header
    │
    └── Main Content
        │
        ├── Page Header
        ├── Date Filter
        │
        ├── KPI Cards
        │
        ├── Analytics
        │   ├── Income vs Expenses
        │   └── Occupancy
        │
        ├── Payment Status
        │
        └── Recent Activity
```

---

# 39. Overall User Experience

The intended experience is:

```text
LOGIN
  ↓
DASHBOARD
  ↓
Understand property performance
  ↓
Identify issues
  ↓
Investigate
  ↓
Take action
  ↓
Return to dashboard
```

The interface should minimise the number of steps required to perform common tasks.

For example:

**Identify unpaid tenant → open tenant/payment record → review payment → update/resolve → return to dashboard.**

---

# 40. Design Principles

The entire application should follow these principles:

### 1. Data First

Important metrics should always be easy to find.

### 2. Elegant, Not Decorative

Visual sophistication should not compromise usability.

### 3. Minimal Clutter

Only display information that helps the administrator make decisions.

### 4. Consistency

Buttons, colours, cards, forms and tables should behave consistently throughout the application.

### 5. Responsive by Design

Mobile should be considered from the beginning rather than added later.

### 6. Clear Hierarchy

The most important information should have the strongest visual emphasis.

### 7. Fast to Understand

The dashboard should communicate property performance at a glance.

---

# 41. Final Visual Direction

The final interface should feel similar to a **premium property management/business analytics platform**, rather than a basic student CRUD application.

### Desired visual impression

**Warm beige foundation**

+

**Deep maroon identity**

+

**Bottle green / navy analytics**

+

**Elegant typography**

+

**Clean cards**

+

**Minimal icons**

+

**Generous whitespace**

=

### **Premium Property Management Dashboard**

The result should look polished enough to demonstrate the project as a complete business system while remaining practical and easy for the Administrator/Property Manager to use.

---

# 42. Design Deliverables

The UI/UX design phase should produce:

1. Login screen
2. Dashboard
3. Properties screen
4. Units management screen
5. Tenants management screen
6. Payments screen
7. Expenses screen
8. Reports/Analytics screen
9. Add/Edit forms
10. Confirmation modals
11. Error states
12. Empty states
13. Loading states
14. Desktop layouts
15. Tablet layouts
16. Mobile layouts
17. Reusable component design system
18. Colour and typography specification

The project's work plan specifically includes dashboard UI wireframes as part of System Design, followed by React + TypeScript dashboard implementation and analytics charts.