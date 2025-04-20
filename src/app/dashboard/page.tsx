'use client';

import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto p-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-blue-600">
            BlueKaktus Analytics
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Back to Landing Page
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-gray-100">
        <section className="container mx-auto py-24">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
            Welcome to the Dashboard!
          </h1>
          <p className="text-gray-700 text-lg">
            This is a placeholder dashboard.
          </p>
        </section>
      </main>
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} BlueKaktus Analytics. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
