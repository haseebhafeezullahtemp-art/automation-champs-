import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Zap, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl shadow-emerald-500/5 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-8">
          <Zap className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">Automation Champs</h1>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          The ultimate Facebook Page automation tool. Scale your content across 400+ pages with ease.
        </p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 group"
        >
          <LogIn className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          <span>Sign in with Google</span>
        </button>

        <p className="mt-8 text-zinc-500 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
