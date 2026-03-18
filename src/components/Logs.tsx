import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Video, 
  Instagram,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { format } from 'date-fns';

export default function Logs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!auth.currentUser) return;

    const logsQuery = query(
      collection(db, 'logs'), 
      where('uid', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsub = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.status === filter);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Logs</h1>
          <p className="text-zinc-400 mt-1">Monitor all automation activities and system events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300">
            <Download className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
          {['all', 'success', 'error', 'info'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                filter === f ? "bg-emerald-500 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
          </div>
        ) : filteredLogs.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-8 py-4 text-zinc-500 font-medium text-sm">Event</th>
                <th className="px-8 py-4 text-zinc-500 font-medium text-sm">Status</th>
                <th className="px-8 py-4 text-zinc-500 font-medium text-sm">Message</th>
                <th className="px-8 py-4 text-zinc-500 font-medium text-sm">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLogs.map((log, i) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                        log.status === 'error' ? 'bg-red-500/10 text-red-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                         log.status === 'error' ? <AlertCircle className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <span className="text-white font-medium">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      log.status === 'success' ? 'text-emerald-500' :
                      log.status === 'error' ? 'text-red-500' :
                      'text-blue-500'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-zinc-400 text-sm max-w-md truncate">
                    {log.message}
                  </td>
                  <td className="px-8 py-5 text-zinc-500 text-sm">
                    {log.timestamp ? format(log.timestamp.toDate(), 'MMM d, HH:mm:ss') : 'Just now'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ScrollText className="text-zinc-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Logs Found</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              System activities will appear here once automation starts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
