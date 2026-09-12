# Pulazhiyil Kudumbayogam — Digital Family Legacy Archive 🌿

> A production-style digital archive for preserving family history, genealogy, people, photographs, achievements, events, and heritage records.

**Live:** https://pullazhiyil.com/

**Stack:** Next.js · React · TypeScript · Tailwind CSS · Supabase/PostgreSQL · d3-hierarchy

## What this project solves

Family history is often scattered across paper records, old photographs, personal devices, spreadsheets, and memories. This project turns that information into a searchable, maintainable digital archive that future family members can continue to update.

The application combines a public heritage website with a private administrative system for maintaining the underlying data.

## Highlights

### 🌳 Interactive genealogy

A data-driven family tree represents generations, parent-child relationships, spouses, descendants, and branches using `d3-hierarchy`.

### 🗂️ Digital archive

Structured sections cover family history, members, achievements, evangelists/service stories, photographs, events, obituaries, and heritage records.

### 🔐 Admin system

Authenticated administrative routes support member, event, heritage, dues, roles, and audit-log management.

### 🖼️ Image management

Photographs are stored in Supabase Storage while relational metadata stays in PostgreSQL. The application stores object paths rather than hardcoded image URLs, making the storage layer easier to evolve.

### 📱 Modern responsive UI

The site uses a restrained heritage visual language with responsive layouts, subtle motion, and reusable components.

## Architecture

```text
                         ┌───────────────────┐
                         │      Visitors     │
                         └─────────┬─────────┘
                                   │
                                   ▼
                         ┌───────────────────┐
                         │   Next.js App      │
                         │    Router          │
                         └─────────┬─────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼                                   ▼
        ┌──────────────────┐               ┌──────────────────┐
        │ Public archive   │               │ Admin dashboard  │
        │ pages + tree     │               │ + permissions    │
        └─────────┬────────┘               └─────────┬────────┘
                  │                                  │
                  └────────────────┬─────────────────┘
                                   ▼
                         ┌───────────────────┐
                         │     Supabase      │
                         ├───────────────────┤
                         │ PostgreSQL        │
                         │ Auth              │
                         │ Storage           │
                         └───────────────────┘
```

## Main application areas

| Route | Purpose |
|---|---|
| `/` | Heritage-focused homepage |
| `/history` | Historical chapters and family story |
| `/tree` | Interactive genealogy |
| `/members` | Family member directory |
| `/achievers` | Achievements and excellence archive |
| `/gallery` | Family photograph archive |
| `/events` | Family events |
| `/obituary` | Memorial records |
| `/dashboard` | Authenticated dashboard |
| `/admin` | Administration |
| `/admin/members` | Member management |
| `/admin/events` | Event management |
| `/admin/heritage` | Heritage records |
| `/admin/dues` | Dues management |
| `/admin/roles` | Roles and permissions |
| `/admin/audit-log` | Administrative audit history |

## Tech stack

**Frontend**

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

**Backend / data**

- Supabase Auth
- PostgreSQL
- Supabase Storage
- Next.js server/client integration

**Visualization**

- d3-hierarchy

## Data model

The application uses relational data because family relationships are structured. PostgreSQL holds entities such as members, relationships, events, heritage records, roles, and audit information. The genealogy UI transforms that relational information into a tree representation for visualization.

## Image storage flow

```text
Admin selects photo
        ↓
File validation
        ↓
Supabase Storage upload
        ↓
Object path saved with metadata
        ↓
Application resolves image URL
        ↓
Photo appears in the archive
```

Recommended upload handling includes file-type validation, reasonable size limits, unique object names, upload/error states, and cleanup of orphaned objects.

## Security

- Supabase Row Level Security protects private data.
- Administrative writes are restricted to authorized users/roles.
- Destructive actions should remain role-protected.
- Audit logging records meaningful administrative changes.
- Secrets must stay outside the repository and server-only credentials must never be exposed to browser code.

## Local development

### Prerequisites

- Node.js 20+
- npm
- Git
- A Supabase project

### Setup

```bash
git clone https://github.com/Rubenjoe/FamilyWebsite.git
cd FamilyWebsite
npm install
```

Create `.env.local` and provide the Supabase variables expected by the existing helper files.

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

Quality checks:

```bash
npm run lint
npm run build
npm run start
```

## Repository structure

```text
FamilyWebsite/
├── app/
│   ├── history/
│   ├── tree/
│   ├── members/
│   ├── achievers/
│   ├── gallery/
│   ├── events/
│   ├── obituary/
│   ├── dashboard/
│   └── admin/
├── components/
├── data/
├── public/
├── supabase/
│   └── migrations/
├── AGENTS.md
├── package.json
└── README.md
```

## Engineering notes

The project is intentionally built so the public archive and administrative workflows share the same underlying data model. This keeps new archive features maintainable instead of turning every page into an isolated static page.

The repository also uses migrations to track database evolution and project-specific development rules through `AGENTS.md`.

## Roadmap

- More structured CMS-backed archive content
- Expanded gallery metadata, albums, and people tagging
- Stronger search across the archive
- Further genealogy navigation and relationship views
- Performance and accessibility refinement

## License and usage

This is a family-oriented private archive project. No open-source license is currently specified.

## Author

**Ruben Joemon** — [@Rubenjoe](https://github.com/Rubenjoe)
