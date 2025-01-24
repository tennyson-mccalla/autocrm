# AutoCRM Next Steps Plan (Excluding Week 2 / AI Features)

Below is a **practical roadmap** focusing on **remaining tasks** for the AutoCRM project, aimed at **junior-level** implementation. We’re **excluding Week 2 (AI)** objectives, though we’ll outline some **foundation** steps to prepare for future AI integration if desired.

---

## 1. Worker/Agent Interface

**Goal**: Provide a dedicated portal for agents to efficiently manage tickets.

### Tasks
1. **Queue Page**:
   - Create a `/tickets/queue` (or similar) route for workers to see all unassigned/open tickets.
   - Add filtering/sorting by priority, status, creation date.

2. **Ticket Assignment**:
   - Implement a flow for assigning/reassigning tickets to a specific worker.
   - Update the `assigned_to` field in the database.

3. **Internal Notes** (Optional):
   - Add a comment thread reserved for workers/admins.
   - This can be a separate table (`internal_notes`) or part of `conversations` with an `internal` flag.

4. **Testing**:
   - Write UI tests for the queue page and assignment functionality.
   - Ensure RLS or role-based checks prevent customers from accessing this view.

---

## 2. Admin Dashboard

**Goal**: Equip admins with global oversight and management tools.

### Tasks
1. **Admin Page**:
   - Create `/admin` route displaying overall ticket stats, user lists, etc.

2. **User/Team Management** (Basic):
   - Let admins view existing users, see their roles, and (optionally) promote/demote them.
   - Basic CRUD operations on user profiles (excluding advanced coverage schedules).

3. **Reporting & Metrics** (Minimal):
   - Display basic stats: number of open tickets, average resolution time, etc.
   - Pull data from the `tickets` table, grouped by status or assigned worker.

4. **Testing**:
   - Admin UI tests ensuring only `admin` role can access this page.
   - Basic functional tests for user management (e.g., updating roles).

---

## 3. Expanded Testing

**Goal**: Strengthen reliability and catch regressions early.

### Tasks
1. **Integration Tests**:
   - Verify end-to-end flows (e.g., sign in as customer → create ticket → sign in as worker → assign ticket → sign in as admin → view metrics).

2. **E2E Testing** (Optional):
   - Consider adding Cypress or Playwright for browser-level testing of key paths.

3. **Increased Coverage**:
   - Add negative tests (e.g., unauthorized role tries to assign a ticket).
   - Include edge cases (e.g., extremely long titles, user with no tickets, worker with all tickets assigned).

---

## 4. UI/UX Refinements

**Goal**: Improve user experience and overall look & feel.

### Tasks
1. **Dark Mode** (Optional):
   - Configure Tailwind or a theme switcher for color modes.

2. **Mobile Responsiveness**:
   - Adjust layout, forms, and tables for smaller screens.
   - Ensure minimal horizontal scrolling.

3. **Loading & Error States**:
   - More prominent loading spinners or skeleton loaders.
   - Clear, standardized error messages across all pages.

4. **Styling Consistency**:
   - Use a consistent design system or component library (e.g., Tailwind + custom components).
   - Eliminate inline styles or ad-hoc class usage for maintainability.

---

## 5. Additional Features (Non-AI)

**Goal**: Provide value-adding enhancements while excluding the Week 2 AI scope.

### Tasks
1. **File Attachments**:
   - Integrate Supabase Storage or an S3 bucket.
   - Attach files to tickets for easier troubleshooting.

2. **Email Notifications**:
   - Upon ticket creation or status change, send an email.
   - Use a service like SendGrid, Mailgun, or Supabase’s SMTP integration.

3. **Conversation History**:
   - Extend existing conversation system to include multiple user messages.
   - Potentially unify with internal notes by tagging messages as `public` or `internal`.

4. **Preparation for AI** (No Full Implementation):
   - Optionally store chat logs or knowledge base references in a new table.
   - Keep indexing or vector storage in mind for future expansions.

---

## 6. Documentation & Deployment

**Goal**: Finalize the project for a smooth handoff and user adoption.

### Tasks
1. **Developer Docs**:
   - Expand `docs/` with instructions for running, testing, and extending each module (tickets, admin, worker UI).

2. **User Docs**:
   - Brief how-to for customers, workers, and admins.
   - Include screenshots of the new interfaces (worker queue, admin dashboard, etc.).

3. **Deployment**:
   - Set up a CI/CD pipeline on GitHub or GitLab.
   - Deploy to a service like Vercel or AWS Amplify once stable.

---

## Suggested Order & Milestones

1. **Worker/Agent Interface** (1–2 weeks)
   - Basic queue & ticket assignment.
   - Minimal internal notes (if time allows).

2. **Admin Dashboard** (1–2 weeks)
   - Basic user/role management & ticket metrics.
   - Could overlap with worker tasks if multiple devs are available.

3. **Expanded Testing** (Concurrent / Ongoing)
   - As you build each new feature, add integration tests.
   - E2E can come after main features are stable.

4. **UI/UX Refinements** (Continuous)
   - Tweak styling & responsiveness as the interface grows.

5. **Additional Features** (Optional enhancements)
   - File attachments & email notifications.
   - Preparation for future AI features (without implementing AI logic).

6. **Documentation & Deployment** (End of sprint)
   - Ensure a robust developer guide, user docs, and live deployment for stakeholders to review.

---

## Conclusion

This plan **excludes AI-specific (Week 2) features** while still laying groundwork for future expansions. By focusing on a **Worker/Agent Interface**, an **Admin Dashboard**, **enhanced testing**, and **UI/UX improvements**, we’ll deliver a robust CRM foundation. Once these tasks are complete, the project will be ready to integrate advanced AI-based enhancements in the future.
