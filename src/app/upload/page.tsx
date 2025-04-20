'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Please select a file.');
      return;
    }

    // In a real application, you would upload the file to a server here.
    console.log('File to upload:', file);
    alert('File uploaded (mock). Check console for file details.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
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
            onChange={handleFileChange}
          />
        </div>
        <Button onClick={handleSubmit} className="w-full">
          Upload
        </Button>
        <p className="text-red-500 mt-4 text-sm text-center">
          Please provide a review file with less than 100 reviews. This prototype uses a free API key, which can be slow.
        </p>
      </div>
    </div>
  );
}
