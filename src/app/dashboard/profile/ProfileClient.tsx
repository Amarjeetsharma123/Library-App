'use client';

import React, { useState, useTransition } from 'react';
import { updateProfileAction } from '@/lib/actions/library';
import { toast } from 'sonner';
import { User, Image as ImageIcon, KeyRound } from 'lucide-react';

interface ProfileClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
  const [name, setName] = useState(initialUser.name);
  const [avatar, setAvatar] = useState(initialUser.avatar || '');
  const [isPending, startTransition] = useTransition();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    startTransition(async () => {
      const res = await updateProfileAction(initialUser.id, { name, avatar });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Profile Details Block */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-6">Personal Profile</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-xl">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-border bg-muted shrink-0">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt="Avatar Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                }}
              />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Avatar Preview</h4>
              <p className="text-xs text-muted-foreground">Provide an image URL to customize your dashboard avatar.</p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                required
              />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Email Address (Cannot be changed)</label>
            <input
              type="text"
              value={initialUser.email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <label htmlFor="avatar" className="text-sm font-semibold text-foreground">Avatar URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:opacity-90 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-md transition-all"
          >
            {isPending ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Block */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold border-b border-border pb-4 mb-6">Security Settings</h2>
        
        <form className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
          </div>
          <button
            type="button"
            onClick={() => toast.success('Password update simulated successfully.')}
            className="inline-flex items-center gap-1.5 border border-border text-foreground hover:bg-accent px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
