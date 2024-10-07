import React from 'react';
import EnhancedCalendar from './EnhancedCalendar';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-4 border-b">
        <h1 className="text-2xl font-light text-center text-gray-800">Simple Calendar</h1>
      </header>
      <main className="flex-grow flex items-start justify-center p-4">
        <EnhancedCalendar />
      </main>
    </div>
  );
}

export default App;