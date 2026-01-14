import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Basic Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // 2. Supabase Sign Up
      // Cast auth to any to bypass type mismatch error
      const { data, error: authError } = await (supabase.auth as any).signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            // The status will be set to 'pending' by the database trigger we created earlier
          },
        },
      });

      if (authError) throw authError;

      // 3. Success State
      if (data) {
        setSuccess(true);
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  // --- Success View ---
  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548625361-ec889dc155d8?q=80&w=2000&auto=format&fit=crop')" }}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl mx-4 animate-in fade-in zoom-in duration-300 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-600 mb-8">
            Your account has been created. Please wait for an <strong>Administrator</strong> to approve your account before logging in.
          </p>
          <button
            onClick={onNavigateToLogin}
            className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // --- Registration Form View ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1548625361-ec889dc155d8?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl mx-4 animate-in fade-in slide-in-from-right-8 duration-300">
        
        <button 
          onClick={onNavigateToLogin}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the Jesus Reigns Ministry CMS</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Password</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide ml-1">Confirm</label>
              <input
                type="password"
                required
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin h-5 w-5 text-white" />
                Registering...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Protected by JRM Security • v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;