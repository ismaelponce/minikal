import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      setMessage('Check your email for the login link.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="bg-white p-6">
        <h2 className="text-xl font-light mb-6">
          Login to Minikal
        </h2>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full p-2 border rounded-md font-light"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300 transition-colors font-light"
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
        {message && (
          <p className={`mt-4 text-sm text-center font-light ${
            message.includes('error') ? 'text-red-500' : 'text-gray-600'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;