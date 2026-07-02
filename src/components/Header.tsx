"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Главная", href: "#hero" },
  { label: "Кто мы", href: "#about" },
  { label: "Руководство", href: "#director" },
  { label: "Инвесторы", href: "#investors" },
  { label: "Экспертиза", href: "#today" },
  { label: "Кодекс А1", href: "#code" },
  { label: "Кто зарабатывает", href: "#audience" },
  { label: "Контакты", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Determine active section based on scroll position
      const scrollPosition = window.scrollY + 100;
      for (const item of navItems) {
        const sectionId = item.href.substring(1);
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(sectionId);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Offset for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
      setIsOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-deep-black/70 backdrop-blur-md border-b border-chrome/10 py-3 shadow-lg shadow-black/30"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="relative block h-10 w-24 md:h-12 md:w-28 transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/images/logo.webp"
            alt="Логотип А1"
            fill
            sizes="(max-w-768px) 112px, 112px"
            className="object-contain filter brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
            priority
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
          {navItems.map((item) => {
            const sectionId = item.href.substring(1);
            const isActive = activeSection === sectionId;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative px-4 py-2 text-xs xl:text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                  isActive
                    ? "text-racing-red font-semibold"
                    : "text-titanium hover:text-metal-white"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-racing-red shadow-[0_0_8px_#FF1A1A]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Button (Desktop) */}
        <div className="hidden lg:block">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="chrome-sweep relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-widest border border-chrome/30 bg-white/5 text-metal-white hover:border-racing-red hover:bg-racing-red/10 transition-all duration-300 rounded-sm"
          >
            Связаться
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-titanium hover:text-metal-white p-2 transition-colors focus:outline-none"
          aria-label="Переключить меню"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-deep-black/95 backdrop-blur-lg border-t border-chrome/10 flex flex-col justify-between p-8"
          >
            <nav className="flex flex-col space-y-6">
              {navItems.map((item, index) => {
                const sectionId = item.href.substring(1);
                const isActive = activeSection === sectionId;
                return (
                  <motion.a
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`text-lg font-medium tracking-widest uppercase transition-colors py-2 border-b border-white/5 ${
                      isActive ? "text-racing-red pl-2 border-l-2 border-l-racing-red" : "text-titanium hover:text-metal-white"
                    }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col space-y-4"
            >
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="w-full text-center py-4 bg-racing-red text-white font-semibold uppercase tracking-widest rounded-sm shadow-[0_4px_20px_rgba(255,26,26,0.3)] hover:bg-electric-crimson transition-all duration-300"
              >
                Связаться
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
