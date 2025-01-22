# AutoCRM_Database_Models_TDD_Lite_part1.md

## AutoCRM: Database + Models (TDD Lite) - **Part 1**

This guide is tailored for a **junior developer** working on the **AutoCRM project**. It outlines how to set up and implement the Database + Models module using **Supabase** as the backend and keeping in mind that we'll eventually deploy via **AWS Amplify 2.0**.

> **Note**: These steps are intentionally broken down into very small, verifiable tasks. The goal is clarity.

---

### Table of Contents
1. [Project Prerequisites](#1-project-prerequisites)  
2. [Initialize the Repository](#2-initialize-the-repository)  
3. [Create a Supabase Project](#3-create-a-supabase-project)  
4. [Configure Supabase Locally](#4-configure-supabase-locally)  
5. [Define Database Schema Requirements](#5-define-database-schema-requirements)

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

**End of Part 1.** Continue to **Part 2** for Steps 6–10.