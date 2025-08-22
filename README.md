# Note Taking App

A collaborative note-taking application built with **Next.js (pages router)**, **Prisma**, and **PostgreSQL**. The app supports private and public notes, sharing with permissions, and commenting.

---

## 🚀 Features

* **Authentication**

  * User registration & login with session cookies
* **Notes Management**

  * Create, edit, delete notes
  * Set note visibility: PRIVATE / PUBLIC
* **Sharing**

  * Share private notes with other users via email/ID
  * Granular permissions: `READ`, `COMMENT`, `EDIT`
* **Comments**

  * Comment on notes (basic support for nested structure, though nesting is not fully implemented)
* **Dashboard**

  * View own private notes, public notes, and shared notes

---

## 🗂 Database Schema (simplified)

* **User** → owns notes, can receive shared notes, can comment
* **Note** → content with visibility (PRIVATE / PUBLIC)
* **SharedNote** → junction table (note ↔ user) with permission
* **Comment** → attached to notes

---

## ⚙️ Tech Stack

* **Next.js (pages router)** → Routing & API routes
* **Prisma** → ORM for PostgreSQL
* **PostgreSQL** → Database
* **bcryptjs** → Password hashing
* **TailwindCSS** → Styling
* **React hooks** → State management

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd note-taking-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"
NEXTAUTH_SECRET="your-secret"
```

### 4. Migrate database

```bash
npx prisma migrate dev
```

### 5. Run the app

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

* **Frontend & API**: [Vercel](https://vercel.com/)
* **Database**: [Supabase](https://supabase.com/) (Postgres free tier)

---

## 🛠️ Next Steps / Improvements

* Implement nested comments fully
* Move modal components (create/edit/share/delete) into separate components for cleaner code
* Explore SSR for public notes page (cache-friendly)
* Add testing (unit + integration)
* Add rate limiting / input validation for security

---
