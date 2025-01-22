# AutoCRM_Authentication_TDD_Lite.md

## Overview

This document provides a **TDD-first approach** for building the **Authentication/User Management** module in the AutoCRM project, drawing on the lessons learned from the first (Database + Models) module. It focuses on:

1. **Clear Interfaces**: Functions or endpoints for sign-up, login, role assignment, etc.
2. **Consistent Data Model**: Tying user profiles and roles together with the existing tickets system.
3. **Testing (TDD Lite)**: Defining tests first, then implementing just enough logic to pass them.
4. **Role-Based Access Control**: Managing `customer`, `worker`, and `admin` roles using RLS or other Supabase policies.

---

## 1. Define Requirements & Data Model

- **Core Features**
  - **Signup**: Create an account with email/password.
  - **Login**: Return an authenticated session.
  - **Role Management**: Differentiate among `customer`, `worker`, and `admin`.
  - **Session Handling**: Validate user sessions securely.

- **Data Structures**
  - **Supabase Auth** (built-in)
    - Manages basic email/password, hashed storage, etc.
  - **Profiles Table** (optional but common)
    - `id` (references `auth.users.id`)
    - `role` (e.g., `customer`, `worker`, `admin`)
    - `metadata` for extensibility

- **RLS Policies**
  - Ensure users can only see or modify their own profiles, unless they have elevated roles (e.g., `admin`).

**Verification**:
- A short doc (like `docs/auth_schema.md`) clearly explains the `profiles` table and how it references `auth.users`.
- Plan for role-based queries (e.g., admin can query all profiles).

---

## 2. Write High-Level Test Descriptions (Failing First)

Create a test file (e.g., `auth.test`). Even without actual logic, sketch out test statements:

- **“should allow a new user to sign up with valid email/password”**
  - Attempt a signup.
  - Expect user data to be returned.
- **“should reject signup with invalid email”**
- **“should allow a user to log in with correct credentials”**
- **“should reject a user with incorrect credentials”**
- **“should retrieve a user profile with the correct role”**
- **“should only allow customers to see their own profiles”**
- **“should allow an admin to list all users”**

At this stage, all tests fail because no auth logic exists.

**Verification**:
- Running tests yields errors or undefined function failures.
- The test suite enumerates the key authentication scenarios.

---

## 3. Set Up or Update Schema & RLS

1. **Add/Confirm `profiles` Table**
   - Includes an `id` referencing `auth.users.id`.
   - Role stored as text or ENUM (e.g., `customer`, `worker`, `admin`).
2. **Apply a Migration**
   - Use Supabase migrations (or your chosen tool).
3. **Define RLS Policies**
   - “Customers see only their row.”
   - “Admins can see all rows.”

**Verification**:
- Check the Supabase dashboard or your DB tool to confirm the table and RLS policies exist.
- Tests still fail because no sign-up or login logic is in place.

---

## 4. Implement Minimal Auth Logic (Pseudocode)

Create a file (e.g., `auth.ts`). Write pseudocode functions:

- **`signUpUser(email, password, role)`**
  - Pseudocode:
    ```
    call someAuthClient.signUp({ email, password })
    if signUp successful:
      insert into profiles with the new user ID and role
      return user info
    otherwise:
      return error
    ```
- **`signInUser(email, password)`**
  - Pseudocode:
    ```
    call someAuthClient.signInWithPassword({ email, password })
    if successful:
      return session details
    else:
      return error
    ```
- **`getUserProfile(userId)`**
  - Pseudocode:
    ```
    select from profiles where id == userId
    return the role and any metadata
    ```
- **`listAllUsers()`** (for admins):
  - Pseudocode:
    ```
    if admin role check passes:
      return all profiles
    else:
      throw access denied
    ```

Link these functions to your tests; they will still fail initially.

**Verification**:
- Tests recognize the functions but fail due to incomplete logic or policy issues.

---

## 5. Run Tests & Gradually Fix Failing Cases

1. **Check “should allow a new user to sign up”**
   - Implement just enough logic to pass this test.
2. **Proceed to “login with correct credentials”**
   - Fill out the sign-in pseudocode.
3. **Handle Invalid Credentials**
   - Return error or test for a certain status code.
4. **Confirm RLS or role logic**
   - For “customers can only see their own profile,” ensure RLS denies other rows.
   - For “admin can list all profiles,” ensure your policy or service role usage passes the test.

**Verification**:
- One by one, your tests go from red to green.
- You confirm real data in the DB and Supabase `auth.users` table.

---

## 6. Refine & Add Edge Cases

- **Email Validation**
  - If your test suite checks invalid emails, handle that.
- **Role Enforcement**
  - If a user tries to upgrade themselves to admin, test the rejection logic.
- **Metadata Updates**
  - If you support changing user info, add a failing test first, then implement the update.

**Verification**:
- Additional tests pass.
- The module handles the essential and edge scenarios without regressions.

---

## 7. (Optional) Integration Test with Tickets

- **Create a user** → **Create a ticket** → **Check if that ticket belongs to them**.
- **Assign a worker** → Ensure the worker can access that ticket.
- These end-to-end checks verify that roles align with the rest of the system.

**Verification**:
- A small integration test might confirm RLS is consistent.
- If your system fails to show the correct data, adjust policies or queries.

---

## 8. Document & Finalize

1. **Add a Doc** (`docs/auth_module.md` or similar)
   - Summarize sign-up, login, roles, and how you tested them.
2. **Push to Repo**
   - Ensure your CI pipeline runs the tests.
   - Keep environment variables secure and `.env` out of version control.

**Verification**:
- CI passes all tests.
- Team members can easily replicate your setup.

---

## Incorporating Lessons Learned

- **ENUM or Checked Text** for roles, ensuring type safety.
- **Comprehensive RLS** from the start, guided by TDD.
- **Robust Test Coverage**: Add negative test cases to reduce security loopholes.
- **Consistent Environment**: Reuse service role setups from the first module, keep `.env` usage consistent.

---

## Final Thoughts

By following this TDD outline, you:

1. **Define** each auth scenario before coding.
2. **Write** failing tests that articulate sign-up, login, and role-based constraints.
3. **Implement** minimal logic to pass each test, refining for edge cases.
4. **Ensure** a consistent data model (`profiles` table + `auth.users`) integrated with your existing ticket system.

This approach yields a secure, tested, and maintainable authentication module—paving the way for advanced user experiences, admin tools, and future AI integrations.
