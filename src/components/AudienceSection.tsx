"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function AudienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Horizontal Speed Lines animation on scroll
      gsap.to(".speed-line-1", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
        x: "150px",
        ease: "none",
      });

      gsap.to(".speed-line-2", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
        x: "-200px",
        ease: "none",
      });

      gsap.to(".speed-line-3", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
        x: "300px",
        ease: "none",
      });

      // Cards reveal animation
      const cards = gsap.utils.toArray<HTMLElement>(".audience-card");
      gsap.from(cards, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="audience"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-t border-chrome/5"
    >
      {/* Background horizontal speed lines (racing poster style) */}
      <div className="speed-line-1 absolute top-[20%] left-[-10%] w-[120%] h-[1px] bg-gradient-to-r from-transparent via-racing-red/20 to-transparent pointer-events-none" />
      <div className="speed-line-2 absolute top-[50%] right-[-10%] w-[120%] h-[2px] bg-gradient-to-r from-transparent via-chrome/10 to-transparent pointer-events-none" />
      <div className="speed-line-3 absolute top-[80%] left-[-20%] w-[130%] h-[1px] bg-gradient-to-r from-transparent via-racing-red/35 to-transparent pointer-events-none" />
      
      {/* Subtle vertical speed trails */}
      <div className="absolute right-[8%] top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-chrome/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 select-none text-center lg:text-left">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
            {a1Content.audience.sectionNum}
          </span>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
            {a1Content.audience.title}
          </h2>
          <p className="text-sm text-titanium mt-4 font-light tracking-wide max-w-xl mx-auto lg:mx-0">
            Капитал зарабатывает с А1 в самых критических корпоративных ситуациях. Мы обеспечиваем точный результат.
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        >
          {a1Content.audience.segments.map((segment, index) => (
            <div
              key={segment.title}
              className="audience-card glass-panel glass-panel-hover flex flex-col justify-between p-8 rounded-sm border border-chrome/15 cursor-pointer relative overflow-hidden group min-h-[300px]"
            >
              {/* Dynamic Chrome Highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Top border chrome lines */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-chrome/20 to-transparent" />
              <div className="absolute left-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-chrome/10 to-transparent" />

              {/* Card Header */}
              <div className="flex justify-between items-center mb-6 select-none">
                <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white group-hover:text-racing-red transition-colors duration-300">
                  {segment.title}
                </h3>
                <span className="text-[10px] font-mono text-chrome/30 group-hover:text-racing-red/50 transition-colors duration-300">
                  REF-[0{index + 1}]
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-6 flex-grow flex flex-col justify-between mt-4">
                {/* Situation block */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-titanium">
                    Ситуация
                  </span>
                  <p className="text-sm text-chrome/80 leading-relaxed font-light">
                    {segment.situation}
                  </p>
                </div>

                {/* Divider line */}
                <div className="w-full h-[1px] bg-white/5" />

                {/* Role block */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-racing-red">
                    Роль А1
                  </span>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {segment.role}
                  </p>
                </div>
              </div>

              {/* Bottom design elements */}
              <div className="absolute bottom-2 right-2 flex space-x-1 opacity-20 group-hover:opacity-75 transition-opacity duration-300">
                <div className="w-4 h-[1px] bg-white" />
                <div className="w-1.5 h-[1px] bg-racing-red" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
