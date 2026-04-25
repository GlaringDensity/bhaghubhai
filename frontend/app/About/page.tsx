"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Outfit, Space_Grotesk } from 'next/font/google';
import {
  MapPin,
  Layers,
  Users,
  Zap,
  Target,
  Heart,
  Globe2,
  ShieldCheck,
  ArrowRight,
  Eye,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' });

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <main
      className={`min-h-screen bg-[#F8FAFC] dark:bg-[#05050A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-500 ${spaceGrotesk.className}`}
    >
      {/* ── PAGE HEADER ── */}
      <div className="bg-white dark:bg-[#0B0F19] border-b border-[#E2E8F0] dark:border-white/10 pt-36 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-4"
          >
            About Civic Sync
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl md:text-5xl font-black tracking-tight mb-6 leading-tight max-w-3xl ${outfit.className}`}
          >
            We believe civic infrastructure{' '}
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              deserves better software.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-2xl"
          >
            Civic Sync is a civic-tech platform that makes local issues visible, trackable, and resolvable — through a beautifully unified map and Kanban interface.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">

        {/* ── OUR STORY ── */}
        <section className="py-20 border-b border-[#E2E8F0] dark:border-white/10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 mb-4">Our Story</p>
              <h2 className={`text-3xl md:text-4xl font-black tracking-tight mb-6 ${outfit.className}`}>
                Born out of frustration with civic opacity
              </h2>
              <div className="space-y-4 text-[#64748B] dark:text-[#94A3B8] text-lg leading-relaxed">
                <p>
                  In most cities, when a pothole appears or a drain floods, the report disappears into a form. Citizens have no way of knowing if it was even read, let alone acted upon.
                </p>
                <p>
                  Civic Sync was built to fix that. Every issue gets a pin on a live map, a card on a Kanban board, and a public status — visible to the entire community.
                </p>
                <p>
                  We started as a small engineering experiment. Today we&apos;re a platform that turns civic frustration into structured, trackable accountability.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative"
            >
              <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] dark:border-white/10 shadow-2xl">
                <div style={{ height: '340px', position: 'relative' }}>
                  <Image
                    src="/images/map_ui.png"
                    alt="Civic Sync Map"
                    fill
                    className="object-cover"
                    sizes="(max-width: 800px) 100vw, 600px"
                  />
                </div>
              </div>
              {/* Stat pill */}
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-[#1E293B] rounded-2xl px-5 py-3 shadow-xl border border-[#E2E8F0] dark:border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`font-black text-base ${outfit.className}`}>8,400+ issues</p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">resolved across localities</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── MISSION ── */}
        <section className="py-20 border-b border-[#E2E8F0] dark:border-white/10">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Mission</p>
              </div>
              <h2 className={`text-3xl font-black tracking-tight mb-5 ${outfit.className}`}>
                What we&apos;re here to do
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-base leading-relaxed">
                Our mission is to close the gap between civic reporting and resolution — making the status of every local issue accessible, transparent, and community-driven.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="lg:col-span-2 grid sm:grid-cols-2 gap-5"
            >
              {[
                { icon: <Globe2 className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10', title: 'Spatial Visibility', desc: 'Every civic issue is pinned to a real location on an interactive map — no more invisible reports.' },
                { icon: <Layers className="w-5 h-5" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10', title: 'Unified State', desc: 'Map and Kanban board share one data source. Update a card, the pin reflects it instantly.' },
                { icon: <Users className="w-5 h-5" />, color: 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/10', title: 'Community Voice', desc: 'Citizens upvote, comment, and follow issues. Community weight drives resolution priority.' },
                { icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', title: 'Public Accountability', desc: 'Every status change is visible. Officials can no longer silently dismiss community concerns.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="p-6 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className={`font-bold text-base mb-2 ${outfit.className}`}>{item.title}</h3>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── VISION ── */}
        <section className="py-20 border-b border-[#E2E8F0] dark:border-white/10">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="lg:col-span-1"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">Vision</p>
              </div>
              <h2 className={`text-3xl font-black tracking-tight mb-5 ${outfit.className}`}>
                Where we&apos;re headed
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-base leading-relaxed">
                A world where no civic issue goes untracked — where every city, town, and neighbourhood has live, trustworthy insight into its own infrastructure health.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="lg:col-span-2 space-y-4"
            >
              {[
                { year: '2024', label: 'Prototype', desc: 'First dual-mode interface built — SVG map + Kanban sharing a unified Zustand atom.' },
                { year: '2025', label: 'Community pilot', desc: 'Deployed in 3 localities. 8,400+ issues logged. 94% resolution rate validated.' },
                { year: '2026', label: 'Open platform', desc: 'API-first architecture. Any local government or NGO can embed Polis into their workflow.' },
                { year: '2027+', label: 'City-scale', desc: 'Full geographic coverage across Tier 1 and Tier 2 Indian cities — real-time civic heatmaps.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="flex gap-6 p-6 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex-shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 ${outfit.className}`}>
                      {item.year}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-base mb-1 ${outfit.className}`}>{item.label}</h3>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-20 border-b border-[#E2E8F0] dark:border-white/10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Values</p>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight max-w-xl ${outfit.className}`}>
              The principles we don&apos;t compromise on
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              { label: 'Transparency', color: 'from-cyan-400 to-blue-600', desc: 'Every issue, every status, every update — publicly visible by default.' },
              { label: 'Community Ownership', color: 'from-fuchsia-400 to-purple-600', desc: 'Citizens upvote, shape priority, and hold systems accountable.' },
              { label: 'Technical Integrity', color: 'from-emerald-400 to-teal-600', desc: 'One state atom. Zero data drift. Map and board always in sync.' },
              { label: 'Inclusive Design', color: 'from-amber-300 to-orange-500', desc: 'Simple enough for any citizen. Powerful enough for any city.' },
            ].map((v, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="p-7 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 group"
              >
                <div className={`w-10 h-1.5 rounded-full bg-gradient-to-r ${v.color} mb-5 group-hover:w-full transition-all duration-500`} />
                <h3 className={`font-black text-lg mb-3 ${outfit.className}`}>{v.label}</h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── WHAT WE'VE BUILT ── */}
        <section className="py-20 border-b border-[#E2E8F0] dark:border-white/10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Technology</p>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight max-w-xl ${outfit.className}`}>
              What we actually built
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              'A pannable, zoomable SVG locality plane with unprojected coordinate-mapped issue pins.',
              'A Kanban status automaton — four columns (New → In Progress → Review → Resolved) with drag-and-drop transitions.',
              'A unified reactive state atom: a single source of truth driving both the map view and the Kanban board simultaneously.',
              'Community upvoting that reorders cards by weight in real-time, surfacing the most critical issues first.',
              'Geospatially-indexed issue records with category tags: Infrastructure, Sanitation, Safety, Greenery.',
              'Client-side state persistence via localStorage — zero backend dependency for the core interface.',
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 hover:shadow-md transition-all duration-300"
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                <p className="text-[#0F172A] dark:text-[#F1F5F9] text-sm leading-relaxed font-medium">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Team</p>
            </div>
            <h2 className={`text-3xl md:text-4xl font-black tracking-tight ${outfit.className}`}>
              The people behind Polis
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { name: 'Aaditya', role: 'Founder & Lead Engineer', desc: 'Full-stack engineer obsessed with reactive state architecture and civic UX.', initial: 'A', color: 'from-cyan-400 to-blue-600' },
              { name: 'Civic Dev', role: 'Frontend Architect', desc: 'Specialist in SVG canvas systems and Framer Motion interaction design.', initial: 'C', color: 'from-fuchsia-400 to-purple-600' },
              { name: 'Open Source', role: 'Community Builder', desc: 'Connecting Civic Sync with NGOs, municipalities, and civic communities.', initial: 'O', color: 'from-emerald-400 to-teal-600' },
            ].map((m, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="flex gap-5 p-7 rounded-2xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-14 h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-2xl font-black shadow group-hover:scale-110 transition-transform duration-300 ${outfit.className}`}>
                  {m.initial}
                </div>
                <div>
                  <h3 className={`font-black text-lg mb-0.5 ${outfit.className}`}>{m.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-2">{m.role}</p>
                  <p className="text-sm text-[#64748B] dark:text-[#94A3B8] leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 dark:from-cyan-500/5 dark:to-fuchsia-500/5 border border-cyan-200/50 dark:border-cyan-800/30"
          >
            <div>
              <h3 className={`text-xl font-black mb-1 ${outfit.className}`}>Want to contribute?</h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-sm">Civic Sync is open to contributors, pilot partners, and civic organisations.</p>
            </div>
            <Link
              href="/ContactUs"
              className={`flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-bold rounded-full hover:scale-105 transition-transform shadow-lg ${outfit.className}`}
            >
              Get in touch <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>

      </div>
    </main>
  );
}

