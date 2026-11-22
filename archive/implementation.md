Implementation Plan
Property Management Analytics Dashboard
Course: BBT 2101 – Business Systems Analysis
Project Group: Group 6
Implementation period: 13 October–23 November 2026
Document status: Working implementation plan
1. Purpose
This plan describes how the Property Management Analytics Dashboard will be implemented, integrated, tested, and prepared for final presentation. It follows the project's agreed technology stack and work plan.
The system will centralise property, unit, tenant, rent-payment, maintenance-expense, and general-expense data. It will provide a dashboard for occupancy, payment status, rent collected, expenses, net income, and analytics.
2. Scope
In scope
- Administrator login
- Property and unit management
- Tenant management and unit assignment
- Rent-payment records and monthly paid/unpaid status
- M-Pesa payment integration and callback handling
- Maintenance and general expense records
- Monthly financial summaries
- Occupancy calculations and analytics charts
- Responsive desktop, tablet, and mobile interface
- PostgreSQL database, Row-Level Security (RLS), and serverless edge functions
- Integration, testing, security validation, performance checks, and final documentation
Out of scope for Phase 1
- Separate logins for landlords/owners, maintenance staff, or accountants
- Tenant login portal
- Any functionality not confirmed in the project requirements, unless agreed by the team
3. Technology Stack
Layer	Technology
Frontend	React, TypeScript, Vite
Styling and UI	Tailwind CSS, shadcn/ui
Database	PostgreSQL
Database security	Row-Level Security (RLS)
Backend	Serverless edge functions
File storage	S3
Payment gateway	M-Pesa
Hosting	Edge CDN with automated CI/CD and SSL
Diagrams	Lucidchart
Collaboration and version control	GitHub


Libraries for routing, charting, testing, migrations, and client-side state management are not specified in the project brief and should be agreed by the team before implementation.
4. Roles and Responsibilities
The following allocation follows the work plan in the project presentation. Team members should confirm any changes before work begins.
Workstream	Assigned owner(s)	Main responsibility
Database implementation	Ved	PostgreSQL schema, relationships, RLS, database access layer
Backend business logic	Mark	Occupancy and financial calculations
Internal APIs and storage	Mark, Nathan	Edge functions, internal APIs, S3 integration
M-Pesa integration	Ved	Gateway integration and callback listener
Frontend	Angel	React/TypeScript dashboard and responsive UI
Testing	Kimani	Unit, integration, end-to-end testing and bug tracking
Requirements and documentation	Diya	Documentation and report compilation
Integration	Mark, Ved, Nathan, team	Frontend/backend/database/gateway integration
Final preparation	Whole team	Review, presentation, and rehearsal


5. Implementation Timeline
The dates below preserve the dates in the project's work plan.
Phase	Dates	Main deliverables	Exit criteria
1. Requirements gathering and analysis	10–14 Sep	Requirements and scope	Completed
2. System design	15 Sep–12 Oct	ERD, architecture/use-case diagrams, UI wireframes	Design reviewed and agreed
3. Database implementation	13–20 Oct	PostgreSQL schema, RLS, database access layer	Schema and access rules tested
4. Backend development	13–27 Oct	Business logic, APIs, S3 integration as required, M-Pesa callback	Core endpoints and calculations tested
5. Frontend development	13–27 Oct	Responsive dashboard and analytics charts	Core screens work on mobile and desktop
6. Integration and testing	28 Oct–2 Nov	Integrated application, test results, bug fixes	Critical flows pass testing
7. Refinement and final presentation preparation	3–23 Nov	Security/performance checks, documentation, presentation	Final review and rehearsal complete


