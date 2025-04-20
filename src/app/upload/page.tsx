'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzeActive, setIsAnalyzeActive] = useState(false); // State to track if analyze button is active
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsAnalyzeActive(true); // Enable analyze button when a file is selected
    } else {
      setFile(null);
      setIsAnalyzeActive(false); // Disable analyze button if no file is selected
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    // In a real application, you would upload the file to a server here.
    console.log('File to upload:', file);
    alert('File uploaded (mock). Check console for file details.');
  };

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
        <div className="mb-4">
          <label htmlFor="reviewFile" className="block text-sm font-medium text-gray-700">
            Choose File
          </label>
          <Input
            type="file"
            id="reviewFile"
            accept=".csv"
            className="file:bg-blue-500 file:border-0 file:text-white file:font-bold hover:file:bg-blue-700"
            onChange={handleFileChange}
          />
        </div>
        <Button onClick={handleAnalyze} disabled={!isAnalyzeActive} className="w-full" >
          Analyze
        </Button>
        <p className="text-red-500 mt-4 text-sm text-center">
          Please provide a review file with less than 100 reviews. This prototype uses a free API key, which can be slow.
        </p>
      </div>
    </div>
  );
}
