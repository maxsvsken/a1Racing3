"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { a1Content } from "@/data/content";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  gsap.registerPlugin(useGSAP);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    
    // Simulate API request send
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", phone: "", company: "", message: "" });
      
      // Auto reset success status
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  useGSAP(() => {
    // Reveal contacts on scroll
    gsap.from(formRef.current, {
      scrollTrigger: {
        trigger: formRef.current,
        start: "top 85%",
      },
      opacity: 0,
      x: -40,
      duration: 1,
      ease: "power3.out",
    });

    gsap.from(infoRef.current?.children || [], {
      scrollTrigger: {
        trigger: infoRef.current,
        start: "top 85%",
      },
      opacity: 0,
      x: 40,
      stagger: 0.1,
      duration: 1,
      ease: "power3.out",
    });
  }, { scope: formRef });

  return (
    <section
      id="contact"
      className="relative py-24 md:py-32 bg-deep-black overflow-hidden border-t border-chrome/5"
    >
      {/* Background Glow */}
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-racing-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute left-[5%] bottom-[5%] w-72 h-72 bg-white/2 rounded-full blur-[90px] pointer-events-none" />

      {/* Decorative metal border indicator */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-chrome/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="mb-8 select-none">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
                СВЯЗАТЬСЯ С НАМИ
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
                Оставить запрос
              </h2>
              <p className="text-xs text-titanium mt-2 tracking-wider">
                Оставьте контактные данные, и инвестиционный комитет А1 рассмотрит ваше обращение.
              </p>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6 bg-[#080808]/90 border border-chrome/10 p-8 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-chrome/30" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-chrome/30" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-bold tracking-widest uppercase text-titanium">
                    Имя / Представитель
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-deep-black border border-chrome/20 rounded-sm px-4 py-3.5 text-sm text-white placeholder-titanium/50 focus:border-racing-red focus:ring-1 focus:ring-racing-red/50 transition-all duration-300 outline-none"
                    placeholder="Александр"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-bold tracking-widest uppercase text-titanium">
                    Телефон связи
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-deep-black border border-chrome/20 rounded-sm px-4 py-3.5 text-sm text-white placeholder-titanium/50 focus:border-racing-red focus:ring-1 focus:ring-racing-red/50 transition-all duration-300 outline-none"
                    placeholder="+7 (999) 000-00-00"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label htmlFor="company" className="text-[10px] font-bold tracking-widest uppercase text-titanium">
                  Компания / Актив
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full bg-deep-black border border-chrome/20 rounded-sm px-4 py-3.5 text-sm text-white placeholder-titanium/50 focus:border-racing-red focus:ring-1 focus:ring-racing-red/50 transition-all duration-300 outline-none"
                  placeholder="Название компании"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] font-bold tracking-widest uppercase text-titanium">
                  Суть обращения / Описание ситуации
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-deep-black border border-chrome/20 rounded-sm px-4 py-3.5 text-sm text-white placeholder-titanium/50 focus:border-racing-red focus:ring-1 focus:ring-racing-red/50 transition-all duration-300 outline-none resize-none"
                  placeholder="Опишите текущий корпоративный спор, состояние активов или детали инвестиционного проекта..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "sending" || status === "success"}
                className="chrome-sweep w-full flex items-center justify-center py-4 bg-racing-red hover:bg-electric-crimson text-white text-xs font-bold uppercase tracking-[0.25em] rounded-sm transition-all duration-300 shadow-[0_4px_20px_rgba(255,26,26,0.2)] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none cursor-pointer"
              >
                {status === "idle" && (
                  <>
                    <span>Отправить запрос</span>
                    <Send className="ml-2 h-3.5 w-3.5" />
                  </>
                )}
                {status === "sending" && <span>Отправка данных...</span>}
                {status === "success" && <span className="text-green-400">Успешно отправлено</span>}
              </button>
            </form>
          </div>

          {/* Right Column: Contact info */}
          <div ref={infoRef} className="lg:col-span-5 space-y-12">
            <div className="select-none">
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-racing-red">
                {a1Content.contacts.title}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mt-3 font-display">
                Офис А1
              </h2>
            </div>

            <div className="space-y-6">
              {/* Phone item */}
              <a
                href={`tel:${a1Content.contacts.phone.replace(/[^+\d]/g, "")}`}
                className="flex items-center space-x-6 p-4 border border-chrome/5 bg-[#080808] hover:border-racing-red/40 hover:bg-[#0D0D0D] transition-all duration-300 rounded-sm group"
              >
                <div className="h-10 w-10 flex items-center justify-center border border-chrome/10 bg-white/5 group-hover:border-racing-red/50 rounded-full transition-colors duration-300">
                  <Phone className="h-4 w-4 text-titanium group-hover:text-racing-red transition-colors duration-300" />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-titanium uppercase block">Телефон</span>
                  <span className="text-sm font-semibold text-white group-hover:text-racing-red transition-colors duration-300 font-display">
                    {a1Content.contacts.phone}
                  </span>
                </div>
              </a>

              {/* Email item */}
              <a
                href={`mailto:${a1Content.contacts.email}`}
                className="flex items-center space-x-6 p-4 border border-chrome/5 bg-[#080808] hover:border-racing-red/40 hover:bg-[#0D0D0D] transition-all duration-300 rounded-sm group"
              >
                <div className="h-10 w-10 flex items-center justify-center border border-chrome/10 bg-white/5 group-hover:border-racing-red/50 rounded-full transition-colors duration-300">
                  <Mail className="h-4 w-4 text-titanium group-hover:text-racing-red transition-colors duration-300" />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-titanium uppercase block">Email</span>
                  <span className="text-sm font-semibold text-white group-hover:text-racing-red transition-colors duration-300">
                    {a1Content.contacts.email}
                  </span>
                </div>
              </a>

              {/* Address item */}
              <div
                className="flex items-start space-x-6 p-4 border border-chrome/5 bg-[#080808] hover:border-chrome/15 transition-all duration-300 rounded-sm group"
              >
                <div className="h-10 w-10 flex items-center justify-center border border-chrome/10 bg-white/5 rounded-full mt-1">
                  <MapPin className="h-4 w-4 text-titanium" />
                </div>
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-titanium uppercase block">Адрес офиса</span>
                  <p className="text-xs md:text-sm text-chrome/90 leading-relaxed font-light mt-0.5">
                    {a1Content.contacts.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Media logos panel */}
            <div className="pt-6">
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-titanium block mb-6 select-none text-center lg:text-left">
                А1 в ведущих деловых СМИ
              </span>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 bg-[#080808] p-6 rounded-sm border border-chrome/5 shadow-inner">
                {a1Content.contacts.mediaLogos.map((logo) => (
                  <div
                    key={logo.name}
                    className="relative h-6 w-24 grayscale opacity-45 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
                  >
                    <Image
                      src={logo.path}
                      alt={logo.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
