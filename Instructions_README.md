 Project Development & GitHub Contribution Guide

 1. Introduction

Welcome to the project development repository.

This README outlines the development requirements, responsibilities, setup instructions, and GitHub contribution guidelines that every team member must follow when working on their assigned section of the system.

The project has been divided into six separate branches, with each team member responsible for developing and maintaining their assigned section.

The goal is to ensure that:
- Everyone works independently on their assigned section.
- All code follows a consistent development structure.
- Changes are properly tested before being pushed.
- All members follow the same GitHub workflow.
- Shared backend resources are configured consistently.
- All sections can eventually be integrated into one functional system.

---

 2. Branch Allocation

Six branches have already been created in the GitHub repository.

Each member should work exclusively on their assigned branch unless otherwise instructed.

Important: Do not push directly to the `main` branch. All contributions must first be pushed to the assigned branch and reviewed before integration.

Each member should:
1. Confirm their assigned branch.
2. Clone the repository.
3. Switch to their assigned branch.
4. Install the required dependencies.
5. Develop their assigned section.
6. Test their implementation.
7. Commit and push their changes.

---

 3. Required Technologies & Dependencies

Every team member must ensure that the relevant technologies and dependencies are installed for their section.

| Technology | Purpose |
|---|---|
| React | Frontend development and UI components |
| Neon | PostgreSQL database and authentication integration |
| Playwright | Automated testing and functionality verification |
| Webpack | Bundling, build optimization and performance |
| Lucide React | Icons and interface elements |
| AWS S3 | Backend file and object storage |

 Required installations

Install the following packages where applicable to your assigned section.

React and React DOM
```bash
npm install react react-dom
```

Lucide React Icons
```bash
npm install lucide-react
```

Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

Webpack
```bash
npm install -D webpack webpack-cli webpack-dev-server
```

Neon Database
```bash
npm install @neondatabase/serverless
```

Neon Authentication

If using Neon Auth, follow the official Neon Auth integration documentation for the selected framework and install the required SDK or integration packages.

AWS S3 Storage

For backend sections that handle file uploads or storage:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Note: Not every package needs to be independently configured by every member. Install and configure the dependencies relevant to your assigned section. Shared configurations should be coordinated to avoid conflicting implementations.

---

 4. Development Responsibilities

Each team member is responsible for the following:

 A. React Development
- Build the assigned section using React.
- Maintain reusable components where appropriate.
- Follow a consistent folder and file structure.
- Ensure that the interface is responsive.
- Avoid unnecessary duplication of components.
- Use Lucide React for icons instead of introducing inconsistent icon libraries.

 B. Database Integration – Neon
- Connect your section to the shared Neon database where required.
- Follow the existing database structure and naming conventions.
- Do not independently create duplicate tables or modify shared schemas without approval.
- Ensure database queries are properly handled.
- Keep database credentials and connection strings in environment variables.

 C. Authentication
- Use Neon Auth if authentication is required for your assigned section.
- Integrate with the agreed authentication implementation.
- Do not create separate authentication systems for individual sections.
- Coordinate authentication requirements with the team to ensure consistency.

 D. Backend File Storage – AWS S3
For sections requiring file uploads or document storage:
- Use the agreed AWS S3 bucket configuration.
- Implement secure file upload and retrieval processes.
- Keep AWS credentials out of the source code.
- Use environment variables for configuration.
- Ensure that access permissions are handled securely.

 E. Testing – Playwright
Every member must test their assigned section before pushing code.

Testing should cover:
- Basic functionality.
- User interactions.
- Form validation.
- Navigation.
- Authentication flows, where applicable.
- API and database interactions, where applicable.
- Error handling.

Add or update relevant Playwright tests for your implementation.

 F. Optimization – Webpack
Where applicable, configure Webpack to:
- Bundle application assets.
- Minimize production builds.
- Optimize JavaScript and CSS.
- Reduce unnecessary dependencies.
- Improve application loading performance.

Coordinate shared build configurations instead of creating conflicting Webpack setups across branches.

---

 5. GitHub Workflow – How to Push Your Code

Follow these instructions every time you want to submit changes.

 Step 1: Clone the repository

If you have not cloned the repository yet:

