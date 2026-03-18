import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileVideo, 
  Eye, 
  MessageSquare, 
  Share2, 
  Heart 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const stats = [
    { label: 'Total Reach', value: '1.2M', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Engagement', value: '84.5K', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Comments', value: '12.3K', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Shares', value: '4.2K', icon: Share2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-zinc-400 mt-1">Track the performance of your automated content</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
          <button className="px-4 py-2 bg-zinc-800 text-white text-sm font-bold rounded-xl">Last 7 Days</button>
          <button className="px-4 py-2 hover:bg-zinc-800 text-zinc-400 hover:text-white text-sm font-bold rounded-xl transition-colors">Last 30 Days</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-zinc-400 font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Top Performing Pages</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-500">{i}</div>
                  <div>
                    <h4 className="text-white font-bold">Viral Page {i}</h4>
                    <p className="text-zinc-500 text-xs">Entertainment • 120 posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{(200 - i * 20)}K</p>
                  <p className="text-emerald-500 text-xs font-bold">+12%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Source Performance</h2>
          <div className="space-y-4">
            {[
              { label: 'TikTok @creator1', value: 450, color: 'bg-emerald-500' },
              { label: 'Instagram @creator2', value: 320, color: 'bg-pink-500' },
              { label: 'TikTok @creator3', value: 280, color: 'bg-emerald-500' },
              { label: 'Instagram @creator4', value: 150, color: 'bg-pink-500' },
            ].map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 font-medium">{source.label}</span>
                  <span className="text-zinc-500">{source.value} posts</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(source.value / 450) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${source.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
