import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  TrendingUp, 
  Users, 
  FileVideo, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, getDocs, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activePairs: 0,
    totalPages: 0,
    totalPosts: 0,
    errors: 0
  });
  const [recentPairs, setRecentPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const pairsQuery = query(collection(db, 'pairs'), where('uid', '==', auth.currentUser.uid));
    const pagesQuery = query(collection(db, 'pages'), where('uid', '==', auth.currentUser.uid));
    const logsQuery = query(collection(db, 'logs'), where('uid', '==', auth.currentUser.uid), limit(50));

    const unsubPairs = onSnapshot(pairsQuery, (snapshot) => {
      const pairs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({
        ...prev,
        activePairs: pairs.filter((p: any) => p.status === 'active').length
      }));
      setRecentPairs(pairs.slice(0, 5));
      setLoading(false);
    });

    const unsubPages = onSnapshot(pagesQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        totalPages: snapshot.size
      }));
    });

    return () => {
      unsubPairs();
      unsubPages();
    };
  }, []);

  const statCards = [
    { label: 'Active Pairs', value: stats.activePairs, icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Pages', value: stats.totalPages, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Posts', value: stats.totalPosts, icon: FileVideo, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'System Errors', value: stats.errors, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Welcome back, {auth.currentUser?.displayName}</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20">
          <Play className="w-5 h-5 fill-current" />
          <span>Start All Automation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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
              <TrendingUp className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-zinc-400 font-medium">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Pairs</h2>
            <Link to="/pairs" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            {recentPairs.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-4 text-zinc-500 font-medium text-sm">Source</th>
                    <th className="px-6 py-4 text-zinc-500 font-medium text-sm">Page</th>
                    <th className="px-6 py-4 text-zinc-500 font-medium text-sm">Status</th>
                    <th className="px-6 py-4 text-zinc-500 font-medium text-sm">Last Post</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {recentPairs.map((pair) => (
                    <tr key={pair.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium truncate max-w-[150px]">{pair.sourceUrl}</span>
                          <span className="text-zinc-500 text-xs uppercase tracking-wider">{pair.sourceType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{pair.pageName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          pair.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                          pair.status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            pair.status === 'active' ? 'bg-emerald-500' :
                            pair.status === 'paused' ? 'bg-amber-500' :
                            'bg-red-500'
                          }`} />
                          {pair.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-sm">
                        {pair.lastPostAt ? new Date(pair.lastPostAt).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-zinc-600 w-8 h-8" />
                </div>
                <p className="text-zinc-500">No pairs created yet</p>
                <Link to="/pairs" className="text-emerald-500 mt-2 inline-block font-medium">Create your first pair</Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">System Logs</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-medium">Automation started successfully</p>
                <p className="text-zinc-500 text-xs mt-1">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-xl mt-1">
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-medium">Scheduled post: "Viral Cat" to Page A</p>
                <p className="text-zinc-500 text-xs mt-1">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/10 rounded-xl mt-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-zinc-200 text-sm font-medium">Token expired for FB Account 1</p>
                <p className="text-zinc-500 text-xs mt-1">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
