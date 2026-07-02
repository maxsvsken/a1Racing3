"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function DirectorSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Parallax effect on scroll for poster image
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
        y: -60,
        ease: "none",
      });

      // Frame reveal animation
      gsap.from(frameRef.current, {
        scrollTrigger: {
          trigger: frameRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        x: 40,
        duration: 1.2,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="director"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-t border-chrome/5"
    >
      {/* Background abstract layout elements */}
      <div className="absolute left-[-10%] top-1/4 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-racing-red/20 to-transparent pointer-events-none" />
      <div className="absolute right-[5%] bottom-1/4 w-[1px] h-64 bg-gradient-to-b from-transparent via-chrome/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 1980s Racing-Style Poster */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[400px] aspect-[3/4] bg-deep-black border-[6px] border-chrome/80 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden rounded-sm group">
              {/* Poster Grid/Lines decoration */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none z-10" />

              {/* Red racing stripes */}
              <div className="absolute left-4 top-0 w-[3px] h-full bg-racing-red/40 z-10" />
              <div className="absolute left-7 top-0 w-[1px] h-full bg-racing-red/20 z-10" />
              
              {/* Poster typography (80s concept style) */}
              <div className="absolute bottom-4 left-6 z-20 select-none">
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-racing-red block mb-1">
                  CHIEF EXECUTIVE
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white leading-none font-display">
                  A. FAIN
                </h3>
              </div>

              <div className="absolute top-4 right-6 z-20 text-right select-none">
                <span className="text-[11px] font-extrabold tracking-widest text-chrome/50 block">
                  A1 RACING TEAM
                </span>
                <span className="text-[9px] font-mono text-titanium block">
                  Est. 1992 / Moscow
                </span>
              </div>

              {/* Image with parallax */}
              <div ref={imageRef} className="relative w-full h-[115%] -top-[10%] transition-transform duration-300">
                {/* Vintage overlay filter */}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent z-10 opacity-70" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] z-10" />
                
                <Image
                  src={a1Content.director.imagePath}
                  alt={a1Content.director.name}
                  fill
                  sizes="(max-w-768px) 100vw, 400px"
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  priority
                />
              </div>

              {/* Poster Frame Border Highlight */}
              <div className="absolute inset-0 border border-white/5 pointer-events-none z-20" />
            </div>
          </div>

          {/* Right Column: Biography in Chrome Frame */}
          <div ref={frameRef} className="lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="select-none">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
                {a1Content.director.sectionNum}
              </span>
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
                {a1Content.director.title}
              </h2>
            </div>

            {/* Chrome Frame Biography Block */}
            <div className="relative p-8 md:p-10 border-2 border-chrome/20 bg-deep-black/40 rounded-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden">
              {/* Corner brackets simulating engineering blueprints */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-chrome/40" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-chrome/40" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-chrome/40" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-chrome/40" />

              {/* Glossy light streak line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-chrome/25 to-transparent" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-extrabold tracking-wider text-white">
                    {a1Content.director.name}
                  </h3>
                  <span className="text-xs font-bold tracking-widest text-racing-red uppercase block mt-1">
                    {a1Content.director.role}
                  </span>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-chrome/10 via-chrome/20 to-chrome/10" />

                <div className="space-y-4 text-sm md:text-base text-titanium leading-relaxed font-light tracking-wide">
                  {a1Content.director.biography.map((p, idx) => (
                    <p key={idx}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
