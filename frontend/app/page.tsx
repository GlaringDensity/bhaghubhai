"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Outfit, Space_Grotesk } from 'next/font/google';
import {
  LayoutDashboard,
  ShieldAlert,
  TreePine,
  Wrench,
  Trash2,
  ArrowRight,
  Activity,
  Users,
  Zap,
  Globe2,
  Layers,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' });

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const categories = [
    { name: 'Infrastructure', icon: <Wrench className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-900', shadow: 'shadow-cyan-500/20' },
    { name: 'Sanitation', icon: <Trash2 className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900', shadow: 'shadow-emerald-500/20' },
    { name: 'Safety', icon: <ShieldAlert className="w-5 h-5" />, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-900', shadow: 'shadow-rose-500/20' },
    { name: 'Greenery', icon: <TreePine className="w-5 h-5" />, color: 'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-900', shadow: 'shadow-fuchsia-500/20' },
  ];

  const features = [
    {
      title: "Geospatial Canvas",
      description: "Interactive, pannable SVG city map. Pin your issues precisely with unprojected coordinate mapping.",
      icon: <Globe2 className="w-6 h-6" />,
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      title: "Unified State Architecture",
      description: "Zero data reconciliation overhead. Our single state atom ensures your map pins and Kanban cards are perfectly in sync.",
      icon: <Layers className="w-6 h-6" />,
      gradient: "from-fuchsia-400 to-purple-600"
    },
    {
      title: "Live Status Automaton",
      description: "Drag-and-drop Kanban view. Move a card from 'New' to 'In Progress' and watch it instantly update on the map.",
      icon: <Activity className="w-6 h-6" />,
      gradient: "from-rose-400 to-orange-500"
    },
    {
      title: "Community Upvoting",
      description: "Real-time card reordering based on community vote weight, driving priority and accountability.",
      icon: <Zap className="w-6 h-6" />,
      gradient: "from-amber-300 to-emerald-500"
    }
  ];

  return (
    <main className={`min-h-screen relative bg-[#F8FAFC] dark:bg-[#05050A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-500 pt-32 pb-20 ${spaceGrotesk.className}`}>
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/20 dark:bg-cyan-600/20 blur-[150px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/20 dark:bg-fuchsia-600/20 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[150px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center min-h-[90vh] px-6 text-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Project Polis • The Civic Standard</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className={`text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter mb-8 leading-[1.05] ${outfit.className}`}
        >
          Civic Action, <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
            Reimagined.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-xl md:text-2xl text-[#64748B] dark:text-[#94A3B8] mb-12 leading-relaxed"
        >
          A dual-mode civic interface closing the perception gap between spatial reporting and status accountability through a unified, beautiful experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <Link href="/app" className={`group px-8 py-4 bg-white dark:bg-white text-black font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 ${outfit.className} text-lg`}>
            Launch Platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className={`px-8 py-4 bg-transparent text-[#0F172A] dark:text-white font-bold rounded-full border-2 border-[#E2E8F0] dark:border-white/20 transition-all hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-2 ${outfit.className} text-lg`}>
            Explore Features
          </Link>
        </motion.div>

        {/* Hero Image / Map Visual */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl rounded-[2.5rem] overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl shadow-slate-200/50 dark:shadow-cyan-900/20 bg-white dark:bg-[#0F172A] relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md z-20">
            <div className="flex gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
            </div>
            <div className="ml-4 flex items-center gap-2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
              <Globe2 className="w-5 h-5 text-cyan-500"/> Geospatial Heatmap View
            </div>
          </div>
          {/* Use regular img tag to avoid fill issues */}
          <div className="w-full" style={{ height: '500px', position: 'relative' }}>
            <Image 
              src="/images/map_ui.png" 
              alt="Project Polis Map Interface" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </motion.div>
      </section>

      {/* Metrics Section */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto mt-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { label: "Issues Resolved", value: "8,432+", icon: <Activity className="w-6 h-6" />, color: "text-cyan-500" },
            { label: "Active Citizens", value: "12.5k", icon: <Users className="w-6 h-6" />, color: "text-fuchsia-500" },
            { label: "Resolution Rate", value: "94%", icon: <Zap className="w-6 h-6" />, color: "text-blue-500" }
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeIn} className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_40px_rgb(6,182,212,0.15)] transition-all duration-500 hover:-translate-y-2 group">
              <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                {stat.icon}
              </div>
              <h4 className={`text-5xl lg:text-6xl font-black mb-3 tracking-tight ${outfit.className}`}>{stat.value}</h4>
              <p className="text-[#64748B] dark:text-[#94A3B8] font-semibold tracking-wide uppercase text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-5xl md:text-6xl font-black mb-6 tracking-tight ${outfit.className}`}
          >
            Built for Scale & Impact
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#64748B] dark:text-[#94A3B8] max-w-2xl mx-auto"
          >
            Every feature is designed to reduce friction between citizens reporting issues and authorities resolving them.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex overflow-x-auto snap-x snap-mandatory pb-8 -mx-6 px-6 gap-6 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 sm:gap-8 lg:gap-10 scrollbar-hide"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              className="relative flex-none w-[85vw] snap-center sm:w-auto p-8 sm:p-10 rounded-3xl sm:rounded-[2rem] bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${feature.gradient} mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className={`text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 ${outfit.className}`}>{feature.title}</h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-base sm:text-lg leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Kanban Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[#F1F5F9] dark:bg-[#0B0F19]/80 border-y border-[#E2E8F0] dark:border-white/5 -skew-y-3 origin-top-left z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-900/30 border border-fuchsia-200 dark:border-fuchsia-800 mb-8 uppercase tracking-wider">
                Status Automaton
              </div>
              <h2 className={`text-5xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tight ${outfit.className}`}>
                One Source of Truth. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">Infinite Clarity.</span>
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-xl mb-8 leading-relaxed">
                Project Polis operates on a unified reactive state atom. Toggle to the Kanban view, and the issue card is right there in the &apos;New&apos; column.
              </p>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-xl mb-10 leading-relaxed">
                Drag it to &apos;In Progress&apos; and the map pin reflects the status change immediately. No data reconciliation, no asymmetry. Pure frontend mastery.
              </p>
              
              <Link href="/app" className={`inline-flex items-center gap-3 font-bold text-lg text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors group ${outfit.className}`}>
                Experience the magic <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>

            {/* Kanban Image visual using generated asset */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: 10 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(217,70,239,0.15)] border-4 border-white dark:border-[#1E293B] bg-white dark:bg-[#020617] transform perspective-1000"
            >
              <div className="flex items-center px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A]">
                <div className="flex gap-2 text-sm font-bold text-[#64748B] dark:text-[#94A3B8]">
                  <LayoutDashboard className="w-5 h-5 text-fuchsia-500"/> Kanban Board Interface
                </div>
              </div>
              <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-[#020617]">
                <Image 
                  src="/images/kanban_ui.png" 
                  alt="Project Polis Kanban Interface" 
                  fill 
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories System */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center mb-24"
        >
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${outfit.className}`}>Four-Pillar Classification</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xl max-w-2xl mx-auto">
            Every issue is uniquely identified with a distinct iconographic identity, ensuring visual density heatmaps are immediately parsable.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`p-10 rounded-[2.5rem] bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 flex flex-col items-center text-center shadow-lg hover:${cat.shadow} transition-all duration-500 hover:-translate-y-3 group`}
            >
              <div className={`mb-8 p-6 rounded-3xl border ${cat.color} group-hover:scale-110 transition-transform duration-500`}>
                {cat.icon}
              </div>
              <h3 className={`font-bold text-2xl ${outfit.className}`}>{cat.name}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center bg-gradient-to-br from-cyan-500 via-blue-600 to-fuchsia-600 rounded-[3rem] p-16 md:p-24 shadow-[0_20px_50px_rgba(6,182,212,0.3)] dark:shadow-[0_20px_50px_rgba(6,182,212,0.2)] relative overflow-hidden"
        >
          {/* Abstract CTA Background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className={`text-5xl md:text-7xl font-black mb-8 text-white tracking-tight ${outfit.className}`}>Ready to shape your locality?</h2>
            <p className="text-blue-100 text-xl md:text-2xl mb-14 max-w-3xl mx-auto font-medium">Join thousands of citizens taking action and making a visible difference in their neighborhoods today.</p>
            <Link href="/app" className={`inline-flex items-center gap-3 px-12 py-6 bg-white text-[#0F172A] font-black text-xl rounded-full transition-all hover:scale-105 shadow-2xl shadow-black/20 hover:shadow-white/20 ${outfit.className}`}>
              Launch Application <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </section>


    </main>
  );
}