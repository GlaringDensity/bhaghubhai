"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from 'next/font/google';
import { Globe2, Users, Activity, Sparkles } from 'lucide-react';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#05050A] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/images/cicvicsync.png"
                alt="CivicSync Logo"
                width={240}
                height={72}
                className="h-12 sm:h-16 w-auto object-contain dark:invert -ml-2"
                priority
              />
            </div>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed max-w-xs">
              A dual-mode civic interface — geospatial reporting and Kanban status tracking, unified in a single reactive state.
            </p>
            <div className="flex gap-3 mt-8">
              <div className="w-9 h-9 rounded-full bg-cyan-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-cyan-500 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all duration-300 cursor-pointer">
                <Globe2 className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-full bg-fuchsia-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-fuchsia-500 hover:bg-fuchsia-500 hover:text-white hover:border-fuchsia-500 transition-all duration-300 cursor-pointer">
                <Users className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-white/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 cursor-pointer">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className={`font-bold text-xs uppercase tracking-widest text-[#0F172A] dark:text-white mb-5 ${outfit.className}`}>
              Platform
            </h4>
            <ul className="space-y-3">
              {['Map View', 'Kanban Board', 'Submit Issue', 'Community Feed'].map((item) => (
                <li key={item}>
                  <Link
                    href="/app"
                    className="text-[#64748B] dark:text-[#94A3B8] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors font-medium text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className={`font-bold text-xs uppercase tracking-widest text-[#0F172A] dark:text-white mb-5 ${outfit.className}`}>
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'About', href: '/About' },
                { label: 'Contact', href: '/ContactUs' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[#64748B] dark:text-[#94A3B8] hover:text-fuchsia-500 dark:hover:text-fuchsia-400 transition-colors font-medium text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E2E8F0] dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#64748B] dark:text-[#94A3B8] text-sm font-medium">
            © {new Date().getFullYear()} Project Polis. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span className="font-medium">Built for civic accountability</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;