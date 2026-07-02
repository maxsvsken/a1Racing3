"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  // Register GSAP plugins
  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      // Intro animations
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(textRef.current?.children || [], {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 1.2,
      });

      tl.from(
        imageWrapperRef.current,
        {
          opacity: 0,
          scale: 0.95,
          duration: 1.5,
        },
        "-=0.8"
      );

      // Mouse move effect for metal reflection
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current || !lightRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate relative mouse position (from -1 to 1)
        const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        // Animate light highlight reflection
        gsap.to(lightRef.current, {
          x: relX * 150,
          y: relY * 150,
          duration: 1.5,
          ease: "power2.out",
        });

        // Slight parallax for the 3D chrome model
        if (imageWrapperRef.current) {
          gsap.to(imageWrapperRef.current, {
            rotateY: relX * 8,
            rotateX: -relY * 8,
            duration: 2,
            ease: "power3.out",
          });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);

      // Auto pulsing metal light shine
      gsap.to(lightRef.current, {
        opacity: 0.8,
        scale: 1.2,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: containerRef }
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen bg-deep-black flex items-center justify-center pt-24 pb-16 overflow-hidden speed-lines"
      style={{ perspective: 1000 }}
    >
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-racing-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-racing-red/3 rounded-full blur-[150px] pointer-events-none" />

      {/* Decorative Aerodynamic Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-chrome/20 to-transparent pointer-events-none" />
      <div className="absolute left-[8%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-chrome/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Content (40%) */}
        <div ref={textRef} className="lg:col-span-5 flex flex-col justify-center space-y-8 select-none">
          {/* Tag */}
          <div className="inline-flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-racing-red animate-pulse shadow-[0_0_8px_#FF1A1A]" />
            <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-racing-red">
              Motorsport investment concept
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] font-display">
            {a1Content.hero.title}
          </h1>

          {/* Placeholder Description */}
          <p className="text-sm md:text-base text-titanium leading-relaxed font-light tracking-wide max-w-lg border-l border-chrome/20 pl-4 py-1">
            {a1Content.hero.placeholderDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {/* Primary button */}
            <a
              href="#contact"
              className="chrome-sweep relative group overflow-hidden flex items-center justify-center px-8 py-4 bg-racing-red text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,26,26,0.2)] hover:shadow-[0_0_35px_rgba(255,26,26,0.4)] hover:bg-electric-crimson"
            >
              <span>{a1Content.hero.ctaPrimary}</span>
              <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>

            {/* Secondary button */}
            <a
              href="#about"
              className="chrome-sweep group relative flex items-center justify-center px-8 py-4 border border-chrome/25 bg-white/5 text-metal-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:border-white/50 hover:bg-white/10"
            >
              <span>{a1Content.hero.ctaSecondary}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Chrome Object (60%) */}
        <div className="lg:col-span-7 flex justify-center items-center relative h-[400px] md:h-[550px] lg:h-[650px] w-full">
          {/* Light sweep element */}
          <div 
            ref={lightRef} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-white/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none z-20"
          />

          {/* Chrome Object Wrapper */}
          <div
            ref={imageWrapperRef}
            className="relative w-full h-full max-w-[580px] lg:max-w-none transition-transform duration-500 ease-out select-none cursor-grab active:cursor-grabbing"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Glossy Metallic Reflections */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-3xl opacity-60 mix-blend-overlay z-15 pointer-events-none" />

            {/* Main Image */}
            <Image
              src="/images/Racing/chrome_hero.png"
              alt="Хромированный концепт А1"
              fill
              sizes="(max-w-1024px) 100vw, 60vw"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.85)] filter brightness-105 contrast-105"
              priority
            />

            {/* Chrome reflection overlay lines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none z-10 mix-blend-screen" />
          </div>
        </div>
      </div>

      {/* Decorative vertical speed trails */}
      <div className="absolute right-[5%] top-1/4 w-[1px] h-32 bg-gradient-to-b from-transparent via-racing-red/40 to-transparent pointer-events-none" />
      <div className="absolute left-[3%] bottom-1/4 w-[1px] h-48 bg-gradient-to-b from-transparent via-chrome/20 to-transparent pointer-events-none" />
    </section>
  );
}