Dependency note: Database and backend tasks depend on the system design. Frontend and backend work may proceed in parallel once their interfaces and data contracts are agreed.
6. Work Packages and Tasks
Phase 1 — Requirements Gathering and Analysis
Status: Completed according to the project work plan.
- Confirm functional and non-functional requirements.
- Confirm Phase 1 user role: Administrator/Property Manager.
- Confirm scope and acceptance criteria.
- Maintain a list of open design decisions.
Phase 2 — System Design
Target: Complete by 12 October.
- Finalise the Entity Relationship Diagram (ERD).
- Finalise system architecture and use-case diagrams.
- Finalise dashboard wireframes and responsive layouts.
- Agree the database schema and API contracts.
- Confirm unresolved choices, including charting library, routing, authentication implementation, migration approach, and test framework.
Deliverables: Approved ERD, architecture diagrams, use-case diagrams, UI wireframes, and implementation decisions.
Phase 3 — Database Implementation
Target: 13–20 October.
- Create PostgreSQL tables for administrator accounts, properties, units, tenants, rent payments, maintenance expenses, and general expenses.
- Define primary keys, foreign keys, uniqueness rules, required fields, and financial constraints.
- Add appropriate indexes for common filters and joins.
- Configure RLS policies and verify that unauthorised access is blocked.
- Implement migrations or a repeatable schema setup process.
- Seed non-production test data.
- Test relationships and deletion/update behaviour.
Deliverables: Version-controlled schema, RLS policies, test data, and database validation results.
Phase 4 — Backend Development
Target: 13–27 October.
- Implement authentication and server-side validation.
- Build edge functions for properties, units, tenants, payments, and expenses.
- Implement occupancy calculation: occupied units ÷ total units × 100, rounded to one decimal place.
- Implement monthly rent-collected, total-expenses, and net-income calculations.
- Calculate monthly tenant paid/unpaid status from confirmed payments.
- Integrate M-Pesa payment initiation and callback handling as required.
- Verify callbacks, prevent duplicate transaction processing, and keep payment status consistent.
- Return clear validation and error responses.
- Keep secrets and privileged credentials out of frontend code.
- Add S3 integration only for the file-storage use cases agreed by the team.
Deliverables: Working edge functions, validated calculations, API contract, and M-Pesa integration tests.
Phase 5 — Frontend Development
Target: 13–27 October.
- Implement login screen and protected application layout.
- Build navigation for Dashboard, Properties, Units, Tenants, Payments, Expenses, and Reports.
- Build dashboard KPI cards and date/month filter.
- Build income-versus-expenses and/or occupancy charts.
- Build CRUD forms and data views for required records.
- Display paid, unpaid, pending, and confirmed statuses where applicable.
- Add loading, empty, validation, success, and error states.
- Apply the beige, maroon, and bottle-green or navy visual system.
- Test layouts on mobile, tablet, laptop, and desktop widths.
- Ensure tables remain usable on small screens through responsive tables or card layouts.
Deliverables: Responsive React UI connected to the agreed API contracts.
Phase 6 — Integration and Testing
Target: 28 October–2 November.
- Connect frontend, edge functions, PostgreSQL, and M-Pesa.
- Run unit tests for calculations and validation.
- Run integration tests for CRUD operations and payment callbacks.
- Run end-to-end tests for login, unit/tenant management, payments, expenses, and dashboard reporting.
- Verify monthly date filtering and payment-status calculations.
- Check RLS and authentication protections.
- Test error handling, duplicate callbacks, and failed requests.
- Fix critical and high-priority defects.
- Record test outcomes and unresolved issues.
Deliverables: Integrated application, test report, defect list, and evidence of critical user journeys.
Phase 7 — Refinement and Final Presentation Preparation
Target: 3–23 November.
- Validate privacy and security controls.
- Check dashboard performance against the target of loading within three seconds with up to 500 property/unit records.
- Optimise slow queries and unnecessary frontend requests.
- Complete technical and user-facing documentation.
- Prepare screenshots and a reliable demonstration dataset.
- Rehearse the presentation and prepare a fallback demo in case a live integration is unavailable.
- Review outstanding defects and confirm readiness for submission.
Deliverables: Final application, security/performance review, documentation, presentation, and rehearsal.
7. Functional Acceptance Criteria
ID	Acceptance criterion
AC1	Administrator can log in with valid credentials; invalid credentials show a clear error.
AC2	Administrator can add, edit, and delete units with unique identifiers, rent, and occupancy status.
AC3	Administrator can add and edit tenants and assign each tenant to one unit.
AC4	Occupancy is calculated as occupied units divided by total units, multiplied by 100, and displayed to one decimal place.
AC5	Rent payments record tenant, amount, date, and related unit.
AC6	The dashboard shows each tenant as paid or unpaid for the selected/current month based on confirmed payment records.
AC7	Maintenance expenses record unit, description, cost, and date.
AC8	General expenses record category, amount, and date.
AC9	For a chosen month, the dashboard shows rent collected, total expenses, and net income.
AC10	At least one required analytics chart is available: income versus expenses or occupancy over time.
AC11	The interface is usable on mobile, tablet, and desktop layouts.
AC12	Unauthorised users cannot access protected backend data.


