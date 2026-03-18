import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Palette, 
  Globe, 
  Zap,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../firebase';

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { 
      title: 'Profile Settings', 
      icon: User, 
      description: 'Manage your account information and preferences',
      fields: [
        { label: 'Display Name', type: 'text', value: auth.currentUser?.displayName || '' },
        { label: 'Email Address', type: 'email', value: auth.currentUser?.email || '', disabled: true },
      ]
    },
    { 
      title: 'Automation Preferences', 
      icon: Zap, 
      description: 'Configure how your content is downloaded and posted',
      fields: [
        { label: 'Max Daily Posts per Page', type: 'number', value: 3 },
        { label: 'Recycle Old Content', type: 'checkbox', value: true, description: 'If no new video is found, post the oldest one' },
        { label: 'Original Caption', type: 'checkbox', value: true, description: 'Use the original caption from the source' },
      ]
    },
    { 
      title: 'Notifications', 
      icon: Bell, 
      description: 'Choose when you want to be notified about system events',
      fields: [
        { label: 'Email Alerts', type: 'checkbox', value: true, description: 'Get notified about token expirations and errors' },
        { label: 'Push Notifications', type: 'checkbox', value: false, description: 'Get real-time updates on your device' },
      ]
    }
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-zinc-400 mt-1">Customize your automation experience and account preferences</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          {saved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-800 rounded-2xl">
                    <section.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                    <p className="text-zinc-500 text-sm mt-1">{section.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.label} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-zinc-300 font-medium text-sm">{field.label}</label>
                        {field.type === 'checkbox' && (
                          <button className={`w-12 h-6 rounded-full transition-all duration-300 relative ${field.value ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${field.value ? 'left-7' : 'left-1'}`} />
                          </button>
                        )}
                      </div>
                      {field.type !== 'checkbox' && (
                        <input
                          type={field.type}
                          defaultValue={field.value as string | number}
                          disabled={field.disabled}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}
                      {field.description && (
                        <p className="text-zinc-600 text-xs">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/10">
            <h3 className="text-xl font-bold mb-2">Pro Plan Active</h3>
            <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
              You are currently on the Pro Plan. You can manage up to 500 automation pairs.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-100">Pairs Used</span>
                <span className="font-bold">12 / 500</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[2.4%] rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold text-white">System Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Automation Engine</span>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">FB API Connection</span>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Database Sync</span>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Synced
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
