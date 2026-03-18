import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  RefreshCw, 
  Plus,
  Facebook,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import axios from 'axios';

export default function MyPages() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const accountsQuery = query(collection(db, 'fbAccounts'), where('uid', '==', auth.currentUser.uid));
    const pagesQuery = query(collection(db, 'pages'), where('uid', '==', auth.currentUser.uid));

    const unsubAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAccounts(accs);
      // Expand all by default
      setExpandedAccounts(accs.map(a => a.id));
    });

    const unsubPages = onSnapshot(pagesQuery, (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubAccounts();
      unsubPages();
    };
  }, []);

  const handleConnectFB = async () => {
    setIsConnecting(true);
    try {
      const res = await axios.get('/api/auth/fb/url');
      const width = 600, height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        res.data.url, 
        'fb_auth', 
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const handleMessage = async (event: MessageEvent) => {
        if (event.data?.type === 'FB_AUTH_SUCCESS') {
          const data = JSON.parse(decodeURIComponent(event.data.data));
          await saveFBData(data);
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('FB Auth failed:', error);
      setIsConnecting(false);
    }
  };

  const saveFBData = async (data: any) => {
    if (!auth.currentUser) return;

    // 1. Save/Update FB Account
    const accountRef = await addDoc(collection(db, 'fbAccounts'), {
      uid: auth.currentUser.uid,
      fbId: data.fbId,
      name: data.name,
      email: data.email,
      accessToken: data.accessToken,
      createdAt: serverTimestamp()
    });

    // 2. Save Pages
    for (const page of data.pages) {
      await addDoc(collection(db, 'pages'), {
        uid: auth.currentUser.uid,
        fbAccountId: accountRef.id,
        pageId: page.id,
        name: page.name,
        accessToken: page.access_token,
        category: page.category,
        lastUsed: serverTimestamp()
      });
    }
  };

  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Pages</h1>
          <p className="text-zinc-400 mt-1">Manage your connected Facebook accounts and pages</p>
        </div>
        <button 
          onClick={handleConnectFB}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          <Facebook className="w-5 h-5 fill-current" />
          <span>{isConnecting ? 'Connecting...' : 'Connect New FB Account'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {accounts.length > 0 ? (
          accounts.map((account) => {
            const accountPages = pages.filter(p => p.fbAccountId === account.id);
            const isExpanded = expandedAccounts.includes(account.id);

            return (
              <div key={account.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <button 
                  onClick={() => toggleAccount(account.id)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                      <Facebook className="text-blue-500 w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">{account.name}</h3>
                      <p className="text-zinc-500 text-sm">{account.email || 'No email provided'} • {accountPages.length} Pages</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                    {isExpanded ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-500" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-zinc-800"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
                        {accountPages.map((page) => (
                          <div key={page.id} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl group hover:border-emerald-500/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                                <Users className="text-zinc-400 w-5 h-5" />
                              </div>
                              <a 
                                href={`https://facebook.com/${page.pageId}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-zinc-600 hover:text-emerald-500 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                            <h4 className="text-white font-bold truncate">{page.name}</h4>
                            <p className="text-zinc-500 text-xs mt-1 uppercase tracking-wider">{page.category}</p>
                            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                              <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">ID: {page.pageId}</span>
                              <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                Active
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Facebook className="text-zinc-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Facebook Accounts Connected</h2>
            <p className="text-zinc-500 max-w-md mx-auto mb-8">
              Connect your first Facebook account to start managing your pages and automating your content.
            </p>
            <button 
              onClick={handleConnectFB}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300"
            >
              Connect Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
