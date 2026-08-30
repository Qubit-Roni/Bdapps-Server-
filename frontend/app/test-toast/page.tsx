'use client'

import React from 'react';
import toast from 'react-hot-toast';

export default function TestToastPage() {
  const handleSuccess = () => {
    toast.success('Successfully connected to API!');
  };

  const handleError = () => {
    toast.error('Unable to connect to server! Error 500');
  };

  const handleLoading = () => {
    const myPromise = new Promise((resolve, reject) => {
      setTimeout(() => Math.random() > 0.5 ? resolve('Done') : reject('Failed'), 2000);
    });

    toast.promise(myPromise, {
      loading: 'Fetching data...',
      success: 'Data fetched successfully!',
      error: 'Error while fetching data.',
    });
  };

  const triggerPageCrash = () => {
    // This will trigger the global error.tsx we just created
    throw new Error('This is a test crash to show the new global error page!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Error Handling Demo</h1>
        
        <div className="space-y-4">
          <button 
            onClick={handleSuccess}
            className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
          >
            Show Success Toast
          </button>
          
          <button 
            onClick={handleError}
            className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            Show Error Toast
          </button>

          <button 
            onClick={handleLoading}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Show Loading Promise
          </button>

          <hr className="my-4 border-gray-200" />

          <button 
            onClick={triggerPageCrash}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors font-medium"
          >
            Trigger Page Crash (error.tsx test)
          </button>
        </div>
      </div>
    </div>
  );
}