```bash
git clone <GITHUB_REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

 Step 2: Switch to your assigned branch

Replace `your-branch-name` with the branch assigned to you.

```bash
git checkout your-branch-name
```

If you have not downloaded the latest branch information:

```bash
git fetch origin
git checkout your-branch-name
```

 Step 3: Pull the latest changes

Before starting work, make sure your branch is up to date.

```bash
git pull origin your-branch-name
```

 Step 4: Install dependencies

```bash
npm install
```

 Step 5: Develop your assigned section

Only work on the section assigned to you.

Make sure your implementation:
- Follows the existing project structure.
- Uses the agreed technologies.
- Does not overwrite another member's work.
- Does not introduce unnecessary dependencies.
- Does not expose private credentials.

 Step 6: Test your implementation

Run your available tests:

```bash
npx playwright test
```

Also verify that your application builds successfully:

```bash
npm run build
```

The build command assumes that the project has a corresponding build script configured.

 Step 7: Check your changes

```bash
git status
git diff
```

Make sure you are only committing files relevant to your assigned section.

Do not commit:
- `node_modules/`
- `.env` files
- AWS secret keys
- Database passwords
- Build artifacts unless explicitly required
- Personal configuration files

 Step 8: Stage and commit your changes

```bash
git add .
```

Use a clear and descriptive commit message:

```bash
git commit -m "Implement assigned section"
```

Examples:

```bash
git commit -m "Add user dashboard components"
git commit -m "Implement authentication integration"
git commit -m "Add Playwright tests for user module"
git commit -m "Configure S3 file uploads"
```

 Step 9: Push to your assigned branch

```bash
git push origin your-branch-name
```

 Step 10: Confirm your contribution

After pushing:
- Open the GitHub repository.
- Confirm that your changes appear on your assigned branch.
- Create a Pull Request if requested.
- Do not merge into `main` without approval.

---

 6. Shared Backend Configuration

Some parts of the system may need to use the same backend resources.

To avoid duplicated work and inconsistent configurations, we need to coordinate access to the following:

 Neon Database

If multiple team members need to work with the same database, I can share access through email.

Please let me know who requires access so that the appropriate permissions can be provided.

All members using the shared database must:
- Follow the agreed schema.
- Avoid making unauthorized structural changes.
- Coordinate database migrations.
- Keep connection strings private.
- Avoid duplicating existing tables.

 Neon Authentication

If authentication needs to be shared across different sections, we should agree on one common implementation.

Please indicate whether your section requires authentication so we can coordinate the integration.

 AWS S3 Storage

The S3 configuration will be coordinated for sections requiring file storage.

Members should not independently create buckets or distribute AWS secret keys.

Access should be provided using the appropriate credentials and permissions.

---

 7. Database Schema – schema.sql

I will attach the `schema.sql` file once it has been shared.

This file will help everyone understand:
- Which database tables have already been implemented.
- Existing relationships between tables.
- Column names and data types.
- Primary and foreign keys.
- Existing constraints.
- Which database structures are available for integration.

Important: Please do not create new database tables or assume that a particular table is missing until the shared schema has been reviewed.

Once the schema is available, everyone should use it as the reference when integrating their assigned section.

---

 8. Environment Variables

Each member should use environment variables for sensitive configurations.

Create a local `.env` file where required.

Example:

```env
DATABASE_URL=
NEON_AUTH_URL=

AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

The actual variable names should follow the agreed project configuration.

Security requirements:
- Never push `.env` files to GitHub.
- Never hardcode database credentials.
- Never expose AWS secret keys.
- Include a `.env.example` file with placeholder values where needed.
- Do not share private credentials in public commits or pull requests.

---

 9. Code Quality & Collaboration Rules

All members are expected to follow these guidelines:

1. Work only on your assigned branch.
2. Pull the latest changes before beginning new work.
3. Keep commits small and descriptive.
4. Test your implementation before pushing.
5. Do not modify another member's section without communicating first.
6. Coordinate changes involving shared backend resources.
7. Do not push unfinished or broken code without notifying the team.
8. Maintain consistent naming conventions.
9. Reuse shared components and configurations where possible.
10. Communicate any dependencies or blockers early.

---

 10. Final Submission Checklist

Before considering your assigned section complete, confirm the following:

- [ ] I have worked on my assigned GitHub branch.
- [ ] React components are implemented.
- [ ] Lucide React icons are used where needed.
- [ ] Required Neon database integrations are working.
- [ ] Authentication is integrated where required.
- [ ] AWS S3 is configured where required.
- [ ] Playwright tests have been written and executed.
- [ ] The production build works.
- [ ] No sensitive credentials have been committed.
- [ ] My changes have been committed and pushed.
- [ ] My branch is ready for review and integration.

---

 11. Action Required From Every Team Member

Before proceeding, please confirm the following:

1. Your assigned GitHub branch.
2. Whether your section requires access to the shared Neon database.
3. Whether your section requires Neon Authentication.
4. Whether your section requires AWS S3 storage.
5. Any additional dependencies your section requires.
6. Any shared components or backend functionality your section depends on.

If you require access to the shared Neon database or authentication configuration, provide the email address associated with your account so access can be coordinated.

---

 12. Communication & Next Steps

Once everyone has confirmed their requirements:

1. Shared Neon database and authentication access will be coordinated.
2. The `schema.sql` file will be shared for reference.
3. Members will proceed with their assigned implementations.
4. Each member will push their work to their designated GitHub branch.
5. We will review and integrate the completed sections.
6. Integration testing will be conducted before merging into the main branch.

The objective is to build each section independently while ensuring that all six sections work together as one integrated system.

Please follow the instructions carefully so that we can maintain a clean, organized, and consistent development workflow.
