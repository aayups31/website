"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useExperienceStore } from "@/lib/experience-store";

const navigation = [
  { label: "Experience", href: "/experience" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "VFX / Photography", href: "/archive" },
  { label: "Résumé", href: "/resume" },
];

export function SiteHeader({ immersive = false }: { immersive?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const soundEnabled = useExperienceStore((state) => state.soundEnabled);
  const motionReduced = useExperienceStore((state) => state.motionReduced);
  const setSoundEnabled = useExperienceStore((state) => state.setSoundEnabled);
  const setMotionReduced = useExperienceStore((state) => state.setMotionReduced);

  const toggleMotion = () => {
    const nextReduced = !motionReduced;
    window.localStorage.setItem("portfolio-motion", nextReduced ? "reduced" : "full");
    document.documentElement.dataset.motion = nextReduced ? "reduced" : "full";
    setMotionReduced(nextReduced);
  };

  useEffect(() => {
    document.documentElement.dataset.menu = menuOpen ? "open" : "closed";
    const pageContent = [
      document.querySelector("main"),
      document.querySelector("footer"),
    ].filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (menuOpen) {
      pageContent.forEach((element) => element.setAttribute("inert", ""));
      window.requestAnimationFrame(() => {
        mobileMenuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      });
    } else {
      pageContent.forEach((element) => element.removeAttribute("inert"));
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!menuOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;

      const links = Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>("a, button") ?? [],
      );
      const focusable = menuButtonRef.current
        ? [menuButtonRef.current, ...links]
        : links;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      pageContent.forEach((element) => element.removeAttribute("inert"));
      delete document.documentElement.dataset.menu;
    };
  }, [menuOpen]);

  return (
    <header className="site-header" data-immersive={immersive || undefined}>
      <Link className="wordmark" href="/" aria-label="Aayu Pratap Singh — home">
        <span className="wordmark__monogram">APS</span>
        <span className="wordmark__name">Aayu Pratap Singh</span>
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link className="nav-contact" href="/contact">
          Contact
        </Link>
      </nav>

      <div className="header-controls">
        {immersive ? (
          <>
            <button
              className="utility-button"
              type="button"
              aria-pressed={motionReduced}
              onClick={toggleMotion}
            >
              Motion {motionReduced ? "reduced" : "full"}
            </button>
            <button
              className="utility-button"
              type="button"
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              Sound {soundEnabled ? "on" : "off"}
            </button>
          </>
        ) : null}
        <button
          ref={menuButtonRef}
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className="menu-button__line" />
        </button>
      </div>

      <nav
        ref={mobileMenuRef}
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__inner">
          <p className="kicker">Navigate</p>
          {navigation.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            <span>06</span>
            Contact
          </Link>
          {immersive ? (
            <div className="mobile-menu__controls" aria-label="Experience settings">
              <button
                className="mobile-utility"
                type="button"
                aria-pressed={motionReduced}
                onClick={toggleMotion}
              >
                Motion {motionReduced ? "reduced" : "full"}
              </button>
              <button
                className="mobile-utility"
                type="button"
                aria-pressed={soundEnabled}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                Sound {soundEnabled ? "on" : "off"}
              </button>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
