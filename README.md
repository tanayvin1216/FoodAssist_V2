# Food Assistance Directory - Carteret County

A modern web application helping residents of Carteret County, North Carolina find food assistance resources including food pantries, hot meals, and other support programs.

**Live Demo:** [foodassist.vercel.app](https://foodassist.vercel.app)

## Features

### Public Directory
- **Search & Filter** - Find organizations by name, location, or ZIP code
- **Advanced Filtering** - Filter by assistance type, days open, and donation types accepted
- **Mobile-Friendly** - Fully responsive design for all devices
- **Quick Access** - One-click calling and directions to organizations

### For Organizations
- **Self-Service Portal** - Organizations can manage their own listings
- **Real-Time Updates** - Keep hours, services, and contact info current
- **Volunteer Coordination** - Post and manage volunteer opportunities

### Admin Dashboard
- **Organization Management** - Approve, edit, or remove listings
- **Analytics** - Track usage and engagement
- **Donation Tracking** - Monitor community contributions

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tanayvin1216/FoodAssist-.git
   cd food-assistance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   Run the SQL migrations in your Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql` - Creates tables and RLS policies
   - `supabase/seed.sql` - (Optional) Adds sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
food-assistance-app/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── admin/             # Admin dashboard
│   ├── organization/      # Public organization pages
│   ├── portal/            # Organization self-service portal
│   └── volunteers/        # Volunteer opportunities
├── components/
│   ├── directory/         # Directory components (search, filters, cards)
│   ├── layout/            # Header, Footer
│   ├── organizations/     # Organization forms
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   ├── utils/             # Utilities, constants, formatters
│   └── validations/       # Zod validation schemas
├── supabase/
│   ├── migrations/        # Database schema migrations
│   └── seed.sql           # Sample data
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses the following main tables:

- **organizations** - Food assistance organizations
- **operating_hours** - Weekly schedules for each organization
- **volunteer_needs** - Volunteer opportunities
- **profiles** - User profiles with role-based access
- **donations** - Donation tracking records

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built for Carteret County, NC community
- Inspired by the need for accessible food assistance information
- Thanks to all the organizations working to fight food insecurity
