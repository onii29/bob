'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Redirect to the landing page
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 py-10">
      {/* Logout Button */}
      <div className="w-full max-w-md flex justify-end px-8">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Upload Customer Reviews</h1>
        <p className="text-gray-700 mb-4 text-center">
          Please upload a CSV file containing customer reviews.
        </p>
        
        <Button onClick={() => router.push('/dashboard')} className="w-full" >
            Go to Dashboard
        </Button>
        <p className="text-red-500 mt-4 text-sm text-center">
          Please provide a review file with less than 100 reviews. This prototype uses a free API key, which can be slow.
        </p>
      </div>
    </div>
  );
}
