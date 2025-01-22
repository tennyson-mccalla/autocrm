# AutoCRM_Database_Models_TDD_Lite.md

## AutoCRM: Database + Models (TDD Lite) - Ultra-Atomic Steps

This guide is tailored for a **junior developer** working on the **AutoCRM project**. It outlines how to set up and implement the Database + Models module using **Supabase** as the backend and keeping in mind that we'll eventually deploy via **AWS Amplify 2.0**.

> **Note**: These steps are intentionally broken down into very small, verifiable tasks. The goal is clarity.

---

### Table of Contents
1. [Project Prerequisites](#1-project-prerequisites)  
2. [Initialize the Repository](#2-initialize-the-repository)  
3. [Create a Supabase Project](#3-create-a-supabase-project)  
4. [Configure Supabase Locally](#4-configure-supabase-locally)  
5. [Define Database Schema Requirements](#5-define-database-schema-requirements)  
6. [Set Up Database Migrations](#6-set-up-database-migrations)  
7. [Install and Configure Testing Framework](#7-install-and-configure-testing-framework)  
8. [Write Failing Tests First (TDD Lite)](#8-write-failing-tests-first-tdd-lite)  
9. [Implement Minimal Database Model Logic](#9-implement-minimal-database-model-logic)  
10. [Run Tests and Validate (Red → Green)](#10-run-tests-and-validate-red--green)  
11. [Refactor and Add Additional Fields or Tables](#11-refactor-and-add-additional-fields-or-tables)  
12. [Basic Integration Check with Amplify (Optional Preview)](#12-basic-integration-check-with-amplify-optional-preview)  
13. [Document and Wrap Up](#13-document-and-wrap-up)

---

### 1. Project Prerequisites

1. **Git Installed**  
   - Ensure `git --version` works.

2. **Node.js Installed**  
   - Verify with `node -v` and `npm -v`.

3. **Supabase CLI Installed** *(optional but recommended)*  
   - [Install instructions](https://supabase.com/docs/guides/cli).

4. **AWS Account** (for later Amplify deployment)  
   - Already have an AWS account and **AWS Amplify** set up (we’ll do a minimal check later).

**Verification**:  
- You can run `git --version`, `node -v`, `npm -v` without errors.  
- You have an AWS login or at least know your AWS credentials for later.

---

### 2. Initialize the Repository

1. **Create a Local Folder**  
   - `mkdir auto-crm && cd auto-crm`

2. **Initialize Git**  
   - `git init`

3. **Create a `.gitignore`**  
   - Include `node_modules/`, `.env`, and any other local config files.

**Verification**:  
- `ls -a` shows a `.git` folder and `.gitignore` file.  
- `git status` shows a clean repo (until you add files).

---

### 3. Create a Supabase Project

1. **Go to Supabase Dashboard**  
   - [https://app.supabase.com/](https://app.supabase.com/)

2. **Click “New Project”** and fill in details.  
   - Choose a strong password for the database.

3. **Note the Project URL and Anon/Public Key**  
   - You’ll need these to connect from your local code.

**Verification**:  
- You have a new Supabase project in your dashboard.  
- You see your Project URL and API keys under **Project Settings → API**.

---

### 4. Configure Supabase Locally

1. **Create a `.env` File**  
   - For example:
     ```bash
     SUPABASE_URL=https://xyzcompany.supabase.co
     SUPABASE_ANON_KEY=yourAnonKeyHere
     ```

2. **Install the Supabase JavaScript Client**  
   - `npm install @supabase/supabase-js`

3. **(Optional) Initialize Supabase CLI**  
   - `supabase init` in your project folder if you want local migrations.

4. **Test Your Connection** (pseudo-step)  
   - Create a minimal script `testConnection.js`:
     ```js
     const { createClient } = require('@supabase/supabase-js');
     // Read .env here or set them in environment
     ```
   - Just ensure no errors when you run `node testConnection.js`.

**Verification**:  
- Running your minimal test script does **not** produce an error when you import the Supabase client.  
- `.env` is present and **not** committed to GitHub.

---

### 5. Define Database Schema Requirements

1. **Refer to the AutoCRM Document**  
   - The doc states: “Ticket filing, management, and response” at a minimum.

2. **We Need at Least**  
   - A `tickets` table with `id`, `title`, `description`, `status`, `priority`, `userId`, timestamps, etc.  
   - Possibly a `users` table with roles (`customer`, `worker`, `admin`).

3. **Create a “Schema Definition” Document**  
   - For example, `docs/schema.md`:
     ```markdown
     # Database Schema
     ## tickets
     - id (UUID)
     - title (text)
     - description (text)
     - status (string/enum: open, in_progress, closed)
     - priority (integer)
     - user_id (UUID)
     - created_at (timestamp)
     - updated_at (timestamp)
     ```

**Verification**:  
- You have a short `.md` or `.txt` file outlining the schema.  
- A junior dev can read it and understand what tables and columns will exist.

---

### 6. Set Up Database Migrations

1. **Create a Migration File**  
   - Using Supabase CLI:
     ```bash
     supabase migration new initial_schema
     ```
   - It generates a SQL file: `supabase/migrations/<timestamp>_initial_schema.sql`

2. **Edit the Migration SQL**  
   - In that file:
     ```sql
     CREATE TABLE public.tickets (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       title TEXT NOT NULL,
       description TEXT,
       status TEXT NOT NULL DEFAULT 'open',
       priority INT NOT NULL DEFAULT 3,
       user_id UUID,
       created_at TIMESTAMP NOT NULL DEFAULT now(),
       updated_at TIMESTAMP NOT NULL DEFAULT now()
     );
     ```

3. **Apply the Migration**  
   - `supabase db push` or use the Supabase Dashboard to run the SQL.

**Verification**:  
- Check the Supabase dashboard → Table Editor, confirm `tickets` now exists.

---

### 7. Install and Configure Testing Framework

1. **Install Jest** (or another testing library)  
   - `npm install --save-dev jest`

2. **Create a `jest.config.js`** (if needed)  
   ```js
   module.exports = {
     testEnvironment: "node",
   };
   ```

3. **Update `package.json`**  
   ```json
    {
    "scripts": {
        "test": "jest"
        }
    }
    ```

**Verification**:
- Run `npm test` and see “No tests found” or similar output if you haven’t added tests yet.

---

### 8. Write Failing Tests First (TDD Lite)

1. **Create a Test File**  
   - `mkdir tests && touch tests/tickets.test.js`

2. **Write Simple Test Blocks (in pseudocode):**
```js
describe("Tickets Table Tests", () => {
  it("should create a ticket with valid data", async () => {
    // Attempt to call createTicket(...) - will fail because not implemented
    // Expect returned object to have an id, title, etc.
  });

  it("should retrieve a ticket by ID", async () => {
    // ...
  });

  it("should update a ticket", async () => {
    // ...
  });

  it("should delete a ticket", async () => {
    // ...
  });
});
```

3. **Run `npm test`**
    - Tests fail because we haven’t implemented the ticket model functions yet.

**Verification**:
- You see errors about undefined functions or failing assertions.
- This confirms you’re in the “Red” part of the TDD cycle.

---

### 9. Implement Minimal Database Model Logic

1. **Create a “database.js” (or .ts) File**  
   - In `src/database.js`, write placeholders:
   ```js
   export async function createTicket(data) {
  // Insert into tickets and return the inserted row
    }
    export async function getTicketById(id) { /* ... */ }
    export async function updateTicket(id, updates) { /* ... */ }
    export async function deleteTicket(id) { /* ... */ }
    ```

2. **Use Supabase Client (pseudocode)**
```js
import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// createTicket(data) => supabase.from('tickets').insert([data]).single()
// ...
```

3. **Link the Test to This File**
    - In `tests/tickets.test.js`:
```js
import {
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket
} from '../src/database';
// ...
```

**Verification**:
- The code compiles but tests likely still fail because the logic is incomplete.

---

### 10. Run Tests and Validate (Red → Green)

1. **Gradually Implement Each Function**
    - Start with `createTicket()`.
      - Insert a row into tickets and return the result.
    - Run the tests.
    - If the “create ticket” test passes, move on to `getTicketById()`, etc.
2. **Stop When Tests Pass**
    - Once all your test blocks pass, you’ve satisfied the minimal TDD acceptance for these functions.

**Verification**:
- `npm test` shows all green test results.
- You can confirm the actual table data in Supabase if you want a final sanity check.

---

### 11. Refactor and Add Additional Fields or Tables

1. **Check the Doc for More Fields**
    - “Custom fields,” “tags,” or “internal notes” might be next.
    - For instance, add a `tags TEXT[]` column or a `ticket_messages` table.

2. **Write a Failing Test First**
    - e.g., “it should store tags on a ticket,” then implement that logic.

3. **Rinse & Repeat**
    - Each new column or table → add test → implement → pass → refactor.

**Verification**:
- You can see new columns or tables in Supabase.
- Tests for those new features pass as well.

---

### 12. Basic Integration Check with Amplify (Optional Preview)

(Not a full step of TDD for the DB, but ensures future deployment is smooth.)

1. **Create a Basic Frontend (just a placeholder)**
    - Could be a React app or Next.js that calls your API or directly uses Supabase client for ticket creation.

2. **Initialize Amplify for Deployment**
    - Go to AWS Amplify console, connect your GitHub repo.
    - Amplify will build your project automatically on pushes (though you may only have a minimal front-end right now).

3. **Confirm a Deployed URL**
    - It might just show a placeholder page, but you’ll see that Amplify is set up and can deploy changes.

**Verification**:
- Amplify shows “Build Succeeded” or similar on each commit to the main branch.
- You have a URL to share, even if it’s not fully functional yet.

---

### 13. Document and Wrap Up

1. **Add a Short README or doc note** (e.g., `docs/DatabaseModule.md`)
    - Summarize how the Database + Models module is structured, how to run tests, how to run migrations.

2. **Create Issues or To-Dos for Next Steps**
    - E.g., “Implement internal notes,” “Add multiple user roles,” “Integrate AI in Week 2,” etc.

3. **Push Everything to GitHub**
    - Make sure `.env` is in `.gitignore`.

**Verification**:
- A new dev can clone the repo, run migrations, and test the Database + Models module using the instructions in your README.
- You see the final commit on GitHub with a description of what’s done.

---

### Final Remarks

- This ultra-atomic breakdown ensures a junior dev knows exactly what to do at each stage.
- By following these steps, you’ll have ticket filing (create/read/update/delete) in a Supabase database and a minimal testing setup, __which fulfills the core Database + Models requirement__ for your __AutoCRM__ Week 1 MVP.
- Remember, additional features (tags, internal notes, etc.) can be layered in using the same TDD-lite approach.
- Once the back end is stable, you can move on to the other modules (auth, customer/agent UI, etc.) and eventually integrate AI features in Week 2.


