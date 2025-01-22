# TicketCreation_CustomerInterface_TDD_Lite.md

## Overview
This document outlines **ultra-atomic steps** for a junior developer to build the **Ticket Creation & Customer Interface** module in the AutoCRM project. It assumes you already have:

1. A basic **database** with a `tickets` table (and possibly user profiles).
2. A working **authentication** system, so we know who is logged in.
3. Some **frontend framework** (e.g., React or Next.js) ready to display pages.

The focus here is on:
- **Creating a ticket** from the customer’s perspective.
- **Viewing tickets** that the customer has filed.
- **Doing it with a TDD lite** approach—writing minimal failing tests first, then implementing just enough code to pass them.

---

## Table of Contents
1. [Confirm Prerequisites](#1-confirm-prerequisites)
2. [Define Requirements](#2-define-requirements)
3. [Write Failing Tests First (UI & Backend)](#3-write-failing-tests-first-ui--backend)
4. [Implement the Ticket Creation Form (Frontend)](#4-implement-the-ticket-creation-form-frontend)
5. [Implement the Create Ticket Logic (API or Direct DB)](#5-implement-the-create-ticket-logic-api-or-direct-db)
6. [Test & Verify Creation Flow](#6-test--verify-creation-flow)
7. [List and Display Customer Tickets](#7-list-and-display-customer-tickets)
8. [Edge Cases & Error States](#8-edge-cases--error-states)
9. [Document and Wrap Up](#9-document-and-wrap-up)

---

## 1. Confirm Prerequisites

1. **Database Table**: You have a `tickets` table (with fields like `id`, `title`, `description`, `status`, `userId`, `createdAt`, etc.).
2. **Auth**: Users can log in and have a valid token or session (we only want logged-in users to create tickets).
3. **Frontend Setup**: A minimal app (e.g., Next.js) where you can add pages or components.

**Verification**:
- You can run `npm test` (or `yarn test`) on existing modules, and the tests pass.
- You can log in to your local dev environment without errors.

---

## 2. Define Requirements

1. **Ticket Creation (Customer)**
   - A logged-in user can open a new ticket by providing a **title** and **description**.
   - Optionally set other fields (e.g., `priority`), or default them if not provided.

2. **View Tickets**
   - The same customer can see a list of their own tickets (status, creation date, etc.).

3. **TDD Lite Approach**
   - Write a minimal failing test for each key step.
   - Implement just enough code to pass.
   - Keep it small, incremental, and verifiable.

**Verification**:
- You have a short doc or note (like `docs/ticket_creation_requirements.md`) stating these goals.
- You can reference it during testing to ensure coverage.

---

## 3. Write Failing Tests First (UI & Backend)

Depending on your architecture, you might have:

1. **Frontend Tests** (e.g., Jest + React Testing Library or Cypress for E2E).
   - **“renders a ticket creation form when logged in”**
   - **“submits form data and shows success message”**
   - **“shows validation error if title is empty”**
2. **Backend Tests** (if you have an API route or direct DB calls).
   - **“POST /tickets creates a new ticket for the authenticated user”**
   - **“GET /tickets returns only the user’s tickets if they are a customer”**

**Verification**:
- `npm test` shows failing tests or unimplemented test blocks (red).
- You have function placeholders or API endpoints with no real logic yet.

---

## 4. Implement the Ticket Creation Form (Frontend)

1. **Create a Component** (e.g., `NewTicketForm.tsx`):
   - Fields: `title`, `description`.
   - A `Submit` button.
2. **Connect to State**:
   - Use a React state or form library to store user input.
3. **Integration Stub**:
   - On `Submit`, call a placeholder function (or an API route) named `createTicket()` with the form data.
4. **Render the Form in a Page**:
   - For example, in Next.js, put `<NewTicketForm />` in `/tickets/new`.

**Verification**:
- The form appears on the `/tickets/new` page.
- Tests might still fail because `createTicket()` doesn’t do anything yet.

---

## 5. Implement the Create Ticket Logic (API or Direct DB)

1. **Decide on Approach**:
   - **API Route**: If using Next.js, create `/api/tickets.js` or a serverless function.
   - **Direct DB**: If you prefer direct Supabase client calls from the frontend, just be mindful of security (RLS).
2. **Insert into `tickets` Table**:
   - Pseudocode:
     ```
     createTicket(data) {
       // call supabase.from('tickets').insert([{ ...data, userId: currentUser.id }])
       // return the new ticket or an error
     }
     ```
3. **Handle Auth**:
   - Ensure you pass the user’s token (or use an authenticated supabase client).
4. **Link the Frontend**:
   - Replace the placeholder `createTicket()` call with the real one in `NewTicketForm`.

**Verification**:
- Submit the form → Check the DB to see if a new row is created.
- The relevant test(s) for creation might now pass.

---

## 6. Test & Verify Creation Flow

1. **Run the Previously Failing Tests**:
   - “`renders a ticket creation form`”: should now pass if the form is in place.
   - “`submits form data`”: should pass if a real ticket is inserted.
2. **Manual Check**:
   - Log in locally, go to `/tickets/new`, fill out the form, and submit.
   - Confirm a new ticket in the Supabase dashboard or your DB viewer.
3. **Handle Error States** (if the test requires):
   - If the user is not logged in, do we redirect them?
   - If the DB insert fails, do we show an error?

**Verification**:
- `npm test` or `yarn test` now shows passing for creation tests.
- Manually verifying in the DB.

---

## 7. List and Display Customer Tickets

1. **Frontend Page** (e.g., `/tickets`):
   - Make a call to `getTicketsForUser(currentUser.id)` or a REST endpoint (`GET /tickets`).
   - Display a list of ticket titles, statuses, etc.
2. **Backend Logic**:
   - If you have an API route or direct DB calls:
     ```
     getTicketsForUser(userId) {
       return supabase.from('tickets').select('*').eq('userId', userId);
     }
     ```
   - RLS ensures they only see their own tickets if you’re using role-based policies.
3. **UI Display**:
   - A simple table or list showing `title`, `status`, `createdAt`.

**Verification**:
- A new test or E2E scenario: “`should list the user’s tickets on /tickets page`” passes.
- Manually confirm you see only your tickets.

---

## 8. Edge Cases & Error States

1. **Empty Title**:
   - If required, does the form block submission?
2. **Max Length**:
   - If you have a max length for `title` or `description`, do you handle it gracefully?
3. **No Tickets**:
   - Show a “No tickets yet” message if the user has none.
4. **Unauthorized Access**:
   - If you navigate to `/tickets` without logging in, you should see a login prompt or get redirected.

**Verification**:
- Your updated tests cover these edge scenarios (failing first, then implement).
- UI or API returns meaningful error messages.

---

## 9. Document and Wrap Up

1. **README or Docs**:
   - `docs/ticket_creation_customer_interface.md` describing:
     - The creation form,
     - The listing page,
     - Where in the code to modify if you add fields like priority or tags.
2. **Demo or Screenshot**:
   - Capture how the form looks and how the list appears.
3. **Push to Git**:
   - Ensure tests pass in CI/CD.

**Verification**:
- Another dev can clone the repo, run `npm install && npm run dev`, log in, create/view tickets.
- The test suite is fully green.

---

# Final Thoughts

By following these **ultra-atomic steps**:

1. You start by **defining minimal requirements** and **writing failing tests**.
2. You **implement** the simplest version of each feature (form, create logic, listing) until tests pass.
3. You **address edge cases** (empty fields, auth checks) via incremental tests.
4. You **document** so others know how to expand or maintain the feature set.

This approach ensures a reliable, test-driven **Ticket Creation & Customer Interface** module that’s easy for a junior dev to understand, implement, and enhance.
