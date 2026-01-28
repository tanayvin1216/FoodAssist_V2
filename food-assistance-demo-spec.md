# Food Assistance Directory - Demo Application Spec

> **Project Goal**: Build a mobile-friendly, accessible web application for managing and displaying food assistance resources in Carteret County, NC.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [User Personas & Use Cases](#user-personas--use-cases)
3. [Data Model](#data-model)
4. [Functional Requirements](#functional-requirements)
5. [Technical Architecture](#technical-architecture)
6. [UI/UX Requirements](#uiux-requirements)
7. [Implementation Phases](#implementation-phases)
8. [Success Criteria](#success-criteria)

---

## 🎯 Project Overview

### Context
The Carteret County Food & Health Council coordinates food assistance organizations. Current pain points:
- Manual report generation using Google Forms → Sheets → Word mail merge
- No automated reporting
- No role-based access
- Limited mobile usability
- No sorting/filtering capabilities

### Key Stakeholders
- **Primary users**: Retired volunteers, food pantry staff, community members
- **Technical complexity**: Must be maintainable by non-technical users
- **Accessibility**: Many users are elderly; must be simple and clear

### Demo Scope
Build a working prototype that demonstrates:
1. Public directory search & filtering
2. Organization self-service portal for updates
3. Admin dashboard with donation tracking
4. Automated report generation (PDF)

---

## 👥 User Personas & Use Cases

### 1. **Food-Insecure Individuals** (Public View)
**Needs**: 
- Find nearby food assistance quickly
- Understand hours, location, eligibility
- View in Spanish if needed

**Key Actions**:
- Search by location/zip code
- Filter by assistance type, days open
- View contact info and directions

---

### 2. **Case Workers / Community Helpers** (Enhanced Public View)
**Needs**:
- More detailed organization info
- Contact information
- Notes and special requirements

**Key Actions**:
- All public actions +
- View extended details
- Download resource lists

---

### 3. **Food Assistance Organizations** (Org Portal)
**Needs**:
- Update their listing information
- Post volunteer needs
- Keep hours/contact current

**Key Actions**:
- Login to org portal
- Edit organization profile
- Update hours and services
- Post volunteer opportunities

---

### 4. **Donors** (Donor View)
**Needs**:
- See what's needed
- Find where to donate
- Understand accepted donation types

**Key Actions**:
- View needs by organization
- Filter by donation type accepted
- See storage capacity info

---

### 5. **Food & Health Council Admins** (Admin Dashboard)
**Needs**:
- Manage all organization data
- Track council donations to pantries
- Generate and distribute reports
- Oversee volunteer coordination

**Key Actions**:
- CRUD on all organizations
- Log council donations
- Generate PDF reports
- Export data
- Manage users/access

---

## 💾 Data Model

### Core Entities

#### **Organizations Table**
```typescript
interface Organization {
  id: string;
  name: string;
  address: string;
  town: string;
  zip: string;
  
  // Contact
  contact_name?: string;
  phone: string;
  email?: string;
  website?: string;
  facebook?: string;
  
  // Services
  assistance_types: AssistanceType[];
  who_served: ServedPopulation[];
  cost: 'free' | 'sliding_scale' | 'other';
  num_meals_available?: number;
  
  // Hours (structured JSON or related table)
  operating_hours: OperatingHours[];
  hours_notes?: string;
  
  // Donations
  donations_accepted: DonationType[];
  storage_capacity?: StorageCapacity;
  
  // Meta
  comments?: string;
  last_updated: Date;
  updated_by?: string;
  is_active: boolean;
  spanish_available: boolean;
}
```

#### **Operating Hours Structure**
```typescript
interface OperatingHours {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  open_time?: string; // "09:00"
  close_time?: string; // "17:00"
  is_closed: boolean;
}
```

#### **Enums**
```typescript
enum AssistanceType {
  COLLECTION = 'collection',
  HOT_MEALS_PICKUP = 'hot_meals_pickup',
  HOT_MEALS_DELIVERY = 'hot_meals_delivery',
  STAFFED_PANTRY = 'staffed_pantry',
  SELF_SERVE_PANTRY = 'self_serve_pantry'
}

enum DonationType {
  NON_PERISHABLES = 'non_perishables',
  FROZEN_MEALS_MEATS = 'frozen_meals_or_meats',
  FRESH_PRODUCE = 'fresh_produce',
  PREPARED_MEALS = 'prepared_meals',
  HYGIENE_HOUSECLEANING = 'hygiene_or_housecleaning',
  KITCHEN_HOUSEHOLD = 'kitchen_household_items',
  CLOTHING_SHOES = 'clothing_or_shoes'
}

enum ServedPopulation {
  CHILDREN = 'children',
  OLDER_ADULTS = 'older_adults',
  ALL = 'all'
}
```

#### **Council Donations Table**
```typescript
interface CouncilDonation {
  id: string;
  organization_id: string;
  donation_date: Date;
  amount?: number;
  donation_type: 'money' | 'food' | 'supplies' | 'other';
  description: string;
  recorded_by: string;
  created_at: Date;
}
```

#### **Volunteer Needs Table**
```typescript
interface VolunteerNeed {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  needed_date?: Date;
  needed_skills?: string[];
  time_commitment?: string;
  is_active: boolean;
  posted_date: Date;
  contact_email?: string;
}
```

#### **Users Table** (Simple Auth)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organization' | 'public';
  organization_id?: string; // if role = organization
  created_at: Date;
}
```

---

## ⚙️ Functional Requirements

### FR-1: Public Directory
- **Search**: By name, location, zip code
- **Filters**: 
  - Assistance type (multi-select)
  - Day of week open
  - Town
  - Accepts specific donation types
  - Serves specific populations
- **Sort**: By name, town, distance (if geolocation enabled)
- **Display**: Card view with key info, expand for details
- **Map View**: Optional - show pins on map
- **Language Toggle**: English/Spanish

### FR-2: Organization Portal
- **Authentication**: Simple email/password login
- **Dashboard**: Quick stats, recent updates
- **Edit Profile Form**: 
  - All organization fields
  - Validation (phone format, zip code, required fields)
  - Preview changes before saving
- **Manage Hours**: Visual day/time picker
- **Volunteer Needs**: Create/edit/deactivate postings

### FR-3: Admin Dashboard
- **Organization Management**: CRUD operations
- **Council Donations**: 
  - Log donations to organizations
  - View donation history by org
  - Generate donation summary reports
- **User Management**: Create org accounts, assign access
- **Reports**: 
  - Generate master directory PDF
  - Export data as CSV/Excel
  - Schedule automatic report generation
- **Analytics**: 
  - Active organizations count
  - Services by type
  - Geographic coverage

### FR-4: Automated Reporting
- **Trigger**: Manual or scheduled (weekly)
- **Output**: PDF formatted directory
- **Content**: 
  - All active organizations
  - Grouped by town or assistance type
  - Include hours, contact, services
- **Distribution**: 
  - Save to cloud storage
  - Email to stakeholder list
  - Generate shareable link

### FR-5: Data Validation
- **Phone**: Format as (###) ###-####
- **Zip**: Validate NC zip codes
- **Hours**: Validate open < close times
- **Required Fields**: Name, address, town, zip, phone, assistance types
- **Dropdowns**: Prevent free text where enums exist

---

## 🏗️ Technical Architecture

### Recommended Stack

#### **Frontend**
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Context + Server Components
- **Forms**: React Hook Form + Zod validation
- **Maps** (optional): Mapbox or Leaflet

#### **Backend**
- **Database**: Supabase (PostgreSQL)
  - Built-in auth
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage for report PDFs
- **API**: Next.js API routes / Server Actions
- **PDF Generation**: @react-pdf/renderer or Puppeteer

#### **Hosting**
- **App**: Vercel (free tier)
- **Database**: Supabase (free tier)
- **Domain**: Custom domain or vercel.app subdomain

#### **Key Dependencies**
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.0",
  "@supabase/supabase-js": "^2.39.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "@react-pdf/renderer": "^3.1.0",
  "date-fns": "^3.0.0",
  "lucide-react": "^0.300.0"
}
```

### Database Schema (PostgreSQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  town TEXT NOT NULL,
  zip TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  facebook TEXT,
  assistance_types TEXT[] NOT NULL,
  who_served TEXT[],
  cost TEXT,
  num_meals_available INTEGER,
  operating_hours JSONB,
  hours_notes TEXT,
  donations_accepted TEXT[],
  storage_capacity JSONB,
  comments TEXT,
  last_updated TIMESTAMP DEFAULT NOW(),
  updated_by TEXT,
  is_active BOOLEAN DEFAULT true,
  spanish_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Council donations table
CREATE TABLE council_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  donation_date DATE NOT NULL,
  amount DECIMAL(10,2),
  donation_type TEXT NOT NULL,
  description TEXT,
  recorded_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Volunteer needs table
CREATE TABLE volunteer_needs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  needed_date DATE,
  needed_skills TEXT[],
  time_commitment TEXT,
  is_active BOOLEAN DEFAULT true,
  posted_date TIMESTAMP DEFAULT NOW(),
  contact_email TEXT
);

-- Users table (Supabase auth integration)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'public',
  organization_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_org_town ON organizations(town);
CREATE INDEX idx_org_zip ON organizations(zip);
CREATE INDEX idx_org_active ON organizations(is_active);
CREATE INDEX idx_donations_org ON council_donations(organization_id);
CREATE INDEX idx_volunteer_org ON volunteer_needs(organization_id);
```

### Row Level Security Policies

```sql
-- Public can read active organizations
CREATE POLICY "Public read active orgs"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Organizations can update their own record
CREATE POLICY "Orgs update own record"
  ON organizations FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE organization_id = organizations.id
    )
  );

-- Admins can do everything
CREATE POLICY "Admins full access"
  ON organizations FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

### Application Structure

```
food-assistance-app/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Public directory
│   │   ├── search/
│   │   └── organization/[id]/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── portal/                    # Org portal
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── volunteers/
│   ├── admin/                     # Admin dashboard
│   │   ├── organizations/
│   │   ├── donations/
│   │   ├── reports/
│   │   └── users/
│   ├── api/
│   │   ├── reports/generate/
│   │   └── export/
│   └── layout.tsx
├── components/
│   ├── ui/                        # shadcn components
│   ├── directory/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── OrgCard.tsx
│   ├── forms/
│   │   ├── OrgForm.tsx
│   │   └── DonationForm.tsx
│   └── reports/
│       └── PDFTemplate.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── queries.ts
│   ├── validations/
│   │   └── schemas.ts
│   └── utils/
│       ├── formatters.ts
│       └── constants.ts
├── public/
│   └── locales/
│       ├── en.json
│       └── es.json
└── types/
    └── database.ts
```

---

## 🎨 UI/UX Requirements

### Design Principles
1. **Accessibility First**: WCAG 2.1 AA compliance
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Senior-Friendly**: Large text, high contrast, simple navigation
4. **Minimal Cognitive Load**: One task per screen, clear CTAs

### Visual Design

#### Typography
- **Headings**: 24px+ (mobile), 32px+ (desktop)
- **Body**: 16px minimum
- **Line Height**: 1.5-1.75 for readability
- **Font**: System fonts or Inter/Open Sans

#### Colors
```
Primary: #2563eb (blue-600) - buttons, links
Secondary: #059669 (green-600) - success states
Error: #dc2626 (red-600) - validation errors
Text: #1f2937 (gray-800) - main text
Text-light: #6b7280 (gray-500) - secondary text
Background: #ffffff (white)
Background-alt: #f9fafb (gray-50)
```

#### Spacing
- Use 8px grid system
- Generous padding (min 16px on mobile)
- Clear separation between sections

### Component Requirements

#### Search & Filters
```
┌─────────────────────────────────┐
│  🔍 Search by name or location  │
│  [                            ]  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Filters                    ▼   │
│  □ Hot Meals                    │
│  □ Food Pantry                  │
│  □ Home Delivery                │
│                                 │
│  Days Open                      │
│  □ Monday  □ Friday             │
│  ...                            │
└─────────────────────────────────┘
```

#### Organization Card
```
┌─────────────────────────────────┐
│ 📍 Community Pantry             │
│ ⭐ Food Pantry, Hot Meals       │
│                                 │
│ 📍 123 Main St, Beaufort, NC   │
│ 📞 (252) 555-0123              │
│ 🕐 Mon-Fri, 9AM-5PM            │
│                                 │
│ [View Details]  [Get Directions]│
└─────────────────────────────────┘
```

#### Form Layouts
- One column on mobile
- Two columns on desktop (where logical)
- Grouped related fields
- Inline validation
- Progress indicator for multi-step forms

### Responsive Breakpoints
```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Accessibility Checklist
- [ ] Semantic HTML (nav, main, article, aside)
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation (tab order, focus states)
- [ ] Skip to content link
- [ ] Alt text on all images
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Form labels and error messages
- [ ] Screen reader tested

---

## 📦 Implementation Phases

### Phase 1: MVP (Week 1-2)
**Goal**: Basic directory with search and organization management

#### Sprint 1.1: Setup & Data Model
- [ ] Initialize Next.js project
- [ ] Set up Supabase project
- [ ] Create database schema
- [ ] Seed with sample data (10-15 orgs)
- [ ] Configure environment variables

#### Sprint 1.2: Public Directory
- [ ] Build home page with search
- [ ] Implement filter panel
- [ ] Create organization card component
- [ ] Detail view page
- [ ] Responsive layout

#### Sprint 1.3: Organization Portal
- [ ] Simple email/password auth
- [ ] Organization dashboard
- [ ] Edit profile form with validation
- [ ] Save and update functionality

**Deliverable**: Working prototype with search, filters, and org updates

---

### Phase 2: Admin & Reporting (Week 3)
**Goal**: Admin dashboard and automated reports

#### Sprint 2.1: Admin Dashboard
- [ ] Admin authentication and routing
- [ ] Organization CRUD interface
- [ ] Council donations tracking
- [ ] User management

#### Sprint 2.2: PDF Report Generation
- [ ] Create PDF template component
- [ ] API route for PDF generation
- [ ] Manual trigger from admin panel
- [ ] Save to Supabase Storage

#### Sprint 2.3: Distribution
- [ ] Email integration (Resend/SendGrid)
- [ ] Stakeholder email list management
- [ ] Scheduled report generation (cron)

**Deliverable**: Full admin capabilities with automated reporting

---

### Phase 3: Enhanced Features (Week 4)
**Goal**: Volunteer module, Spanish support, analytics

#### Sprint 3.1: Volunteer Needs
- [ ] Volunteer needs CRUD for orgs
- [ ] Public volunteer listings page
- [ ] Contact/inquiry form

#### Sprint 3.2: Spanish Support
- [ ] i18n setup (next-intl)
- [ ] Translate UI strings
- [ ] Language toggle
- [ ] Store Spanish org descriptions

#### Sprint 3.3: Polish & Analytics
- [ ] Admin analytics dashboard
- [ ] Export functionality (CSV)
- [ ] Performance optimization
- [ ] Testing & bug fixes

**Deliverable**: Production-ready application

---

## ✅ Success Criteria

### Technical
- [ ] Application loads in < 2 seconds
- [ ] Mobile responsive (tested on iOS/Android)
- [ ] Passes WCAG 2.1 AA accessibility audit
- [ ] Zero critical security vulnerabilities
- [ ] Database can handle 500+ organizations
- [ ] PDF generation works reliably

### Functional
- [ ] Users can find organizations in < 30 seconds
- [ ] Organizations can update their info without training
- [ ] Admins can generate report in < 2 clicks
- [ ] Reports are accurate and well-formatted
- [ ] Validation prevents bad data entry

### User Experience
- [ ] Tested with 3+ elderly users successfully
- [ ] Spanish language toggle works correctly
- [ ] Forms are clear with helpful error messages
- [ ] Navigation is intuitive
- [ ] No users report being "lost" in the app

### Maintenance
- [ ] Documentation exists for all admin tasks
- [ ] Non-technical person can add an organization
- [ ] Deployment is automated (push to deploy)
- [ ] Monitoring alerts on errors
- [ ] Backup system in place

---

## 📚 Appendix

### External Resources
- **Current Database**: [View Sheet](https://docs.google.com/spreadsheets/d/1_mfgznfcJTt2MNm5JjDBjNJFWmtOiThU684dMYcVvsM/edit)
- **Report Folder**: [View Drive](https://drive.google.com/drive/u/5/folders/14lWHI8d5J99ibuv4PsFHdD3S9hjzV2FC) visit the data folder and find the different companies and current data base that is already there 

### Migration Strategy
1. Export current Google Sheet as CSV
2. Transform data to match new schema
3. Import via SQL or Supabase dashboard
4. Verify data integrity
5. Parallel run for 2 weeks
6. Sunset old system

### Support Plan
- Create video tutorials for common tasks
- Set up help email/form
- Offer 2 live training sessions
- Monthly check-in for first 3 months
- Document troubleshooting guide

---

## 🚀 Getting Started

### For Developers
```bash
# Clone and setup
git clone <repo-url>
cd food-assistance-app
npm install

# Configure environment
cp .env.example .env.local
# Add Supabase credentials

# Run migrations
npm run db:migrate

# Start dev server
npm run dev
```

### For Non-Technical Maintainers
The application will be deployed at a live URL (e.g., `food-help.vercel.app`). You can:
- Access admin panel at `/admin` (no code needed)
- Add/edit organizations through web interface
- Generate reports with button clicks
- All changes sync automatically

**No coding required for day-to-day use.**

---

## 📞 Questions & Feedback
For questions about this spec, contact: [Your Contact Info]

**Last Updated**: January 26, 2026
**Version**: 1.0
