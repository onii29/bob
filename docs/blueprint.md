# **App Name**: Review Insights Landing

## Core Features:

- Hero Section: Clean and responsive hero section with a clear headline, concise description, and prominent login form.
- Feature Highlights: Visually appealing sections highlighting key features of BlueKaktus Analytics with compelling descriptions and relevant icons.
- Informative Footer: A well-structured footer with links to important resources and company information.
- AI Landing Page Optimizer: AI powered tool which suggests improvements to the landing page copy and layout based on conversion rate optimization principles.

## Style Guidelines:

- Primary color: A professional and trustworthy blue (#3498db).
- Secondary color: A clean and modern light gray (#f2f2f2) for backgrounds and subtle accents.
- Accent color: A vibrant teal (#2ecc71) to highlight key CTAs and interactive elements.
- Use a grid-based layout for a clean and organized presentation.
- Use consistent and professional icons from Lucide to visually represent features and benefits.

## Original User Request:
I am trying to make an app but for that I am trying to create a landing page first I will share the text data from my senior dev who is creating the landing page

bluekaktus-landing/
├ .gitignore
├ components.json
├ next.config.mjs
├ package.json
├ pnpm-lock.yaml
├ postcss.config.mjs
├ tailwind.config.ts
├ tsconfig.json
├ app/
│  ├ globals.css
│  ├ layout.tsx
│  ├ loading.tsx
│  └ page.tsx
├ components/
│  ├ theme-provider.tsx
│  ├ login-form.tsx
│  └ ui/
│     ├ accordion.tsx
│     ├ alert-dialog.tsx
│     ├ badge.tsx
│     ├ button.tsx
│     ├ card.tsx
│     ├ ... (and other UI primitives)
├ hooks/
│  ├ use-mobile.tsx
│  └ use-toast.ts
├ lib/
│  └ utils.ts
├ public/
│  ├ placeholder-logo.png
│  ├ placeholder-logo.svg
│  ├ placeholder-user.jpg
│  ├ placeholder.jpg
│  ├ placeholder.svg
│  └ images/
│     └ analytics-dashboard.png
├ styles/
│  └ globals.css
└ README.md (if present)


app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata = {
  title: 'BlueKaktus Analytics',
  description: 'Turn customer reviews into actionable insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

app/page.tsx (Landing Page)

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { LoginForm } from '@/components/login-form';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        {/* ...navigation markup... */}
      </header>
      <main className="flex-1">
        {/* Hero section with <LoginForm /> */}
      </main>
      <footer className="bg-gray-900 text-gray-300">
        {/* Footer links */}
      </footer>
    </div>
  );
}

components/login-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();

  function onSubmit(data: { email: string; password: string }) {
    // Dummy login for prototype
    console.log('Logging in with', data);
    window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input type="email" placeholder="Email" {...register('email', { required: true })} />
      <Input type="password" placeholder="Password" {...register('password', { required: true })} />
      <Button type="submit" className="w-full">Log In</Button>
    </form>
  );
}
  