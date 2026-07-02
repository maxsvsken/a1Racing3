"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function InvestorsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gaugeContainerRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP, ScrollTrigger);

  useGSAP(
    () => {
      // Background image scale/fade
      gsap.from(".bg-image-wrapper", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
        scale: 1.1,
        opacity: 0.1,
        ease: "none",
      });

      // Gauge needle and stroke animation
      const gauges = gsap.utils.toArray<HTMLElement>(".gauge-fill");
      const counters = gsap.utils.toArray<HTMLElement>(".gauge-counter");

      gauges.forEach((gauge) => {
        const val = gauge.getAttribute("data-value") || "100";
        gsap.fromTo(
          gauge,
          { strokeDashoffset: 251.2 }, // 2 * PI * r (r=40)
          {
            strokeDashoffset: 251.2 - (251.2 * parseFloat(val)) / 100,
            duration: 2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: gaugeContainerRef.current,
              start: "top 80%",
            },
          }
        );
      });

      // Counters animation from 0 to value
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute("data-target") || "0");
        const isPercent = counter.getAttribute("data-percent") === "true";
        const obj = { value: 0 };
        
        gsap.to(obj, {
          value: target,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gaugeContainerRef.current,
            start: "top 80%",
          },
          onUpdate: () => {
            counter.innerText = Math.floor(obj.value) + (isPercent ? "%" : "");
          },
        });
      });

      // Grid items reveal
      gsap.from(".investor-item", {
        scrollTrigger: {
          trigger: gaugeContainerRef.current,
          start: "top 75%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="investors"
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden border-t border-chrome/5"
    >
      {/* Background Dashboard Render Image */}
      <div className="bg-image-wrapper absolute inset-0 w-full h-full opacity-20 pointer-events-none select-none">
        <Image
          src="/images/Racing/chrome_investors.png"
          alt="Dashboard render"
          fill
          sizes="100vw"
          className="object-cover object-center filter grayscale contrast-125 brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-transparent to-deep-black" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-16 select-none">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
            {a1Content.investors.sectionNum}
          </span>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
            {a1Content.investors.title}
          </h2>
          <p className="text-sm md:text-base text-titanium mt-4 font-light tracking-wide max-w-2xl border-l border-racing-red pl-4">
            {a1Content.investors.subtitle}
          </p>
        </div>

        {/* Dashboard Gauges (Motorsport Aesthetics) */}
        <div 
          ref={gaugeContainerRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 pt-4"
        >
          {/* Gauge 1: 70+ Professionals */}
          <div className="flex flex-col items-center justify-center p-6 border border-chrome/10 bg-deep-black/60 backdrop-blur-sm rounded-sm relative overflow-hidden group">
            {/* Top metallic indicator light */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red/60 to-transparent" />
            
            {/* SVG Speedometer Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                {/* Track */}
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="stroke-chrome/5 fill-transparent"
                  strokeWidth="6"
                />
                {/* Gauge fill */}
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="gauge-fill stroke-racing-red fill-transparent transition-all duration-100"
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  data-value="85"
                />
              </svg>
              {/* Central counter */}
              <div 
                className="gauge-counter absolute text-2xl font-black text-white tracking-tighter font-display"
                data-target="70"
                data-percent="false"
              >
                0
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-titanium mt-4 text-center group-hover:text-white transition-colors duration-300">
              Спец-профессионалов
            </span>
          </div>

          {/* Gauge 2: 100% Commitment */}
          <div className="flex flex-col items-center justify-center p-6 border border-chrome/10 bg-deep-black/60 backdrop-blur-sm rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red/60 to-transparent" />
            
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="stroke-chrome/5 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="gauge-fill stroke-white fill-transparent transition-all duration-100"
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  data-value="100"
                />
              </svg>
              <div 
                className="gauge-counter absolute text-2xl font-black text-white tracking-tighter font-display"
                data-target="100"
                data-percent="true"
              >
                0%
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-titanium mt-4 text-center group-hover:text-white transition-colors duration-300">
              Защита капитала
            </span>
          </div>

          {/* Gauge 3: 30+ Years Experience */}
          <div className="flex flex-col items-center justify-center p-6 border border-chrome/10 bg-deep-black/60 backdrop-blur-sm rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red/60 to-transparent" />
            
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="stroke-chrome/5 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="gauge-fill stroke-racing-red fill-transparent transition-all duration-100"
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  data-value="75"
                />
              </svg>
              <div 
                className="gauge-counter absolute text-2xl font-black text-white tracking-tighter font-display"
                data-target="30"
                data-percent="false"
              >
                0
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-titanium mt-4 text-center group-hover:text-white transition-colors duration-300">
              Лет успешных кейсов
            </span>
          </div>

          {/* Gauge 4: 90% M&A Success */}
          <div className="flex flex-col items-center justify-center p-6 border border-chrome/10 bg-deep-black/60 backdrop-blur-sm rounded-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-racing-red/60 to-transparent" />
            
            <div className="relative w-28 h-28 flex items-center justify-center select-none">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="stroke-chrome/5 fill-transparent"
                  strokeWidth="6"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="40"
                  className="gauge-fill stroke-white fill-transparent transition-all duration-100"
                  strokeWidth="6"
                  strokeDasharray="251.2"
                  strokeDashoffset="251.2"
                  data-value="90"
                />
              </svg>
              <div 
                className="gauge-counter absolute text-2xl font-black text-white tracking-tighter font-display"
                data-target="90"
                data-percent="true"
              >
                0%
              </div>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-titanium mt-4 text-center group-hover:text-white transition-colors duration-300">
              Медиация споров
            </span>
          </div>
        </div>

        {/* Dashboard Grid Lines (Metallic dividers) */}
        <div className="h-[1px] w-full bg-gradient-to-r from-chrome/5 via-chrome/20 to-chrome/5 mb-16" />

        {/* Grid Description of 4 core investor points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {a1Content.investors.items.map((item) => (
            <div
              key={item.id}
              className="investor-item flex items-start space-x-6 p-4 border border-chrome/5 bg-[#080808]/85 hover:border-chrome/15 transition-all duration-300 rounded-sm"
            >
              {/* Number and light line indicator */}
              <div className="flex flex-col items-center">
                <span className="text-sm font-black tracking-tighter text-racing-red font-display">{item.id}</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-racing-red via-chrome/20 to-transparent mt-2" />
              </div>

              {/* Text content */}
              <div>
                <h3 className="text-base md:text-lg font-bold uppercase tracking-wider text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-titanium leading-relaxed font-light tracking-wide">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
