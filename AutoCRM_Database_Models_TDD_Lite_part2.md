# AutoCRM: Database + Models (TDD Lite) - **Part 2**

This file continues from **Part 1**. Make sure you’ve completed Steps 1–5 before proceeding.

---

## Table of Contents (Part 2)
6. [Set Up Database Migrations](#6-set-up-database-migrations)
7. [Install and Configure Testing Framework](#7-install-and-configure-testing-framework)
8. [Write Failing Tests First (TDD Lite)](#8-write-failing-tests-first-tdd-lite)
9. [Implement Minimal Database Model Logic](#9-implement-minimal-database-model-logic)
10. [Run Tests and Validate (Red → Green)](#10-run-tests-and-validate-red--green)

You will find Steps 11–13 and final remarks in **Part 3**.

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

**End of Part 2.** Continue to **Part 3** for Steps 11–13 plus Final Remarks.