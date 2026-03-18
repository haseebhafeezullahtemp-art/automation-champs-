import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  MoreVertical,
  Video,
  Instagram
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { format, addDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';

export default function Schedule() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const pairsQuery = query(collection(db, 'pairs'), where('uid', '==', auth.currentUser.uid));
    const unsub = onSnapshot(pairsQuery, (snapshot) => {
      setPairs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const next7Days = eachDayOfInterval({
    start: startOfToday(),
    end: addDays(startOfToday(), 6)
  });

  const scheduledPosts = pairs.flatMap(pair => 
    pair.scheduleTimes.map((time: string) => ({
      id: `${pair.id}-${time}`,
      pairId: pair.id,
      sourceUrl: pair.sourceUrl,
      sourceType: pair.sourceType,
      pageName: pair.pageName,
      time,
      status: pair.status
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Schedule</h1>
          <p className="text-zinc-400 mt-1">Plan and view your upcoming automated posts</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl">
          <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="px-4 text-sm font-bold text-white">{format(selectedDate, 'MMMM yyyy')}</span>
          <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {next7Days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`flex-shrink-0 w-24 p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-2 ${
                isSelected 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-widest ${isSelected ? "text-emerald-100" : "text-zinc-500"}`}>
                {format(day, 'EEE')}
              </span>
              <span className="text-2xl font-bold">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          Posts for {format(selectedDate, 'EEEE, MMMM do')}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {scheduledPosts.length > 0 ? (
            scheduledPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-bold text-white w-20">{post.time}</div>
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    {post.sourceType === 'tiktok' ? <Video className="text-white w-6 h-6" /> : <Instagram className="text-pink-500 w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{post.sourceUrl}</h4>
                    <p className="text-zinc-500 text-sm">Posting to: <span className="text-zinc-300">{post.pageName}</span></p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${post.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {post.status === 'active' ? 'Scheduled' : 'Paused'}
                    </span>
                    <span className="text-zinc-500 text-xs mt-1">Recycling enabled</span>
                  </div>
                  <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-20 text-center">
              <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Clock className="text-zinc-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Posts Scheduled</h2>
              <p className="text-zinc-500 max-w-md mx-auto">
                Create automation pairs to see your posting schedule here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
