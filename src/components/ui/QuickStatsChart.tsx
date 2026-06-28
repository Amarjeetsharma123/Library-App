'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BookOpen, Users, Layers, ArrowRight, Activity, TrendingUp } from 'lucide-react';

interface QuickStatsChartProps {
  bookCount: number;
  activeMembers: number;
  totalCategories: number;
  categoryData: Array<{ name: string; books: number }>;
  weeklyTrends?: Array<{ name: string; borrows: number }>;
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export default function QuickStatsChart({
  bookCount,
  activeMembers,
  totalCategories,
  categoryData,
  weeklyTrends = [
    { name: 'Mon', borrows: 4 },
    { name: 'Tue', borrows: 7 },
    { name: 'Wed', borrows: 5 },
    { name: 'Thu', borrows: 12 },
    { name: 'Fri', borrows: 9 },
    { name: 'Sat', borrows: 15 },
    { name: 'Sun', borrows: 8 },
  ],
}: QuickStatsChartProps) {
  const [activeTab, setActiveTab] = useState<'trends' | 'categories'>('trends');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Format category data to ensure it's not empty and looks good
  const formattedCategoryData = categoryData.length > 0
    ? categoryData.map((d) => ({ name: d.name.substring(0, 10), books: d.books }))
    : [
        { name: 'Fiction', books: 12 },
        { name: 'Science', books: 8 },
        { name: 'History', books: 6 },
        { name: 'Biography', books: 4 },
        { name: 'Tech', books: 15 },
      ];

  return (
    <div className="relative border border-white/10 rounded-2xl bg-slate-950/65 backdrop-blur-xl shadow-2xl p-6 overflow-hidden w-full transition-all duration-300 hover:border-indigo-500/30 hover:shadow-indigo-500/10">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/15 rounded-lg text-indigo-400">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm">Library Insights</span>
              <span className="block text-[10px] text-slate-400 font-medium">Real-time Analytics</span>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex p-0.5 bg-slate-900/80 border border-white/5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'trends'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Genres
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-44 w-full text-[10px] relative">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'trends' ? (
                <AreaChart data={weeklyTrends} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false} 
                    dx={-4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                    }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="borrows"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBorrows)"
                    name="Checkouts"
                  />
                </AreaChart>
              ) : (
                <BarChart data={formattedCategoryData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    tickLine={false} 
                    axisLine={false}
                    dx={-4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="books" radius={[4, 4, 0, 0]} name="Books">
                    {formattedCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
          <div className="group/item flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover/item:scale-110 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-medium">Total Books</span>
              <span className="text-base font-bold text-white tracking-tight">{bookCount}</span>
            </div>
          </div>

          <div className="group/item flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover/item:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-medium">Active Readers</span>
              <span className="text-base font-bold text-white tracking-tight">{activeMembers}</span>
            </div>
          </div>

          <div className="group/item flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover/item:scale-110 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-medium">Genres</span>
              <span className="text-base font-bold text-white tracking-tight">{totalCategories}</span>
            </div>
          </div>

          <div className="group/item flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg group-hover/item:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 font-medium">Availability</span>
              <span className="text-base font-bold text-white tracking-tight">24/7 Live</span>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="pt-2 text-center">
          <Link
            href="/signup"
            className="group/btn inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Create account to borrow 
            <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
