# Project Overview

## 1. Project Structure
Struktur project menggunakan Next.js dengan **pages router**. Alurnya sebagai berikut:

- `/pages/` → berisi halaman utama (auth, dashboard, notes, dll).
- `/pages/api/` → API routes untuk handle backend logic (auth, note CRUD, share, comment).
- `/prisma/` → schema Prisma (`schema.prisma`) dan migrasi database.
- `/components/` → komponen UI (modal create/edit/share, dll).
- `/styles/` → file TailwindCSS config dan styling tambahan.
- `package.json` → daftar dependencies project.

Struktur ini mengikuti pola **monolith fullstack** bawaan Next.js, di mana frontend dan backend API ada dalam satu codebase.

---

## 2. Rancangan Struktur Database

Menggunakan **PostgreSQL** + **Prisma ORM**.  

### Tabel & Relasi

- **User**
  - Menyimpan informasi akun (id, nama, email, password hash).
  - Relasi ke notes (sebagai owner), shares, dan comments.

- **Note**
  - Dimiliki oleh 1 user (owner).
  - Punya field `visibility` (PRIVATE / SHARED / PUBLIC).
  - Bisa di-share ke user lain via tabel `SharedNote`.
  - Punya relasi ke `Comment`.

- **SharedNote**
  - Jembatan Many-to-Many antara Note ↔ User.
  - Menyimpan permission (READ / COMMENT / EDIT).

- **Comment**
  - Komentar di note, relasi ke `User` (author).
  - Support nested comment via `parentId` (meski nested belum dipakai penuh).

### Alasan Struktur
- **Visibility** enum memudahkan filter notes (private, shared, public).  
- **SharedNote** memberi fleksibilitas permission tanpa perlu bikin tabel berbeda.  
- **Comment** dengan `parentId` → scalable kalau mau nested discussion.  
- **Indexing** di beberapa field (`ownerId, visibility`, `noteId, createdAt`) → optimisasi query.

---

## 3. Flow Process Aplikasi

1. **Auth**
   - User register → password di-hash pakai bcryptjs → disimpan di DB.  
   - Login → validasi password → buat session cookie.  
   - Session digunakan untuk proteksi route dan API.

2. **Notes**
   - User bisa CRUD note (title, contentMd).  
   - Owner bisa ubah visibility (PRIVATE/SHARED/PUBLIC).  
   - Soft delete tersedia via field `deletedAt`.

3. **Share**
   - Owner bisa share note ke user lain (via email/userId).  
   - Permission disimpan di `SharedNote`.  
   - Unique constraint `@@unique([noteId, userId])` memastikan gak ada duplikasi.

4. **Comment**
   - User bisa kasih komentar sesuai permission.  
   - Komentar dihubungkan ke note & author.

5. **Dashboard**
   - Menampilkan semua note:  
     - Private (punya user),  
     - Shared (via SharedNote),  
     - Public (visibility PUBLIC).

---

## 4. Rendering (CSR / SSR / SSG)

Aplikasi ini **100% Client-Side Rendering (CSR)**:

- **Private & Shared Notes** → wajib CSR karena butuh session user.  
- **Public Notes** → walaupun sifatnya publik, data sering berubah (update note & komentar), jadi tetap fetch via API (CSR).  
- **SSR / SSG** → tidak digunakan, karena:  
  - SSR hanya relevan kalau data jarang berubah & penting untuk SEO.  
  - SSG dipakai untuk konten statis, yang tidak ada di use case app ini.  

---

## 5. Library / Plugin yang Digunakan

- **Next.js (pages router)** → Framework fullstack (frontend + API).  
- **Prisma** → ORM untuk koneksi & query PostgreSQL.  
- **PostgreSQL (Supabase)** → Database utama.  
- **bcryptjs** → Hashing password untuk auth.  
- **TailwindCSS** → Utility-first CSS framework untuk styling.  
- **React Hooks** → State management frontend.  

---

## Ringkasan

Aplikasi ini adalah **Note Taking App** dengan fitur:  
- Auth (register, login, session).  
- Note CRUD dengan visibility (Private/Public/Shared).  
- Share note dengan granular permission.  
- Komentar dengan support nested.  
- Dashboard untuk melihat semua catatan terkait user.  

Rendering dilakukan full **CSR**, supaya semua data selalu up-to-date dan sesuai session masing-masing user.
