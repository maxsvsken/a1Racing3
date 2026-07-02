"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function CodeSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Background parallax movement
      gsap.to(".bg-building", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
        y: -100,
        ease: "none",
      });

      // Staggered reveal of principles
      const items = gsap.utils.toArray<HTMLElement>(".principle-item");
      gsap.from(items, {
        scrollTrigger: {
          trigger: listRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        stagger: 0.08,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="code"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden border-t border-chrome/5"
    >
      {/* Background Building Image (Motorsport Architecture Concept) */}
      <div className="bg-building absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] opacity-15 pointer-events-none select-none z-0">
        <Image
          src="/images/Racing/chrome_building.png"
          alt="Engineering HQ silhouette"
          fill
          sizes="60vw"
          className="object-contain object-bottom filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-deep-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-transparent to-transparent" />
      </div>

      {/* Speed lines decor */}
      <div className="absolute left-[5%] top-0 h-full w-[1px] bg-gradient-to-b from-chrome/10 via-transparent to-chrome/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-20 select-none max-w-3xl">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
            {a1Content.code.sectionNum}
          </span>
          <h2 className="text-3xl md:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight text-white mt-3 leading-tight font-display">
            {a1Content.code.title}
          </h2>
          <div className="h-[2px] w-48 bg-gradient-to-r from-racing-red to-transparent mt-6 shadow-[0_0_8px_#FF1A1A]" />
        </div>

        {/* 10 Principles List */}
        <div 
          ref={listRef}
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8"
        >
          {a1Content.code.principles.map((p) => (
            <div
              key={p.id}
              className="principle-item flex items-start space-x-6 group"
            >
              {/* Left Side indicator line with chrome dot */}
              <div className="flex flex-col items-center pt-1.5 select-none">
                <span className="text-xs font-mono font-bold text-racing-red tracking-wider">
                  {p.id}
                </span>
                <div className="w-[2px] h-16 bg-gradient-to-b from-racing-red/60 via-chrome/10 to-transparent mt-2 transition-all duration-500 group-hover:h-20 group-hover:from-racing-red" />
              </div>

              {/* Text content block */}
              <div className="space-y-2 border-b border-white/5 pb-6 w-full">
                <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-white group-hover:text-racing-red transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="text-sm text-titanium leading-relaxed font-light tracking-wide group-hover:text-chrome transition-colors duration-300">
                  {p.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
