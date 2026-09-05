"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SiteHeader from "./site-header";
import { projects } from "./project-data";

/* ------------------------------------------------------------------ *
 * Content
 * ------------------------------------------------------------------ */

// TODO: цифры уточняются у Василия — держим в одном месте, чтобы правились быстро.
const STATS = [
  { icon: "brick", value: "9+", label: "Лет опыта", note: "Работаем с 2017 года" },
  { icon: "mascot", value: "220+", label: "Сданных объектов", note: "Квартиры, дома и КП" },
  { icon: "hammer", value: "22", label: "Специалиста", note: "Своя бригада, без субподряда" },
  { icon: "shield", value: "5", label: "Лет гарантии", note: "Официальная гарантия на работы" },
  { icon: "lock", value: "", label: "Под ключ", note: "Берём на себя все этапы от проекта до сдачи" },
] as const;

/* Пиксельные иконки метрик — тот же приём crispEdges, что у остальной
   растровой графики бренда. Голова прораба — существующий mascot_head.png,
   не отдельная SVG, чтобы не плодить второй стиль отрисовки лица. */
function StatIcon({ type }: { type: string }) {
  if (type === "mascot") {
    return <img className="stat__icon-img" src="/brand/mascot_head.png" alt="" aria-hidden="true" />;
  }
  if (type === "hammer") {
    return <img className="stat__icon-img" src="/brand/hammer.png" alt="" aria-hidden="true" />;
  }
  const common = { className: "pixel-icon", viewBox: "0 0 16 16", "aria-hidden": true } as const;
  if (type === "brick") {
    return (
      <svg {...common}>
        <rect x="0" y="1" width="7" height="5" fill="var(--brick)" />
        <rect x="8" y="1" width="8" height="5" fill="var(--brick)" />
        <rect x="-1" y="8" width="5" height="5" fill="var(--brick)" />
        <rect x="5" y="8" width="7" height="5" fill="var(--brick)" />
        <rect x="13" y="8" width="4" height="5" fill="var(--brick)" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg {...common}>
        <path d="M8 1 L14 3 L14 8 C14 12 11 14 8 15 C5 14 2 12 2 8 L2 3 Z" fill="var(--brick-bright)" />
        <path d="M5 8 L7 10.5 L11.5 5.5" fill="none" stroke="var(--milk)" strokeWidth="1.8" strokeLinecap="square" />
      </svg>
    );
  }
  if (type === "lock") {
    return (
      <svg {...common}>
        <path d="M5 6 L5 4 C5 2 6.5 1 8 1 C9.5 1 11 2 11 4 L11 6" fill="none" stroke="var(--milk)" strokeWidth="1.8" />
        <rect x="3" y="6" width="10" height="9" rx="1" fill="var(--helmet)" />
        <rect x="7" y="9" width="2" height="4" fill="var(--coal)" />
      </svg>
    );
  }
  return null;
}

// Одно направление — отделочные работы. Без деления на дома / коммерцию / ремонт.
const stages = [
  ["01", "Замер и смета", "Выезжаем на объект, считаем объёмы и фиксируем стоимость работ."],
  ["02", "Черновые работы", "Демонтаж, стяжка, штукатурка, инженерия — всё по проекту дизайнера."],
  ["03", "Чистовая отделка", "Плитка, столярка, покраска, свет. Работаем по дизайн-проекту без отступлений."],
  ["04", "Сдача объекта", "Проверяем каждый узел, закрываем замечания и передаём документы."],
];

