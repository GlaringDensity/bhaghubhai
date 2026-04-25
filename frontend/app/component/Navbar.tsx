"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi";
import LoginButton from "./LoginButton";
import Language from "./Language";
import { useSelector } from "react-redux";
import {
  IoHomeOutline,
  IoPerson,
  IoMailOutline,
  IoMapOutline,
} from "react-icons/io5";
import { Outfit } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'], display: 'swap' });

const Navbar = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar if scrolling up or at the very top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Hide navbar if scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
        setIsOpen(false); // also close mobile menu if scrolling down
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions,
    );

    const sections = ["home", "about", "contact"];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const isLinkActive = (href: string) => {
    if (href.startsWith("/")) return pathname === href;
    return activeSection === href.replace("#", "");
  };

  const currentTheme = mounted ? resolvedTheme : "dark";

  const navLinks = [
    { name: "Home", href: "/", icon: <IoHomeOutline size={18} /> },
    ...(userData ? [{ name: "Map", href: "/map", icon: <IoMapOutline size={18} /> }] : []),
    { name: "About", href: "/About", icon: <IoPerson size={18} /> },
    { name: "Contact", href: "/ContactUs", icon: <IoMailOutline size={18} /> },
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed z-50 w-[95%] rounded-3xl left-1/2 border backdrop-blur-2xl transition-all duration-500 shadow-xl",
          "bg-white/80 dark:bg-[#0B0F19]/80",
          "border-[#E2E8F0] dark:border-white/10 hover:border-cyan-500/30 hover:shadow-cyan-500/10",
          "lg:w-[85%] lg:max-w-6xl lg:rounded-full",
          isVisible ? "top-4 lg:top-6 -translate-x-1/2 opacity-100" : "-translate-y-full -translate-x-1/2 opacity-0 pointer-events-none",
          outfit.className
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <Image
              src="/images/cicvicsync.png"
              alt="CivicSync Logo"
              width={240}
              height={72}
              className="object-contain dark:invert"
            />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 border whitespace-nowrap",
                  "text-[#0F172A] dark:text-[#F8FAFC]",
                  isLinkActive(link.href)
                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 shadow-sm"
                    : "border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-500",
                )}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <Language />
            </div>
            <div className="hidden lg:block">
              <LoginButton />
            </div>
            <button
              suppressHydrationWarning
              aria-label="Toggle theme"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              className={cn(
                "rounded-full p-2.5 transition-all duration-300 flex-shrink-0",
                "text-[#0F172A] dark:text-[#F8FAFC]",
                "bg-slate-100 dark:bg-white/5",
                "hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-500 hover:scale-105",
                "border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800",
                "w-10 h-10 flex items-center justify-center",
              )}
            >
              <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                {currentTheme === "dark" ? (
                  <HiSun size={18} className="transition-all" />
                ) : (
                  <HiMoon size={18} className="transition-all" />
                )}
              </div>
            </button>

            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "relative z-50 inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 flex-shrink-0",
                  "text-[#0F172A] dark:text-[#F8FAFC]",
                  "bg-slate-100 dark:bg-white/5",
                  "hover:bg-cyan-50 dark:hover:bg-cyan-500/10 hover:text-cyan-500 hover:scale-105",
                  "border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800",
                )}
              >
                <div className="relative h-5 w-5">
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition-all top-1/2 -translate-y-1/2", isOpen ? "rotate-45" : "-translate-y-1.5")} />
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition-all top-1/2 -translate-y-1/2", isOpen && "opacity-0")} />
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition-all top-1/2 -translate-y-1/2", isOpen ? "-rotate-45" : "translate-y-1.5")} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300 bg-black/40 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Content */}
      <div
        className={cn(
          "fixed left-1/2 top-28 z-50 w-[95%] max-w-sm -translate-x-1/2 rounded-[2rem] border backdrop-blur-2xl transition-all duration-300 ease-out lg:hidden",
          "bg-white/90 dark:bg-[#0B0F19]/90",
          "border-[#E2E8F0] dark:border-white/10 shadow-2xl",
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none",
          outfit.className
        )}
      >
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 border text-base font-bold",
                  "text-[#0F172A] dark:text-[#F8FAFC]",
                  isLinkActive(link.href)
                    ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 shadow-sm"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5 hover:text-cyan-500",
                  isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 text-lg">{link.icon}</span>
                  <span>{link.name}</span>
                </div>

                <span
                  className={cn(
                    "h-2 w-2 rounded-full bg-cyan-500 transition-all duration-200 flex-shrink-0",
                    isLinkActive(link.href)
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-75",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div 
            className={cn(
              "mt-6 flex flex-col gap-5 border-t border-[#E2E8F0] dark:border-white/10 pt-6 transition-all duration-200",
              isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            )}
            style={{
              transitionDelay: isOpen ? `${navLinks.length * 50 + 50}ms` : "0ms",
            }}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest">Language</span>
              <Language />
            </div>
            <div className="px-2">
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
