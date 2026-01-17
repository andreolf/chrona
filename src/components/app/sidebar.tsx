'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/supabase/types';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  LayoutDashboard,
  Timer,
  FileText,
  FolderKanban,
  Users,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  profile: Profile;
}

// Common items for everyone
const commonNavItems = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

// Freelancer-only items (they log time)
const freelancerNavItems = [
  { href: '/app/time', icon: Timer, label: 'Time Entries' },
  { href: '/app/timesheets', icon: FileText, label: 'My Timesheets' },
  { href: '/app/projects', icon: FolderKanban, label: 'My Projects' },
];

// Admin/Client items (they review, don't log time)
const adminNavItems = [
  { href: '/app/timesheets', icon: FileText, label: 'Timesheets' },
  { href: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/app/users', icon: Users, label: 'Team' },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = profile.role === 'admin';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <Link 
        href="/app/dashboard" 
        className="p-6 flex items-center gap-3 hover:bg-slate-800/50 transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Chrona
        </span>
      </Link>

      <Separator className="bg-slate-800" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Common items */}
        {commonNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-indigo-400')} />
              {item.label}
            </Link>
          );
        })}

        {/* Role-specific items */}
        {(isAdmin ? adminNavItems : freelancerNavItems).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-indigo-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-slate-800" />

      {/* User Menu */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 py-6 text-left hover:bg-slate-800/60"
            >
              <Avatar className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-600">
                <AvatarFallback className="text-white text-xs font-medium bg-transparent">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {profile.role}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="cursor-pointer text-slate-300 focus:bg-slate-800 focus:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-400 focus:bg-red-950/50 focus:text-red-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
