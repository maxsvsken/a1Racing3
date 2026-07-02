"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function ExpertiseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Cards reveal from side
      const cards = gsap.utils.toArray<HTMLElement>(".expertise-card");
      
      gsap.from(cards, {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
      });

      // Hover tilt effect (mouse interactions)
      cards.forEach((card) => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

          gsap.to(card, {
            rotateY: relX * 6,
            rotateX: -relY * 6,
            transformPerspective: 600,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="today"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-t border-chrome/5"
    >
      {/* Background decoration */}
      <div className="absolute left-1/4 top-1/3 w-[300px] h-[300px] bg-racing-red/2 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute right-[5%] top-1/2 w-64 h-64 bg-white/2 rounded-full blur-[80px] pointer-events-none" />

      {/* Speed Lines Speedometer-style details */}
      <div className="absolute top-0 right-[15%] w-[1px] h-full bg-gradient-to-b from-chrome/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 select-none">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
            {a1Content.expertise.sectionNum}
          </span>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
            {a1Content.expertise.title}
          </h2>
          <div className="h-[1px] w-32 bg-racing-red mt-6 shadow-[0_0_8px_#FF1A1A]" />
        </div>

        {/* Сетка карточек экспертизы */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        >
          {a1Content.expertise.services.map((service, index) => {
            const isFullWidth = index === 3 || index === 4; // Make the last two cards fit nicely if layout is 3x2
            
            return (
              <div
                key={service.id}
                className={`expertise-card glass-panel glass-panel-hover flex flex-col justify-between p-8 rounded-sm border border-chrome/15 cursor-pointer relative overflow-hidden transition-shadow duration-300 min-h-[320px] ${
                  isFullWidth ? "lg:col-span-1" : "" // Standart grid layout
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Glossy top highlight border */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-chrome/30 to-transparent" />
                <div className="absolute bottom-0 right-0 w-16 h-[2px] bg-racing-red/40" />

                {/* Card Header (Icon and Index) */}
                <div className="flex justify-between items-start">
                  <div className="relative h-12 w-12 flex items-center justify-center border border-chrome/15 bg-white/5 rounded-sm p-2.5 transition-transform duration-300 group-hover:scale-110 group-hover:border-racing-red/50">
                    {/* SVG Icon */}
                    <div className="relative h-full w-full filter invert brightness-200">
                      <Image
                        src={service.icon}
                        alt=""
                        fill
                        className="object-contain transition-all duration-300 transform group-hover:rotate-12"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-titanium">
                    SYS-MOD: 0{index + 1}
                  </span>
                </div>

                {/* Card Body & Title */}
                <div className="mt-16 space-y-4">
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-wider text-white leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-sm text-titanium leading-relaxed font-light tracking-wide">
                    {service.description}
                  </p>
                </div>

                {/* Corner detail dots (Simulating supercar electronics dashboard modules) */}
                <div className="absolute bottom-3 left-3 flex space-x-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-chrome/20" />
                  <div className="h-1.5 w-1.5 rounded-full bg-chrome/20" />
                  <div className="h-1.5 w-1.5 rounded-full bg-racing-red/40" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
