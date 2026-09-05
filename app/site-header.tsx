"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  ["01", "Проекты", "/#projects"],
  ["02", "О нас", "/#about"],
  ["03", "Услуги", "/#services"],
  ["04", "Отзывы", "/#reviews"],
  ["05", "Как мы работаем", "/#process"],
  ["06", "Контакты", "/#contact"],
] as const;

export default function SiteHeader({ inverted = false }: { inverted?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${inverted ? "site-header--light" : ""} ${scrolled ? "is-scrolled" : ""}`}>
      <Link className="brand" href="/" aria-label="VS — главная">
        <img className="brand-mark" src="/brand/mascot_head.png" alt="" aria-hidden="true" />
        <span className="brand-word">VS</span>
      </Link>

      <nav className="desktop-nav" aria-label="Основная навигация">
        {NAV.map(([n, label, href]) => (
          <Link key={n} href={href}>{label}</Link>
        ))}
      </nav>

      <Link className="nav-cta" href="/#contact"><span>Обсудить проект</span><i aria-hidden="true">→</i></Link>

      <button
        className="menu-toggle"
        type="button"
        aria-label={open ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span /><span />
      </button>

      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu__index">МЕНЮ / VS</div>
        <nav aria-label="Мобильная навигация">
          {NAV.map(([n, label, href]) => (
            <Link key={n} href={href} onClick={() => setOpen(false)}>
              <small>{n}</small><span>{label}</span><i>↗</i>
            </Link>
          ))}
        </nav>
        <p>Санкт-Петербург и Ленинградская область</p>
      </div>
    </header>
  );
}
