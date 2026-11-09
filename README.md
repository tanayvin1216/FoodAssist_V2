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

I built Food Assist for the Carteret County Food & Health Council after learning how much time they spent keeping track of local food resources. They were using Google Forms to collect information, spreadsheets to organize it, and Word documents to put together reports. Volunteers also had to spend hours checking whether pantry hours, phone numbers, and other details were still accurate.

I wanted to make that process easier for both the Council and the people relying on these services. Food Assist brings everything into one website where residents can quickly find food pantries and assistance programs near them. Instead of having to contact the Council to change a listing, organizations can log in and update their own information.

One thing I focused on was making the website easy to use, especially for people who might not be comfortable with technology. Someone looking for food assistance shouldn't have to navigate a complicated website just to find a phone number or address. I kept the design simple, made buttons easy to tap on a phone, and tried to make sure pages loaded quickly even with a slow internet connection.

## What it does

**For residents:**

- Search for food pantries and assistance programs by town, type of help, operating days, or donation needs.
- Check whether a pantry is currently open, including locations that operate 24 hours a day.
- Call an organization, get directions, or visit its website with one tap.
- Find information in English and see which organizations also offer assistance in Spanish.

**For the Council and partner organizations:**

- Organizations can log in and update their own hours, contact information, and services without needing help from a developer.
- Post volunteer opportunities and receive applications from people interested in helping.
- Keep track of donations made by the Council and look back at previous records.
- Download the directory as a printable PDF or export information to Excel and CSV files.
- Update website content, including the logo, navigation, and emergency assistance banner, without changing any code.

The goal was to save the Council time on administrative work while making it easier for people in Carteret County to find the food assistance they need.

## Built with

- [Next.js 16](https://nextjs.org/) (App Router) and [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/), strict mode
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Postgres, auth, and row-level security
- [Radix UI](https://www.radix-ui.com/) primitives with [shadcn/ui](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for forms and validation
- Hosted on [Vercel](https://vercel.com/)


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



## Contact

- **Live site** — [www.carteretfoodandhealthcouncil.org](https://www.carteretfoodandhealthcouncil.org/)
- **Issues** — [github.com/tanayvin1216/FoodAssist_V2/issues](https://github.com/tanayvin1216/FoodAssist_V2/issues)
- **Author** — [@tanayvin1216](https://github.com/tanayvin1216) · [Vinaykya27T@ncssm.edu](mailto:Vinaykya27T@ncssm.edu)

---

<div align="center">
Made for Carteret County, North Carolina.
</div>
