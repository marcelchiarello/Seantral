'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the map component dynamically to avoid SSR issues
const MarineMap = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
});

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">Seantral</a>
          <nav>
            <ul className="flex gap-6">
              <li><a href="/" className="hover:text-blue-200 transition-colors">Home</a></li>
              <li><a href="/auth/login" className="hover:text-blue-200 transition-colors">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Marine Data Dashboard</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Interactive Map</h2>
          <div style={{ height: '500px', width: '100%', border: '1px solid #ccc' }}>
            <MarineMap height="500px" />
          </div>
        </div>
      </main>
    </div>
  );
} 