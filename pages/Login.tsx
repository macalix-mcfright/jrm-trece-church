import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Cast auth to any to bypass type mismatch error
    const { error } = await (supabase.auth as any).signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Blur Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1548625361-ec889dc155d8?q=80&w=2000&auto=format&fit=crop')",
        }}
      >
        {/* Dark overlay to pop the card, with backdrop blur for depth */}
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      </div>

      {/* Central Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl mx-4 animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          {/* Main Logo */}
          <div className="w-24 h-24 mb-4 relative flex items-center justify-center">
             <img 
               src="/src/assets/main-logo.png" 
               alt="Jesus Reigns Ministries Logo" 
               className="w-full h-full object-contain drop-shadow-md"
               onError={(e) => {
                 // Fallback if image is missing during dev
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }}
             />
             {/* Fallback CSS Logo (Matches the Gold/Blue Cross design) */}
             <div className="hidden w-20 h-20 bg-[#C5A059] rounded-2xl border-2 border-blue-900 shadow-lg flex items-center justify-center relative overflow-hidden">
                {/* 3D Cross Construction */}
                <div className="relative flex items-center justify-center w-full h-full transform -translate-y-1">
                   {/* Vertical Shadow (Blue) */}
                   <div className="absolute w-6 h-14 bg-blue-900 translate-x-1 translate-y-1 rounded-sm"></div>
                   {/* Horizontal Shadow (Blue) */}
                   <div className="absolute w-14 h-6 bg-blue-900 translate-x-1 translate-y-1 rounded-sm"></div>
                   
                   {/* Vertical Face (White) */}
                   <div className="absolute w-6 h-14 bg-white z-10 rounded-sm shadow-sm"></div>
                   {/* Horizontal Face (White) */}
                   <div className="absolute w-14 h-6 bg-white z-10 rounded-sm shadow-sm"></div>
                </div>
                {/* Dove representation (Top Right) */}
                <div className="absolute top-2 right-2 text-white opacity-80">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 13 8 16 8C19 8 21 5 21 5C21 5 20 12 16 14C12 16 8 16 8 16L4 20V12C4 12 8 10 12 2Z"/></svg>
                </div>
             </div>
          </div>

          <h1 className="text-3xl font-bold text-blue-900 tracking-tight text-center leading-tight">
            Jesus Reigns Ministries
          </h1>
          <p className="text-xs font-semibold text-blue-700 tracking-[0.2em] mt-2 uppercase">
            Trece Martires City
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm mt-4">
             <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
               Forgot password?
             </a>
          </div>
        </form>

        {/* Register Link Section */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <button 
              onClick={onNavigateToRegister}
              className="font-bold text-blue-700 hover:underline focus:outline-none"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;