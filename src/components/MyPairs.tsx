import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Play, 
  Pause, 
  Instagram, 
  Video, 
  Link2,
  ChevronRight,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MyPairs() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPair, setNewPair] = useState({
    sourceUrl: '',
    sourceType: 'tiktok',
    pageId: '',
    scheduleTimes: ['09:00', '15:00', '21:00']
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const pairsQuery = query(collection(db, 'pairs'), where('uid', '==', auth.currentUser.uid));
    const pagesQuery = query(collection(db, 'pages'), where('uid', '==', auth.currentUser.uid));

    const unsubPairs = onSnapshot(pairsQuery, (snapshot) => {
      setPairs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubPages = onSnapshot(pagesQuery, (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPairs();
      unsubPages();
    };
  }, []);

  const handleAddPair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newPair.pageId || !newPair.sourceUrl) return;

    const selectedPage = pages.find(p => p.pageId === newPair.pageId);

    try {
      await addDoc(collection(db, 'pairs'), {
        uid: auth.currentUser.uid,
        sourceUrl: newPair.sourceUrl,
        sourceType: newPair.sourceType,
        pageId: newPair.pageId,
        pageName: selectedPage?.name || 'Unknown Page',
        scheduleTimes: newPair.scheduleTimes,
        status: 'active',
        lastPostAt: null,
        postedVideoIds: [],
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewPair({ sourceUrl: '', sourceType: 'tiktok', pageId: '', scheduleTimes: ['09:00', '15:00', '21:00'] });
    } catch (error) {
      console.error('Error adding pair:', error);
    }
  };

  const toggleStatus = async (pair: any) => {
    const newStatus = pair.status === 'active' ? 'paused' : 'active';
    await updateDoc(doc(db, 'pairs', pair.id), { status: newStatus });
  };

  const deletePair = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pair?')) {
      await deleteDoc(doc(db, 'pairs', id));
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Automation Pairs</h1>
          <p className="text-zinc-400 mt-1">Manage your {pairs.length} active automation pairs</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Pair</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pairs.map((pair) => (
          <motion.div
            key={pair.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  pair.sourceType === 'tiktok' ? "bg-zinc-800" : "bg-pink-500/10"
                )}>
                  {pair.sourceType === 'tiktok' ? <Video className="text-white w-6 h-6" /> : <Instagram className="text-pink-500 w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold truncate max-w-[120px]">{pair.sourceUrl}</span>
                  <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">{pair.sourceType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(pair)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    pair.status === 'active' ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                  )}
                >
                  {pair.status === 'active' ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button 
                  onClick={() => deletePair(pair.id)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                <Link2 className="text-zinc-600 w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Destination Page</span>
                  <span className="text-zinc-200 text-sm font-medium truncate max-w-[180px]">{pair.pageName}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-xs font-medium">Schedule:</span>
                  <div className="flex gap-1">
                    {pair.scheduleTimes.map((time: string) => (
                      <span key={time} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-bold">{time}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    pair.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  )} />
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-widest",
                    pair.status === 'active' ? "text-emerald-500" : "text-amber-500"
                  )}>{pair.status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {pairs.length === 0 && !loading && (
          <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Link2 className="text-zinc-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Automation Pairs</h2>
            <p className="text-zinc-500 max-w-md mx-auto mb-8">
              Pair your first TikTok or Instagram source with a Facebook Page to start automating your content.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300"
            >
              Create First Pair
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Add New Automation Pair</h2>
                  <p className="text-zinc-500 text-sm">Connect a source to a destination page</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-zinc-800 rounded-xl transition-colors">
                  <X className="text-zinc-500" />
                </button>
              </div>

              <form onSubmit={handleAddPair} className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-zinc-400 text-sm font-medium">1. Select Source Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewPair(p => ({ ...p, sourceType: 'tiktok' }))}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        newPair.sourceType === 'tiktok' ? "border-emerald-500 bg-emerald-500/5 text-white" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <Video className="w-5 h-5" />
                      <span className="font-bold">TikTok</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPair(p => ({ ...p, sourceType: 'instagram' }))}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        newPair.sourceType === 'instagram' ? "border-pink-500 bg-pink-500/5 text-white" : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="font-bold">Instagram</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-400 text-sm font-medium">2. Source URL / Username</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="e.g. @username or full profile URL"
                      value={newPair.sourceUrl}
                      onChange={e => setNewPair(p => ({ ...p, sourceUrl: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-zinc-400 text-sm font-medium">3. Destination Facebook Page</label>
                  <select
                    value={newPair.pageId}
                    onChange={e => setNewPair(p => ({ ...p, pageId: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    required
                  >
                    <option value="">Select a Page</option>
                    {pages.map(page => (
                      <option key={page.id} value={page.pageId}>{page.name}</option>
                    ))}
                  </select>
                  {pages.length === 0 && (
                    <p className="text-amber-500 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> No pages found. Connect a FB account first.
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
                  >
                    Create Pair & Start Automation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
