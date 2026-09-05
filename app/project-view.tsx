"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "./project-data";
import SiteHeader from "./site-header";

const GALLERY_PREVIEW_COUNT = 8;

export default function ProjectView({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".case-hero__kicker, .case-hero h1, .case-hero__facts", {
        y: 50, opacity: 0, duration: 1, stagger: .08, ease: "power4.out",
      });
      gsap.from(".case-hero__image", { clipPath: "inset(0 0 100% 0)", scale: 1.08, duration: 1.4, ease: "power4.inOut" });
      gsap.utils.toArray<HTMLElement>("[data-case-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 64, opacity: 0, duration: .95, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 90%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="case-page" ref={root}>
      <SiteHeader />
      <main>
        <section className="case-hero">
          <div className="page-shell case-hero__copy">
            <div className="case-hero__kicker">ОБЪЕКТ {project.index} / {project.kind}</div>
            <h1>{project.title}</h1>
            <div className="case-hero__facts">
              <div><small>Дизайн</small><strong>{project.designer ? `студия «${project.designer}»` : "уточняется"}</strong></div>
              <div><small>Площадь</small><strong>{project.area}</strong></div>
              <div><small>Стоимость работ</small><strong>{project.price}</strong></div>
              <div><small>Срок</small><strong>{project.duration}</strong></div>
              {project.location && <div><small>Локация</small><strong>{project.location}</strong></div>}
            </div>
          </div>
          <img className="case-hero__image" src={project.cover} alt={project.title} />
        </section>

        {project.description && (
          <section className="case-story page-shell" data-case-reveal>
            <p className="section-index">ОБ ОБЪЕКТЕ</p>
            <div className="case-story__row">
              <img className="case-story__mascot" src="/brand/mascot_bust.png" alt="Вася — прораб VS" />
              <p className="case-story__bubble">{project.description}</p>
            </div>
          </section>
        )}

        <section className="case-gallery page-shell">
          {(showAllPhotos ? project.images : project.images.slice(0, GALLERY_PREVIEW_COUNT)).map((src, index) => (
            <figure key={src} className={index % 5 === 0 ? "case-gallery__wide" : ""} data-case-reveal>
              <div><img src={src} alt={`${project.title} — фото ${index + 1}`} loading="lazy" /></div>
            </figure>
          ))}
          {!showAllPhotos && project.images.length > GALLERY_PREVIEW_COUNT && (
            <button
              type="button"
              className="case-gallery__more"
              onClick={() => setShowAllPhotos(true)}
            >
              Показать ещё {project.images.length - GALLERY_PREVIEW_COUNT} фото
            </button>
          )}
        </section>

        <section className="case-next">
          <div className="page-shell" data-case-reveal>
            <p className="section-index">СЛЕДУЮЩИЙ ШАГ</p>
            <h2>Теперь —<br /><em>ваш объект.</em></h2>
            <Link className="button button--solid" href="/#contact"><span>Рассчитать смету</span><i>→</i></Link>
          </div>
        </section>
      </main>
      <footer>
        <div className="page-shell footer-grid">
          <div className="footer-brand">
            <img src="/brand/mascot_head.png" alt="" aria-hidden="true" />
            VS
          </div>
          <p>Санкт-Петербург<br />и Ленинградская область</p>
          <Link href="/#projects">← Все объекты</Link>
          <div><Link href="/">Главная</Link><small>© 2026</small></div>
        </div>
      </footer>
    </div>
  );
}
