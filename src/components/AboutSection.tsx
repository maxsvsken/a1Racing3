"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Register GSAP plugins
  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Set initial states
      const cards = cardsRef.current?.children;
      if (!cards) return;

      // Reveal text
      gsap.from(".reveal-text", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
      });

      // Animate cards like shifting aerodynamic flaps
      gsap.from(cards, {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 50,
        rotationX: 15,
        stagger: 0.15,
        duration: 1.2,
        ease: "power4.out",
      });
    },
    { scope: sectionRef }
  );

  const getCardData = (key: 'experience' | 'approach' | 'principles') => {
    return a1Content.about.cards[key];
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden border-t border-chrome/5"
      style={{ perspective: 1200 }}
    >
      {/* Decorative metal lights */}
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-white/2 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          <div className="lg:col-span-4 select-none">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
              {a1Content.about.sectionNum}
            </span>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
              {a1Content.about.title}
            </h2>
          </div>
          
          <div className="lg:col-span-8 space-y-6 text-titanium text-base md:text-lg font-light leading-relaxed tracking-wide">
            <p className="reveal-text border-l-2 border-racing-red pl-6 py-2 text-white font-normal">
              {a1Content.about.paragraph1}
            </p>
            <p className="reveal-text pl-6">
              {a1Content.about.paragraph2}
            </p>
          </div>
        </div>

        {/* Aluminum Panels (Cards) */}
        <div 
          ref={cardsRef} 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6"
        >
          {/* Card 1: Experience */}
          <div className="chrome-sweep metal-panel metal-panel-hover flex flex-col justify-between p-8 min-h-[300px] rounded-sm relative group cursor-pointer overflow-hidden border border-chrome/15">
            {/* Glossy light streak line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold text-chrome/30 group-hover:text-racing-red transition-colors duration-300 font-display">01</span>
              {/* Racing bolt design icon */}
              <div className="h-6 w-6 rounded-full border border-chrome/20 flex items-center justify-center group-hover:border-racing-red/50 transition-colors duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-chrome/50 group-hover:bg-racing-red transition-colors duration-300" />
              </div>
            </div>
            
            <div className="mt-16 space-y-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                {getCardData('experience').title}
              </h3>
              <p className="text-sm text-titanium leading-relaxed font-light tracking-wide group-hover:text-chrome transition-colors duration-300">
                {getCardData('experience').text}
              </p>
            </div>
          </div>

          {/* Card 2: Approach */}
          <div className="chrome-sweep metal-panel metal-panel-hover flex flex-col justify-between p-8 min-h-[300px] rounded-sm relative group cursor-pointer overflow-hidden border border-chrome/15">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold text-chrome/30 group-hover:text-racing-red transition-colors duration-300 font-display">02</span>
              <div className="h-6 w-6 rounded-full border border-chrome/20 flex items-center justify-center group-hover:border-racing-red/50 transition-colors duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-chrome/50 group-hover:bg-racing-red transition-colors duration-300" />
              </div>
            </div>
            
            <div className="mt-16 space-y-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                {getCardData('approach').title}
              </h3>
              <p className="text-sm text-titanium leading-relaxed font-light tracking-wide group-hover:text-chrome transition-colors duration-300">
                {getCardData('approach').text}
              </p>
            </div>
          </div>

          {/* Card 3: Principles */}
          <div className="chrome-sweep metal-panel metal-panel-hover flex flex-col justify-between p-8 min-h-[300px] rounded-sm relative group cursor-pointer overflow-hidden border border-chrome/15">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
            
            <div className="flex justify-between items-start">
              <span className="text-3xl font-extrabold text-chrome/30 group-hover:text-racing-red transition-colors duration-300 font-display">03</span>
              <div className="h-6 w-6 rounded-full border border-chrome/20 flex items-center justify-center group-hover:border-racing-red/50 transition-colors duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-chrome/50 group-hover:bg-racing-red transition-colors duration-300" />
              </div>
            </div>
            
            <div className="mt-16 space-y-3">
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white">
                {getCardData('principles').title}
              </h3>
              <p className="text-sm text-titanium leading-relaxed font-light tracking-wide group-hover:text-chrome transition-colors duration-300">
                {getCardData('principles').text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
