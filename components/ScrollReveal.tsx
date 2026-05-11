"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
};

export default function ScrollReveal({
  children,
  direction = "right",
  delay = 0,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const hiddenDirectionClass = {
    left: "-translate-x-24",
    right: "translate-x-24",
    up: "translate-y-16",
  }[direction];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${hiddenDirectionClass} opacity-0`
      } ${className}`}
    >
      {children}
    </div>
  );
}