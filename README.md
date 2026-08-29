# Pulazhiyil Kudumbayogam — Digital Family Legacy Archive

> A private-family-oriented digital heritage platform for preserving the history, genealogy, people, photographs, achievements, events, and memories of the Pulazhiyil Kudumbayogam.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Storage-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Live website:** https://pullazhiyil.com/

---

## Table of Contents

- [Overview](#overview)
- [Why This Project Exists](#why-this-project-exists)
- [Core Features](#core-features)
- [Application Areas](#application-areas)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data and Backend](#data-and-backend)
- [Supabase Storage](#supabase-storage)
- [Authentication and Admin](#authentication-and-admin)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Database Migrations](#database-migrations)
- [Image and Asset Management](#image-and-asset-management)
- [Family Tree Architecture](#family-tree-architecture)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [SEO and Metadata](#seo-and-metadata)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Project Conventions](#project-conventions)
- [Future Improvements](#future-improvements)
- [License and Usage](#license-and-usage)
- [Credits](#credits)

---

## Overview

**Pulazhiyil Kudumbayogam** is a digital family archive designed to preserve and present a family's legacy in a form that can remain useful for future generations.

The project combines a traditional family-history concept with a modern web application. Instead of treating family information as a static collection of pages, the site connects several kinds of family knowledge:

- family history and historical narratives
- genealogy and relationships
- family members and office bearers
- achievements and service
- photographs and visual archives
- events and gatherings
- heritage records
- administrative content management

The design intentionally uses a restrained heritage-inspired visual language: forest green, warm cream, muted gold, serif display typography, and subtle motion.

The implementation is designed to stay relatively inexpensive to operate for a family-sized audience. Application logic, database queries, genealogy layout, image management, and administrative tooling are the main sources of complexity; the project does not depend on video-heavy hosting or an infrastructure-heavy architecture.

---

## Why This Project Exists

A family can accumulate centuries of history but still have that history scattered across:

- memory and oral tradition
- paper documents
- personal photo albums
- old invitations and certificates
- individual family members' phones and computers
- disconnected spreadsheets

This project provides a central digital home for that material.

The long-term objective is not simply to publish a family website. It is to create a maintainable family archive where new generations can continue adding people, photographs, stories, records, and events without having to rebuild the site.

---

## Core Features

### 1. Family Heritage Homepage

The homepage introduces the family identity and provides entry points into the major archive areas.

It includes:

- family branding and hero imagery
- heritage pillars
- family highlights
- achievements
- evangelists/service stories
- event previews
- links into the archive

### 2. Interactive Family Tree

The genealogy experience is one of the central technical features of the project.

The tree is intended to represent:

- generations
- parent-child relationships
- spouses
- descendants
- family branches
- selected people

The implementation uses a data-driven hierarchy rather than requiring every position to be manually hardcoded.

The current stack includes `d3-hierarchy`, which provides the foundation for hierarchical tree layout. fileciteturn1file0L2-L2

### 3. History Archive

The History section presents the family's history as structured chapters, including the origin story, migration, emergence of branches, growth, formation of the Kudumbayogam, revival, and continuing legacy.

The history content is stored as structured data inside the page implementation today, making it straightforward to evolve into a CMS-backed archive later. fileciteturn6file0L2-L2

### 4. Family Members

The Members experience presents family members and relevant metadata such as:

- name
- branch
- generation
- location
- role
- photograph

The same people-oriented data model supports future profile pages and deeper relationship navigation.

### 5. Achievements / Excellence Registry

Family achievements are presented as curated cards with:

- person
- branch
- year or time marker
- achievement title
- description
- image

The homepage currently includes achievement content directly in its data model. fileciteturn3file0L2-L2

### 6. Evangelists / Faith and Service

The project also includes an archive area for family members recognized for religious or community service.

### 7. Gallery

The Gallery provides a place for family photographs and can be expanded into a more structured archive with:

- albums
- categories
- branch filters
- dates
- people associated with photographs

### 8. Events

Events support the family community side of the project, including upcoming and historical family gatherings.

### 9. Heritage Records

The application includes an admin-managed heritage record system backed by Supabase. Heritage records can include uploaded photographs and archival metadata.

### 10. Admin Dashboard

The project includes administrative areas for managing family data and operational records, including:

- members
- events
- heritage records
- dues
- roles
- audit log

The repository currently contains dedicated routes under `app/admin/` for these areas. fileciteturn2file0L2-L2

---

## Application Areas

The main application currently contains routes such as:

| Route | Purpose |
|---|---|
| `/` | Heritage-focused homepage |
| `/history` | Family history and historical chapters |
| `/tree` | Interactive family genealogy |
| `/members` | Family member directory |
| `/achievers` | Achievements / excellence archive |
| `/obituary` | Memorial and obituary area |
| `/gallery` | Photograph archive |
| `/events` | Family events |
| `/contact` | Contact / communication |
| `/dashboard` | Dashboard entry point |
| `/admin` | Administration area |
| `/admin/members` | Member management |
| `/admin/events` | Event management |
| `/admin/heritage` | Heritage record management |
| `/admin/dues` | Dues management |
| `/admin/roles` | Roles / permission management |
| `/admin/audit-log` | Administrative audit log |

These routes are visible in the current application tree. fileciteturn2file0L2-L2

---

## Technology Stack

### Frontend

- **Next.js 16** using the App Router
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Framer Motion 12** for motion and transitions
- **Lucide React** for icons

The package configuration confirms the current versions and dependencies. fileciteturn1file0L2-L2

### Data and Backend

- **Supabase**
- **PostgreSQL** for relational data
- **Supabase Auth** for authentication
- **Supabase Storage** for managed image files
- **Supabase SSR** support for Next.js server/client integration

### Genealogy / Visualization

- **d3-hierarchy** for hierarchical data and tree layout

### Tooling

- **ESLint**
- **TypeScript compiler**
- **Vercel-compatible Next.js deployment**

---

## Architecture

The project follows the Next.js App Router structure with route-specific pages, reusable components, shared styling, and a Supabase-backed data layer.

At a high level:

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── Public pages
   ├── Family archive pages
   ├── Interactive family tree
   └── Admin pages
          │
          ▼
     Supabase clients
          │
     ┌────┴───────────────┐
     │                    │
     ▼                    ▼
PostgreSQL            Storage
 family/admin data     family photos
     │                    │
     └────────┬───────────┘
              ▼
       Family archive UI
```

The root layout currently imports global styles, the shared Navbar and Footer, defines site metadata, and establishes the global page shell. fileciteturn4file0L2-L2

---

## Project Structure

A simplified view of the current repository:

```text
FamilyWebsite/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── history/
│   │   └── page.tsx
│   ├── tree/
│   │   ├── page.tsx
│   │   └── FamilyTree.tsx
│   ├── members/
│   │   └── page.tsx
│   ├── achievers/
│   │   └── page.tsx
│   ├── gallery/
│   │   └── page.tsx
│   ├── events/
│   │   └── page.tsx
│   ├── obituary/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── members/
│   │   ├── events/
│   │   ├── heritage/
│   │   ├── dues/
│   │   ├── roles/
│   │   └── audit-log/
│   │
│   └── dashboard/
│       └── page.tsx
│
├── components/
│   └── ... shared UI and layout components
│
├── data/
│   └── mockData.ts
│
├── public/
│   ├── images/
│   ├── achv/
│   ├── obituary/
│   ├── Evangelist/
│   └── members/
│
├── supabase/
│   └── migrations/
│
├── AGENTS.md
├── package.json
└── README.md
```

The repository also contains `AGENTS.md`, which documents project-specific working rules and points agents to a separate shared project-memory vault. That shared memory must not be copied into the Git repository and credentials must never be stored there. fileciteturn5file0L2-L2

---

## Data and Backend

Supabase is used as the application backend.

The relational database is responsible for persistent data such as:

- members
- family administration
- events
- heritage records
- audit records
- roles and permissions

The repository's migration history includes the creation of admin tables, audit functionality, administrative helpers, account-related functionality, and heritage records.

The project is designed around a relational data model because family relationships are inherently structured. The genealogy layer can then transform that relational data into a tree/graph representation for the UI.

---

## Supabase Storage

Heritage photographs are intended to be stored in a dedicated Supabase Storage bucket rather than embedded directly in PostgreSQL rows.

The current project uses the bucket:

```text
heritage-photos
```

The bucket is intended for public read access for heritage content while write/delete operations are restricted through application authorization policies.

A typical storage flow is:

```text
Admin selects image
       ↓
Client validates file
       ↓
Supabase Storage upload
       ↓
Storage object path returned
       ↓
Heritage record stores image reference/path
       ↓
UI resolves the image URL
       ↓
Photo appears in the archive
```

### Why store a path instead of baking URLs everywhere?

A storage path is generally more flexible than hardcoding a full storage URL throughout the application. It makes it easier to change storage configuration later without rewriting stored data.

### Recommended upload rules

- Accept JPEG, PNG, and WEBP where appropriate.
- Validate file type before upload.
- Enforce a reasonable size limit.
- Generate unique object names to avoid filename collisions.
- Show upload progress or a loading state.
- Do not create the database record if the file upload fails.
- Clean up orphaned objects when safe.

---

## Authentication and Admin

The project has a dedicated administrative system built around Supabase authentication and PostgreSQL-backed authorization helpers.

Admin pages include areas for member, event, heritage, dues, roles, and audit-log management. fileciteturn2file0L2-L2

The general rule is:

- public users can browse public archive content
- authenticated authorized users can access administrative functions
- destructive operations should be restricted to authorized roles
- audit logging should record meaningful administrative changes

Never place Supabase service-role credentials in browser code.

---

## Getting Started

### Prerequisites

Install:

- Node.js 20+ recommended
- npm
- a Supabase project
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Rubenjoe/FamilyWebsite.git
cd FamilyWebsite
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```text
.env.local
```

Add the required Supabase environment variables described below.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 5. Run linting

```bash
npm run lint
```

### 6. Create a production build locally

```bash
npm run build
```

### 7. Start the production build

```bash
npm run start
```

---

## Environment Variables

The application uses Supabase. A typical Next.js client-side setup will require values similar to:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the exact variable names expected by the Supabase helper files already present in the project. Do not invent a second naming convention if the repository already has one.

### Security rules

Never commit:

- service-role keys
- database passwords
- JWT secrets
- access tokens
- private credentials
- `.env.local`

Public client configuration is not a substitute for database security. Supabase Row Level Security and Storage policies must still protect privileged operations.

---

## Development Workflow

For normal development:

```bash
npm install
npm run dev
```

For quality checks:

```bash
npm run lint
npm run build
```

A recommended workflow for feature changes is:

1. Inspect the existing page/component and data flow.
2. Reuse existing utilities and design tokens.
3. Make the smallest focused change that solves the problem.
4. Keep the visual identity consistent.
5. Test desktop and mobile behavior.
6. Run linting.
7. Run a production build.
8. Verify the live flow that was changed.

---

## Database Migrations

The repository contains SQL migrations under:

```text
supabase/migrations/
```

These migrations represent the database evolution of the project.

Examples of the current migration themes include:

```text
20260827000001_admin_tables.sql
20260827000002_audit_trigger.sql
20260827000003_seed_admin.sql
20260827000004_admin_helpers.sql
20260828000005_admin_account_creation.sql
20260828000006_restrict_function_execution.sql
20260829000007_heritage_records.sql
20260829000008_heritage_storage_and_policies.sql
```

### Important migration rule

Do not blindly execute all migration files against a database that may already contain some of the migrations.

Before running a migration manually, check the database migration history and the target objects first.

For a fresh Supabase database, apply migrations in chronological order according to the project's migration workflow.

For an existing database, apply only the migration(s) that are actually missing.

### Storage migration

The heritage storage migration provisions the `heritage-photos` bucket and associated policies. It should be applied only after the prerequisite database functions and heritage tables exist.

---

## Image and Asset Management

The project currently contains both local static assets and Supabase-managed assets.

### Local assets

Static assets used by the public site live under `public/`, for example:

```text
public/images/
public/achv/
public/obituary/
public/Evangelist/
public/members/
```

### Supabase-managed assets

New admin-managed heritage photographs should use Supabase Storage rather than being written into the repository at runtime.

### Naming recommendations

For persistent user/admin uploads, prefer unique names such as:

```text
<uuid>-sanitized-filename.jpg
```

instead of:

```text
family.jpg
```

This prevents accidental overwrites when different people upload files with the same original name.

---

## Family Tree Architecture

The family tree is the most data-structural part of the application.

The preferred conceptual model is:

```text
Person
  │
  ├── parent relationships
  ├── spouse relationships
  └── descendant relationships
```

The relational database remains the source of truth. The frontend converts those relationships into a hierarchical visualization.

The tree uses `d3-hierarchy` in the current stack. fileciteturn1file0L2-L2

### Design goals

The family tree should:

- clearly communicate generations
- distinguish family branches
- preserve parent/child semantics
- represent spouses correctly
- support large families without manual positioning
- remain usable on mobile
- avoid excessive client-side rendering work
- prioritize readable names and meaningful relationships

### Important implementation principle

Do not hardcode node coordinates for every family member.

Use a layout algorithm so that the tree can adapt when family data changes.

This is especially important for a real family archive where the number of people will grow over time.

---

## Performance

The project is intentionally designed to avoid infrastructure-heavy features such as video hosting.

Performance priorities include:

- Next.js server-side rendering and static rendering where appropriate
- optimized image loading
- lazy-loaded below-the-fold imagery
- limited client-side JavaScript
- efficient tree calculations
- avoiding unnecessary React re-renders
- sensible use of Framer Motion
- keeping repeated layout/style logic reusable

The homepage already contains examples of image lazy loading and animation gating so content such as carousels does not start unnecessary work before it is visible. fileciteturn3file0L2-L2

### Practical performance rules

- Do not load original-resolution photographs when a smaller display size is enough.
- Prefer responsive image sizing.
- Avoid autoplay-heavy media.
- Do not animate large numbers of DOM nodes continuously.
- Memoize expensive calculations only when profiling or code structure justifies it.
- Keep data queries focused and avoid fetching unused rows.

---

## Accessibility

Because the primary audience includes older family members, readability and clarity are important product requirements, not optional polish.

The UI should prioritize:

- readable font sizes
- sufficient contrast
- visible dates and years
- prominent names
- clear roles
- easy-to-understand buttons
- obvious links
- keyboard navigation where appropriate
- meaningful image alt text

Avoid making essential information tiny simply to preserve an extremely minimal aesthetic.

A family archive should remain comfortable to read on a normal laptop or desktop display.

---

## SEO and Metadata

The root layout currently defines metadata for the application, including the title and description. fileciteturn4file0L2-L2

The current project also includes a logo-based favicon, application icon, Apple icon, and Open Graph image generation/copy workflow through the `copy-logo` npm script. fileciteturn1file0L2-L2

Recommended SEO practices for the public archive:

- unique page titles
- accurate descriptions
- meaningful Open Graph images
- canonical URLs where needed
- sitemap generation
- robots configuration
- descriptive alt text
- semantic headings
- structured data for relevant public content

Do not expose private family records through public indexing.

---

## Deployment

The application is built with Next.js and is suitable for deployment on Vercel or another Node-compatible platform.

### Typical Vercel flow

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Configure environment variables.
4. Set the production branch to `main`.
5. Deploy.
6. Verify the custom domain.
7. Test authentication and Supabase connectivity in production.

### Production checklist

Before production deployment:

```text
[ ] npm run lint passes
[ ] npm run build passes
[ ] Supabase URL configured
[ ] Supabase anon key configured
[ ] RLS policies verified
[ ] Storage policies verified
[ ] Admin authentication tested
[ ] Heritage upload tested
[ ] Images display after refresh
[ ] Mobile layout tested
[ ] No secret credentials committed
[ ] Public routes behave correctly
```

---

## Security Notes

This project handles family information and images, so access control matters.

### Never expose privileged secrets

Do not place a Supabase service-role key in client components, browser bundles, GitHub, or `.env` files committed to source control.

### Use database policies

The application should rely on Supabase authorization policies for data access rather than trusting the UI alone.

### Restrict admin actions

Operations such as:

- creating or deleting heritage records
- uploading storage objects
- deleting storage objects
- managing roles
- modifying member records

should be restricted to the appropriate roles.

### Treat archive content carefully

Family photographs, memorial information, contact details, and historical records may contain personal information. Only publish content the family has approved for public access.

---

## Troubleshooting

### The page loads but Supabase data is missing

Check:

1. `.env.local` values.
2. Supabase project URL.
3. Supabase anon key.
4. Browser console errors.
5. Row Level Security policies.
6. Whether the expected records actually exist.

### Heritage image uploads fail

Check:

1. The `heritage-photos` bucket exists.
2. Storage policies allow the authenticated role to upload.
3. The authenticated user is actually authorized.
4. The selected file passes validation.
5. The browser request is reaching Supabase.
6. The database record is not being inserted before a successful upload.

### Images upload but do not display

Check:

1. The saved image path is correct.
2. The bucket is public if the application expects public URLs.
3. The generated storage URL is correct.
4. The object really exists in the bucket.
5. The frontend is not using an expired signed URL.

### A migration fails

Do not immediately rerun every migration.

First determine:

- which objects already exist
- which migration has already been applied
- whether the migration depends on another function/table/policy

Then apply only the missing migration or make a targeted correction.

---

## Contributing

This repository is primarily maintained as a family project.

Contributions should preserve the purpose of the archive and avoid introducing unnecessary complexity.

### For code changes

- Keep TypeScript strict and readable.
- Prefer reusable components.
- Avoid `any` unless absolutely unavoidable.
- Reuse existing utilities.
- Avoid unrelated refactors in feature PRs.
- Keep public-facing design consistent.
- Test the affected flow on desktop and mobile.

### For historical content

Accuracy matters more than volume.

Do not invent:

- family members
- dates
- relationships
- historical events
- achievements
- branch names

When historical information is uncertain, mark it for family review rather than silently publishing speculation.

---

## Project Conventions

### Naming

Use clear, descriptive names for:

- components
- functions
- routes
- database fields
- storage objects

### Components

Prefer small components with one clear purpose.

Avoid giant pages that contain unrelated business logic when a feature can be isolated cleanly.

### Data

Keep family data separate from presentation logic where practical.

The database should remain the authoritative source of persistent family information.

### Styling

Preserve the established visual language:

- forest green
- warm cream
- restrained gold
- serif display typography
- modern sans-serif body typography
- subtle motion
- generous whitespace

The root layout confirms the current typography direction using Playfair Display, Plus Jakarta Sans, and Noto Serif Malayalam. fileciteturn4file0L2-L2

### Internationalization readiness

The site currently declares English as the document language. fileciteturn4file0L2-L2

The font stack already includes Noto Serif Malayalam, making future Malayalam content a realistic extension without redesigning the typography system. fileciteturn4file0L2-L2

---

## Future Improvements

The architecture can support future features such as:

### Family Tree

- branch-first navigation
- better genealogy-book-style horizontal layouts
- relationship finder
- lineage highlighting
- person-to-person relationship paths
- improved mobile tree navigation

### Person Profiles

- dedicated life/legacy pages
- connected photographs
- achievements
- family relationships
- timeline of important life events

### Archive

- people tagging in photographs
- searchable document archive
- year filters
- branch filters
- historical document previews
- OCR/search for selected digitized records

### Community

- family submissions
- memory wall
- reunion attendance
- birthday and anniversary reminders
- family announcements

### Data and Operations

- stronger audit trails
- moderation workflows
- better storage organization
- image derivatives/thumbnails
- automated backups

### Productization

The underlying idea can eventually be generalized into a reusable digital family-archive platform, with Pulazhiyil Kudumbayogam as the first real-world implementation.

---

## Design Philosophy

This project should feel like a **digital family archive**, not a generic corporate website.

The intended visual direction is:

```text
Traditional genealogy
        +
Modern web interaction
        +
Museum-like storytelling
        +
Family accessibility
```

The most important design rule is:

> **Make the important things easy to see.**

Names, roles, dates, generations, branch identities, historical milestones, and calls to action should remain readable to older family members without sacrificing the site's premium visual character.

---

## Historical Content Principle

The archive contains family history that may have been preserved through a combination of documented records and oral tradition.

Where the source is tradition rather than independently verified documentation, the website should communicate that appropriately.

This helps preserve family stories while maintaining a clear distinction between documented fact and inherited oral history.

---

## Repository Notes

The repository is public, but the family archive itself should still be treated as a controlled information system.

Being visible in a public GitHub repository does not mean all family data should be public. Keep sensitive or private data in the database behind appropriate authorization controls rather than committing it into source files.

Project-specific agent instructions are maintained in `AGENTS.md`. That file explicitly separates repository code from the external shared-memory vault and prohibits storing secrets there. fileciteturn5file0L2-L2

---

## Credits

Built for the preservation of the **Pulazhiyil Kudumbayogam** family legacy.

Developed with:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide
- D3
- Supabase

---

## Live Project

**Website:** https://pullazhiyil.com/

**Repository:** https://github.com/Rubenjoe/FamilyWebsite

---

> **Rooted in Heritage • United in Faith • Forever Bound by Family**
