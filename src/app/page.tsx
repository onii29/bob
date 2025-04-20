'use client';

import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Input} from "@/components/ui/input";

const placeholderImageUrl = 'https://picsum.photos/800/600';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // Dummy authentication logic
    if (email === 'demo@example.com' && password === 'password') {
      // Redirect to a placeholder dashboard
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-blue-600">
            BlueKaktus Analytics
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/features" className="text-gray-700 hover:text-blue-600">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <section className="container mx-auto py-24 px-6 md:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
                Turn Customer Reviews into Actionable Insights
              </h1>
              <p className="text-gray-700 text-lg mb-8">
                Unlock the power of AI to understand customer sentiment, identify key trends, and improve your
                business strategy.
              </p>

              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="w-full">
                  Log In
                </Button>
              </div>

            </div>
            <div className="md:block hidden">
              <img
                src={placeholderImageUrl}
                alt="Analytics Dashboard"
                width={800}
                height={600}
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 md:px-0">
          <div>
            <h4 className="text-white font-semibold mb-4">About BlueKaktus</h4>
            <p>
              BlueKaktus Analytics is a leading provider of AI-powered customer review analytics. We help businesses
              understand customer sentiment, identify key trends, and improve their business strategy.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="hover:text-blue-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <p>
              Stay up to date with the latest news and insights from BlueKaktus Analytics.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="hover:text-blue-400">
                Facebook
              </Link>
              <Link href="#" className="hover:text-blue-400">
                Twitter
              </Link>
              <Link href="#" className="hover:text-blue-400">
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          &copy; {new Date().getFullYear()} BlueKaktus Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
