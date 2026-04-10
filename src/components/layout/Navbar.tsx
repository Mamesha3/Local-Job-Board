'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Briefcase, LayoutDashboard, LogOut, User, Building2, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  role: 'seeker' | 'company' | 'admin';
}

export function Navbar({ role }: NavbarProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = 
    role === 'seeker' 
      ? [
          { href: '/', label: 'Home', icon: Briefcase },
          { href: '/jobs', label: 'Browse Jobs', icon: LayoutDashboard },
          { href: '/dashboard/seeker', label: 'My Dashboard', icon: User },
        ]
    : role === 'admin'
      ? [
          { href: '/', label: 'Home', icon: Briefcase },
          { href: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
        ]
      : [
          { href: '/', label: 'Home', icon: Briefcase },
          { href: '/dashboard/company', label: 'Dashboard', icon: LayoutDashboard },
        ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg shadow-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                Local Job Board
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop User Info & Logout */}
            <div className="hidden md:flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                      {role === 'company' ? (
                        <Building2 className="w-4 h-4 text-gray-600" />
                      ) : role === 'admin' ? (
                        <Shield className="w-4 h-4 text-red-600" />
                      ) : (
                        <User className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={logout}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ 
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50"
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          {user && (
            <>
              <div className="border-t border-gray-200 my-2" />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  {role === 'company' ? (
                    <Building2 className="w-4 h-4 text-gray-600" />
                  ) : role === 'admin' ? (
                    <Shield className="w-4 h-4 text-red-600" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <span className="font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
}
