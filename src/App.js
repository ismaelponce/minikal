import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import EnhancedCalendar from './EnhancedCalendar';
import Login from './Login';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-4 border-b">
        <h1 className="text-2xl font-light text-center text-gray-800">Just a calendar</h1>
      </header>
      <main className="flex-grow flex items-start justify-center p-4">
        {session ? <EnhancedCalendar /> : <Login />}
      </main>
    </div>
  );
}

export default App;