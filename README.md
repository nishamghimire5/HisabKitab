# SplitWise Smart

A modern expense tracking application for groups and trips. Split expenses, track balances, and settle debts with ease.

## Features

- Create and manage trips with multiple participants
- Add and categorize expenses
- Automatic balance calculations
- Settlement recommendations
- Real-time collaboration
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js (18.0 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <YOUR_GIT_URL>
cd splitwise-smart
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **React 18** - UI library with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **Supabase** - Backend as a service for authentication and database
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Tanstack Query** - Data fetching and caching

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on every push

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

### Other Platforms

The app can be deployed to any static hosting service that supports single-page applications.

## Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
