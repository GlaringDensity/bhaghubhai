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

const Navbar = () => {
  const userData = useSelector((state: any) => state.user.userData);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    setMounted(true);
  }, []);

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
          "fixed z-50 w-[95%] top-5 rounded-2xl -translate-x-1/2 left-1/2 border-2 backdrop-blur-xl transition-all duration-300",
          "bg-[#F4F4F4]/50 dark:bg-[#121212]/70",
          "border-[#2E2E2E]/40 dark:border-[#E0E0E0]/30 hover:border-[#4A90E2]/60 dark:hover:border-[#4A90E2]/50 hover:shadow-lg hover:shadow-[#4A90E2]/10",
          "lg:top-3 lg:left-1/2 lg:w-[80%] lg:-translate-x-1/2 lg:rounded-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-[#2E2E2E] dark:text-[#E0E0E0] hover:opacity-80 transition-opacity flex-shrink-0"
          >
            Logo
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 border h-10 whitespace-nowrap",
                  "text-[#2E2E2E] dark:text-[#E0E0E0]",
                  isLinkActive(link.href)
                    ? "bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/50 shadow-md shadow-[#4A90E2]/15"
                    : "border-transparent hover:bg-[#4A90E2]/15 hover:text-[#4A90E2] hover:border-[#4A90E2]/40 hover:shadow-md hover:shadow-[#4A90E2]/10",
                )}
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
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
                "rounded-full p-2 transition-all duration-300 flex-shrink-0",
                "text-[#2E2E2E] dark:text-[#E0E0E0]",
                "hover:bg-[#4A90E2]/15 hover:text-[#4A90E2] hover:scale-110",
                "border border-transparent hover:border-[#4A90E2]/40 hover:shadow-md hover:shadow-[#4A90E2]/10",
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
                  "text-[#2E2E2E] dark:text-[#E0E0E0]",
                  "hover:bg-[#4A90E2]/15 hover:text-[#4A90E2] hover:scale-105",
                  "border border-transparent hover:border-[#4A90E2]/40 hover:shadow-md hover:shadow-[#4A90E2]/10",
                )}
              >
                <div className="relative h-5 w-5">
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition top-1/2 -translate-y-1/2", isOpen ? "rotate-45" : "-translate-y-1.5")} />
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition top-1/2 -translate-y-1/2", isOpen && "opacity-0")} />
                  <span className={cn("absolute block h-0.5 w-5 bg-current transition top-1/2 -translate-y-1/2", isOpen ? "-rotate-45" : "translate-y-1.5")} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity bg-black/20 backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          "fixed left-1/2 top-28 z-50 w-[95%] -translate-x-1/2 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
          "bg-[#F4F4F4]/80 dark:bg-[#121212]/80",
          "border-[#2E2E2E]/40 dark:border-[#E0E0E0]/30 shadow-2xl",
          isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none",
        )}
      >
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 border text-sm",
                  "text-[#2E2E2E] dark:text-[#E0E0E0]",
                  isLinkActive(link.href)
                    ? "bg-[#4A90E2]/20 text-[#4A90E2] border-[#4A90E2]/50 shadow-md shadow-[#4A90E2]/20"
                    : "border-transparent hover:bg-[#4A90E2]/15 hover:text-[#4A90E2] hover:border-[#4A90E2]/40 hover:shadow-md hover:shadow-[#4A90E2]/15",
                  isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex-shrink-0">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </div>

                <span
                  className={cn(
                    "h-2 w-2 rounded-full bg-[#4A90E2] transition-all duration-200 flex-shrink-0",
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
              "mt-6 flex flex-col gap-4 border-t border-[#2E2E2E]/20 dark:border-[#E0E0E0]/20 pt-6 transition-all duration-200",
              isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
            )}
            style={{
              transitionDelay: isOpen ? `${navLinks.length * 50 + 50}ms` : "0ms",
            }}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[#2E2E2E]/60 dark:text-[#E0E0E0]/60 uppercase tracking-widest">Language</span>
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
