"use client";

import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 500);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <a
      href="#top"
      aria-label="Nach oben"
      className={`fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 rounded-md border border-black/10 bg-[#d7d5ce] px-4 py-3 text-xs font-black uppercase tracking-[0.22em] text-[#111217] shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee] ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span>↑</span>
      <span className="hidden sm:inline">Top</span>
    </a>
  );
}