const reviews = [
  {
    name: "Алексей М.",
    role: "Дом, Ленинградская область",
    rating: 5,
    avatar: "/brand/avatar_alexey.png",
    text: "Обратились в VS за полной отделкой дома – от стяжки до установки мебели. Работы продолжались восемь месяцев, и за всё это время мы ни разу не услышали привычного: «Это не к нам» или «Этим должны заниматься другие». Ребята действительно взяли на себя весь объект и довели его до конца. Все вопросы решались спокойно, без перекладывания ответственности и бесконечных поисков виноватых. Люди приятные в общении! Когда стройка длится столько месяцев, особенно ценишь именно такой подход. Результатом очень довольны!",
  },
  {
    name: "Ирина К.",
    role: "Клиника, Санкт-Петербург",
    rating: 5,
    avatar: "/brand/avatar_irina.png",
    text: "Главным условием для нас были сроки: открытие клиники уже назначили, поэтому переносить его было нельзя. Команда VS сразу это поняла и организовала работу так, чтобы мы успели вовремя. Инженерные решения согласовывали заранее, благодаря чему ничего не пришлось переделывать в последний момент. Если требовалось, мастера оставались работать по вечерам. В итоге клинику сдали точно в срок, и мы открылись в запланированный день! Отличные ребята, советуем.",
  },
  {
    name: "Дмитрий В.",
    role: "Квартира 125 м²",
    rating: 5,
    avatar: "/brand/avatar_dmitry.png",
    text: "До начала ремонта больше всего переживал за смету. Знаю немало историй, когда сначала называют одну сумму, а к концу работ она вырастает чуть ли не вдвое. Здесь всё оказалось иначе: что согласовали вначале, то и увидел в финальном акте. Все обещания выполнили, стоимость работ не поехала – честно говоря, для ремонта такого масштаба это редкость. Приятно иметь дело с людьми, которые отвечают за свои слова. Смело могу рекомендовать VS.",
  },
];

const PARTNERS = [
  { name: "Лаборатория дизайна", url: "https://vk.ru/disainerinterieraspb" },
  { name: "Кардинал — мебель на заказ", url: "https://kardinal-spb.ru/" },
  { name: "ПАНДА-ПАНДА", url: "https://vk.ru/panda_banda_spb" },
  { name: "Студия дизайна интерьера", url: "https://share.google/YsgZlb5JJwKjq8q05" },
  { name: "Артель 47", url: "https://артель47.рф/" },
];

/* ------------------------------------------------------------------ *
 * Loader — brand reveal: the "VS" wordmark wipes in
 * ------------------------------------------------------------------ */

