'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Briefcase, User, LogOut, TrendingUp, Home } from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        ) : (
          <Menu className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] md:hidden"
            onClick={closeMenu}
          />

          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 shadow-2xl z-[9999] md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    JobScout
                  </span>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  href="/jobs"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Jobs</span>
                </Link>

                <Link
                  href="/trending"
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Trending</span>
                </Link>

                {session && (
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </Link>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="px-4 py-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Theme</p>
                    <ThemeToggle />
                  </div>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                {session ? (
                  <>
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        signOut();
                        closeMenu();
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/auth/signin" onClick={closeMenu}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
