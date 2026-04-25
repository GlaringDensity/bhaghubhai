"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion, type Variants } from 'framer-motion';
import { Outfit, Space_Grotesk } from 'next/font/google';
import { Send, MapPin, Mail, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap' });

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function ContactUsPage() {
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setResult("Sending...");
    
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult("Message sent successfully!");
        toast.success("Message sent successfully!");
        event.currentTarget.reset();
      } else {
        console.log("Error", data);
        setResult(data.message);
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error("Submit Error", error);
      setResult(error.message || "Something went wrong. Please try again.");
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen relative bg-[#F8FAFC] dark:bg-[#05050A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-500 pt-36 pb-24 ${spaceGrotesk.className}`}>
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-400/20 dark:bg-cyan-600/20 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-600/15 blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Get in Touch
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-4xl md:text-6xl font-black tracking-tight mb-6 ${outfit.className}`}
          >
            Let's build better <span className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 bg-clip-text text-transparent">cities together.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#64748B] dark:text-[#94A3B8] leading-relaxed"
          >
            Whether you're a citizen wanting to pilot Civic Sync in your neighborhood, or a municipality looking to partner, we're here to talk.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20 items-start">
          
          {/* Contact Info Column */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="lg:col-span-2 space-y-8"
          >
            <div className="p-8 rounded-3xl bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-lg">
              <h3 className={`text-2xl font-bold mb-8 ${outfit.className}`}>Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">Email Us</p>
                    <a href="mailto:hello@projectpolis.com" className="text-lg font-medium hover:text-cyan-500 transition-colors">hello@projectpolis.com</a>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500 group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">Support</p>
                    <p className="text-lg font-medium">Available 24/7 via feed</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">HQ</p>
                    <p className="text-lg font-medium">Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Map Visual block */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white relative overflow-hidden shadow-lg shadow-cyan-500/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDE5LjVoMjBWMjBIMHptMTkuNSAwVjBoLjV2MjBoLS41eiIgZmlsbD0icmdiYSsyNTUsIDI1NSwgMjU1LCAwLjIpIi8+PC9zdmc+')] opacity-20" />
              <div className="relative z-10">
                <MapPin className="w-8 h-8 mb-4 opacity-80" />
                <h4 className={`text-xl font-bold mb-2 ${outfit.className}`}>Live everywhere.</h4>
                <p className="text-cyan-100 text-sm leading-relaxed">
                  Civic Sync is an unprojected SVG plane. It works in any locality, independent of existing complex GIS infrastructure.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-3"
          >
            <div className="p-8 md:p-12 rounded-[2rem] bg-white dark:bg-[#0B0F19] border border-[#E2E8F0] dark:border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 dark:bg-fuchsia-500/10 rounded-full blur-3xl" />
              
              <h3 className={`text-3xl font-black mb-8 relative z-10 ${outfit.className}`}>Send a Message</h3>
              
              <form onSubmit={onSubmit} className="space-y-6 relative z-10">
                <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3_FORMS_ACCESS_KEY} />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">Your Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      placeholder="Jane Doe"
                      className={`w-full px-5 py-4 bg-[#F8FAFC] dark:bg-[#020617] border border-[#E2E8F0] dark:border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-[#0F172A] dark:text-white transition-all ${outfit.className}`} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      required
                      placeholder="jane@example.com"
                      className={`w-full px-5 py-4 bg-[#F8FAFC] dark:bg-[#020617] border border-[#E2E8F0] dark:border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-[#0F172A] dark:text-white transition-all ${outfit.className}`} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider ml-1">Message</label>
                  <textarea 
                    name="message" 
                    required
                    rows={6}
                    placeholder="Tell us about your city, or how we can help..."
                    className={`w-full px-5 py-4 bg-[#F8FAFC] dark:bg-[#020617] border border-[#E2E8F0] dark:border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-[#0F172A] dark:text-white transition-all resize-none ${outfit.className}`} 
                  />
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${outfit.className}`}
                  >
                    {loading ? "Sending..." : "Send Message"}
                    {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>

                  {result && (
                    <p className={`text-sm font-bold ${result.includes("successfully") ? "text-emerald-500" : "text-fuchsia-500"}`}>
                      {result}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

