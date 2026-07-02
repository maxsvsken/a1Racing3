"use client";

import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-black border-t border-chrome/10 py-12 relative overflow-hidden select-none">
      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-racing-red/60 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="relative h-10 w-24">
              <Image
                src="/images/logo.webp"
                alt="Логотип А1"
                fill
                className="object-contain filter brightness-105"
              />
            </div>
            <p className="text-[10px] text-titanium font-light tracking-wide text-center md:text-left">
              &copy; {currentYear} А1. Все права защищены.
            </p>
          </div>

          {/* Nav links and motorsport signature */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="flex space-x-6 text-xs text-titanium font-semibold tracking-widest uppercase">
              <a href="#hero" className="hover:text-racing-red transition-colors duration-300">Главная</a>
              <a href="#about" className="hover:text-racing-red transition-colors duration-300">Кто мы</a>
              <a href="#contact" className="hover:text-racing-red transition-colors duration-300">Контакты</a>
            </div>
            <span className="text-[9px] font-mono text-chrome/30 tracking-widest uppercase">
              A1-Racing Concept Version 3.5
            </span>
          </div>
        </div>

        {/* Investment Disclaimer (Essential for premium financial services) */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[9px] md:text-[10px] text-titanium/55 leading-relaxed font-light text-center md:text-justify max-w-7xl">
            Предупреждение об инвестиционных рисках: Инвестиции в специальные ситуации и реструктуризацию активов сопряжены с повышенным уровнем риска. Прошлые результаты инвестиционной деятельности компании А1 не гарантируют аналогичную доходность в будущем. Любая информация, представленная на данном сайте, носит справочный характер и не является индивидуальной инвестиционной рекомендацией или офертой в соответствии с законодательством Российской Федерации.
          </p>
        </div>
      </div>
    </footer>
  );
}