function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fallback = window.setTimeout(onDone, 2200);
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Reduced motion still gets the brand, just without movement.
      if (reduced) {
        gsap.set(".loader__wordmark", { clipPath: "inset(0 0% 0 0)" });
        gsap.to(root.current, { opacity: 0, duration: .18, delay: .5, onComplete: onDone });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => { window.clearTimeout(fallback); onDone(); },
      });

      // The wordmark wipes in like a course of brick going down — one move,
      // not five stages. clip-path stays on the compositor.
      tl.fromTo(".loader__wordmark",
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: .44 }, 0)
        .fromTo(".loader__mark",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: .34 }, .1)
        .fromTo(".loader__label",
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: .26 }, .2)
        .fromTo(".loader__line i",
          { scaleX: 0 },
          { scaleX: 1, duration: .52, ease: "none" }, .12)
        // Curtain up. Pushed later than the entrance finishes so the label
        // actually gets read, not just flashed — it used to have .28s of
        // full visibility before the wipe started.
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: .38, ease: "power4.inOut" }, .95);
    }, root);

    return () => { window.clearTimeout(fallback); ctx.revert(); };
  }, [onDone]);

  return (
    <div className="loader" ref={root} role="status" aria-label="Загрузка">
      <div className="loader__noise" aria-hidden="true" />
      <div className="loader__stage">
        <div className="loader__scene">
          <img className="loader__mark" src="/brand/mascot_head.png" alt="" aria-hidden="true" />
          <div className="loader__wordmark" aria-label="VS">VS</div>
        </div>
        <p className="loader__label">ОТДЕЛОЧНЫЕ РАБОТЫ ПОД КЛЮЧ</p>
        <div className="loader__line" aria-hidden="true"><i /></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page
 * ------------------------------------------------------------------ */

export default function VasyaSite() {
  const root = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const finishLoading = useCallback(() => setLoading(false), []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(".hero-kicker, .hero-title span, .hero-actions", {
        y: 44, opacity: 0, duration: 1, stagger: .09, ease: "power4.out",
      });
      gsap.from(".stat-strip > *", { y: 24, opacity: 0, duration: .7, stagger: .07, delay: .5, ease: "power3.out" });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 64, opacity: 0, duration: .95, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>(".project-card__media img").forEach((image) => {
        gsap.fromTo(image, { yPercent: -5, scale: 1.08 }, {
          yPercent: 5, scale: 1.02, ease: "none",
          scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      gsap.to(".process-progress i", {
        scaleY: 1, ease: "none",
        scrollTrigger: { trigger: ".process-list", start: "top 72%", end: "bottom 45%", scrub: .5 },
      });
    }, root);

    return () => ctx.revert();
  }, [loading]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div ref={root} className={loading ? "is-loading" : "is-ready"}>
      {loading && <Loader onDone={finishLoading} />}
      <SiteHeader />
      <main>
        <section className="hero" id="top">
          <img className="hero__bg" src="/images/hero-cover.jpg" alt="" aria-hidden="true" />
          <div className="hero__scrim" aria-hidden="true" />
          <div className="page-shell hero-inner">
            <div className="hero-content">
              <div className="hero-kicker">VS — отделочные работы под ключ</div>
              <h1 className="hero-title">
                <span>Отделка</span><span>под ключ.</span>
              </h1>
              <div className="hero-actions">
                <Link className="button button--solid" href="#projects"><span>Смотреть объекты</span><i>→</i></Link>
                <Link className="text-link" href="#contact">Рассчитать смету <i>↗</i></Link>
              </div>
            </div>
          </div>

          <div className="page-shell">
            <div className="stat-strip">
              {STATS.map((stat) => (
                <div className="stat" key={stat.label}>
                  <span className="stat__icon"><StatIcon type={stat.icon} /></span>
                  {stat.value ? (
                    <>
                      <strong className="stat__value">{stat.value}</strong>
                      <span className="stat__label">{stat.label}</span>
                    </>
                  ) : (
                    <strong className="stat__value stat__value--word">{stat.label}</strong>
                  )}
                  <small>{stat.note}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about" id="about">
          <div className="page-shell about-grid">
            <div className="about-figure" data-reveal>
              <img className="about-mascot" src="/brand/mascot_front_a.png" alt="Вася — прораб VS" />
              <span className="pixel-tag">ПРОРАБ / ВАСЯ</span>
            </div>
            <div className="about-copy">
              <p className="section-index" data-reveal>01 / О НАС</p>
              <h2 data-reveal>Здесь выбирают не просто отделку:<br /><em>вы платите за уверенность в результате на годы вперёд.</em></h2>
              <p data-reveal>
                Компания VS была создана семь лет назад и специализируется на отделке под ключ.
                Мы работаем с квартирами, частными домами и коммерческими помещениями
                в Санкт-Петербурге и Ленинградской области.
              </p>
              <p data-reveal>
                За годы работы наша команда накопила опыт реализации проектов разной сложности —
                от новостроек до объектов в старом фонде. Мы заранее продумываем последовательность
                работ, учитываем технические особенности помещения и быстро решаем возникающие вопросы.
              </p>
              <p data-reveal>
                Одно из наших главных преимуществ — соблюдение согласованных сроков: мы планируем
                каждый этап и сдаём объекты без просрочек. Работать с нами можно дистанционно —
                заказчик получает фото- и видеоотчёты, документы и всю необходимую информацию
                о ходе ремонта.
              </p>
              <ul className="about-list" data-reveal>
                <li><span>01</span>Фиксированная смета — без дополнительных счетов по ходу работ</li>
                <li><span>02</span>Еженедельный отчёт с фотографиями и графиком</li>
                <li><span>03</span>Официальный договор и гарантия 5 лет</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="projects" id="projects">
          <div className="page-shell">
            <div className="section-head section-head--light" data-reveal>
              <p className="section-index">02 / ОБЪЕКТЫ</p>
              <h2>Наши<br /><em>проекты.</em></h2>
              <p>Каждый объект — реальный дизайн-проект, площадь, стоимость работ и срок.</p>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug} data-reveal>
                  <div className="project-card__media">
                    <img src={project.cover} alt={project.title} />
                    <span className="project-card__kind">{project.kind}</span>
                  </div>
                  <div className="project-card__meta">
                    <span>{project.index}</span>
                    {project.designer && <span>{`Дизайн — «${project.designer}»`}</span>}
                  </div>
                  <div className="project-card__title"><h3>{project.title}</h3><i>↗</i></div>
                  <div className="project-card__facts">
                    <span><small>Площадь</small><b>{project.area}</b></span>
                    <span><small>Стоимость</small><b>{project.price}</b></span>
                    <span><small>Срок</small><b>{project.duration}</b></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="process" id="process">
          <div className="page-shell process-grid">
            <div className="process-copy" data-reveal>
              <p className="section-index">03 / КАК МЫ РАБОТАЕМ</p>
              <h2>Ремонт идёт по плану.<br /><em>И вы всегда знаете, по какому.</em></h2>
              <p>Мы заранее определяем этапы и ответственных на стройке, строго держимся согласованных сроков. Вы регулярно получаете отчёт о продвижении отделочных работ в удобном вам формате. Так получается ремонт, который прослужит долгие годы.</p>
            </div>
            <div className="process-list">
              <div className="process-progress"><i /></div>
              {stages.map(([n, title, text]) => (
                <article key={n} data-reveal><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        <section className="reviews" id="reviews">
          <div className="page-shell">
            <div className="section-head section-head--light" data-reveal>
              <p className="section-index">04 / ОТЗЫВЫ</p>
              <h2>Слова тех,<br /><em>кто нам доверился.</em></h2>
              <p>Реальные отзывы и оценки наших клиентов.</p>
            </div>
            <div className="review-list">
              {reviews.map((review) => (
                <figure className="review" key={review.name} data-reveal>
                  <img className="review__avatar" src={review.avatar} alt={review.name} />
                  <div className="review__bubble">
                    <strong className="review__name">{review.name}</strong>
                    <span className="review__stars" aria-label={`Оценка ${review.rating} из 5`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M10 1l2.6 5.8 6.2.6-4.7 4.2 1.4 6.2L10 14.8 4.5 17.8l1.4-6.2L1.2 7.4l6.2-.6z" />
                        </svg>
                      ))}
                    </span>
                    <blockquote>{review.text}</blockquote>
                    <span className="review__role">{review.role}</span>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="page-shell">
            <p className="section-index" data-reveal>05 / СТАРТ ПРОЕКТА</p>
            <div className="contact-grid">
              <div data-reveal>
                <h2>Обсудим<br /><em>ваш проект?</em></h2>
                <p>Пришлите дизайн-проект или планировку — вернёмся со сметой и сроком.</p>
              </div>
              {sent ? (
                <div className="form-success" data-reveal><span>ЗАЯВКА / ПРИНЯТА</span><h3>Спасибо.<br />Вася уже изучает задачу.</h3><button type="button" onClick={() => setSent(false)}>Отправить ещё одну</button></div>
              ) : (
                <form onSubmit={submit} data-reveal>
                  <label><span>Как к вам обращаться</span><input name="name" required placeholder="Имя" /></label>
                  <label><span>Телефон</span><input name="phone" type="tel" required placeholder="+7 900 000-00-00" /></label>
                  <label><span>Площадь объекта</span><input name="area" placeholder="Например, 80 м²" /></label>
                  <button className="button button--dark" type="submit"><span>Отправить заявку</span><i>↗</i></button>
                  <small>Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</small>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="partners">
          <div className="page-shell">
            <p className="section-index">Партнёры</p>
            <ul className="partners-list">
              {PARTNERS.map((partner) => (
                <li key={partner.name}>
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    {partner.name} <i>↗</i>
                  </a>
                </li>
              ))}
            </ul>
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
          <div><a href="tel:+79000000000">+7 (900) 000-00-00</a><a href="mailto:info@vasyastroy.ru">info@vasyastroy.ru</a></div>
          <div><a href="#top">Наверх ↑</a><small>© 2026</small></div>
        </div>
      </footer>
    </div>
  );
}