8. Non-Functional Acceptance Criteria
- Performance: Dashboard target is under three seconds with up to 500 property/unit records.
- Security: Passwords are stored as one-way hashes, never plain text.
- Reliability: Database changes commit successfully and persist after application restart.
- Usability: Navigation, labels, and validation messages are understandable without a manual.
- Compatibility: The solution uses the agreed technology stack and avoids unnecessary infrastructure.
- Responsive design: Core tasks can be completed without horizontal page overflow on common mobile screen sizes.
9. Testing Plan
Test area	What to verify
Authentication	Valid/invalid login, protected routes, secure password storage
Database	Constraints, foreign keys, uniqueness, persistence
RLS	Access is limited to authorised sessions and intended roles
Units and tenants	Create, read, update, delete, assignment rules
Payments	Valid payment records, confirmed status, duplicate callback protection
Expenses	Correct fields, dates, and totals
Analytics	Occupancy, rent collected, expenses, and net income calculations
Date filtering	Selected month controls relevant totals and payment status
Responsive UI	Navigation, cards, forms, charts, and tables at mobile/tablet/desktop widths
Performance	Dashboard response time against the three-second target
Error handling	Network failures, invalid inputs, unavailable gateway, and empty data


10. Key Risks and Mitigations
Risk	Mitigation
Delays in agreeing schema or API contracts	Finalise ERD and API request/response formats before dependent work proceeds.
M-Pesa sandbox or callback issues	Test callbacks early and prepare a clearly labelled mock-payment path for development/demo only.
Duplicate payment callbacks	Use unique transaction references and idempotent callback processing.
Incorrect financial totals	Centralise calculation logic and test with known sample cases.
Data exposure	Review authentication, RLS policies, secrets handling, and API authorisation.
Mobile layout problems	Test responsive layouts throughout frontend development, not only at the end.
Scope expansion	Keep additional roles and unconfirmed features outside Phase 1 unless approved.
Integration delays	Integrate incrementally and keep frontend/API contracts stable.


11. Team Workflow and Version Control
- Use GitHub for source control and collaboration.
- Keep work in small, reviewable changes.
- Use branches for individual features and review changes before merging.
- Store schema changes and setup instructions in the repository.
- Do not commit passwords, API keys, M-Pesa credentials, or other secrets.
- Keep development/test data separate from any real tenant or payment data.
- Record decisions and known issues in the project documentation.
- Agree a shared definition of done: code reviewed, tested, integrated, and documented.
12. Definition of Done
A feature is complete when:
1. It meets its acceptance criteria.
2. Input is validated on the server.
3. Database relationships and access controls are correct.
4. Success, loading, empty, and error states are handled.
5. Tests pass and any known limitations are recorded.
6. The feature works at desktop and mobile sizes where applicable.
7. Code and setup changes are committed to GitHub.
8. Documentation is updated.
13. Final Deliverables Checklist
- [ ] Approved ERD and system architecture
- [ ] Final UI/UX wireframes
- [ ] PostgreSQL schema and RLS policies
- [ ] Serverless edge functions and API documentation
- [ ] Administrator authentication
- [ ] Property, unit, and tenant management
- [ ] Rent payments and M-Pesa callback integration
- [ ] Maintenance and general expenses
- [ ] Dashboard KPIs and analytics
- [ ] Responsive desktop, tablet, and mobile UI
- [ ] Unit, integration, and end-to-end test results
- [ ] Security and performance review
- [ ] Technical documentation and user guidance
- [ ] Final presentation and rehearsal
14. Source Alignment and Open Decisions
This plan is based on the project presentation's functional requirements, non-functional requirements, technology stack, and work plan. The project brief specifies PostgreSQL with RLS, serverless edge functions, S3 storage, M-Pesa, React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and edge-CDN hosting with CI/CD and SSL.
The following details still require team confirmation because they are not explicitly defined in the presentation:
- Exact PostgreSQL hosting/provider and migration tool
- Routing, charting, and frontend state-management libraries
- Authentication/session implementation
- API naming and response conventions
- Exact S3 upload use cases
- M-Pesa integration mode and sandbox credentials
- Test framework and CI/CD provider
Project success means: the Administrator can securely manage core property records, record and verify rent payments, log expenses, and view accurate monthly property-performance analytics through a responsive dashboard.