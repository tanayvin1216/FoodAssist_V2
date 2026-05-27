<div align="center">

<img width="140" height="140" alt="Carteret County Food Assistance Directory logo" src="https://github.com/user-attachments/assets/24890cda-ae7c-4053-a68e-42a1195b90a9" />

# Carteret County Food Assistance Directory

A simple, fast way for people in Carteret County, North Carolina to find food pantries, hot meals, and assistance programs near them.

**[www.carteretfoodandhealthcouncil.org](https://www.carteretfoodandhealthcouncil.org/)**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## About

I built this for the Carteret County Food & Health Council. They were keeping their food-assistance directory current by hand: a Google Form fed a spreadsheet, reports got copied into Word documents, and volunteers spent hours every month just confirming that phone numbers and hours were still right.

This app replaces all of that. The public side lets anyone search by town or type of help and see who's open right now. The private side lets the Council and each organization keep their own listing up to date without touching a spreadsheet or waiting on a developer.

The whole thing is built around one constraint: it has to work for someone who isn't comfortable with technology, on a phone, possibly in a hurry. That shaped a lot of the decisions — plain language, big tap targets, no clutter, and a layout that loads fast on a weak connection.

## What it does

For residents:

- Search and filter by town, type of assistance, days open, and donation needs
- See whether a place is open right now, including 24-hour pantries
- Call, get directions, or open a website in a single tap
- Read listings in English, with Spanish availability flagged per organization

For the Council and partner organizations (private admin dashboard + org portal):

- Organizations update their own hours, contact details, and services
- Post volunteer needs and collect applications from the community
- Record council donations and review them over time
- Export the full directory as a print-ready PDF, and data as CSV / Excel
- Edit site content — branding, navigation, the emergency help banner — without code

## Built with

- [Next.js 16](https://nextjs.org/) (App Router) and [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/), strict mode
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Postgres, auth, and row-level security
- [Radix UI](https://www.radix-ui.com/) primitives with [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for forms and validation
- Hosted on [Vercel](https://vercel.com/)

## Running it locally

You'll need [Node.js](https://nodejs.org/) 20 or newer and a [Supabase](https://supabase.com/) project.

```bash
git clone https://github.com/tanayvin1216/FoodAssist_V2.git
cd FoodAssist_V2
npm install
```

Copy the example environment file and fill in your Supabase keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-side only — never expose this
```

Start the dev server:

```bash
npm run dev
```

The app runs at [localhost:3000](http://localhost:3000). Database migrations live in [`supabase/`](supabase/).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # run eslint
```

## Project layout

```
app/          routes — (public) directory, (auth) login, admin dashboard, org portal
components/   directory cards/filters, forms, layout, and shadcn/ui primitives
lib/          supabase clients & queries, Zod schemas, formatters and utils
config/       default site settings
contexts/     global settings state
supabase/     database migrations
types/        shared TypeScript types
```

## Contributing

This is a live tool for a real community, so help is genuinely welcome — bug reports, accessibility improvements, Spanish translations, or new features. Open an [issue](https://github.com/tanayvin1216/FoodAssist_V2/issues) or send a pull request.

## Contact

- **Live site** — [foodassist-v2-two.vercel.app](https://foodassist-v2-two.vercel.app)
- **Issues** — [github.com/tanayvin1216/FoodAssist_V2/issues](https://github.com/tanayvin1216/FoodAssist_V2/issues)
- **Author** — [@tanayvin1216](https://github.com/tanayvin1216) · [Vinaykya27T@ncssm.edu](mailto:Vinaykya27T@ncssm.edu)

---

<div align="center">
Made for Carteret County, North Carolina.
</div>
