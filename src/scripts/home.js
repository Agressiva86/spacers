import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

document.getElementById("year").textContent = new Date().getFullYear();

      function splitButtonLabel(el) {
        const text = el.textContent.replace(/\s+/g, " ").trim();
        el.textContent = "";
        const frag = document.createDocumentFragment();
        [...text].forEach((ch, i) => {
          const span = document.createElement("span");
          span.style.setProperty("--i", String(i));
          if (ch === " ") {
            span.className = "char-space";
            span.innerHTML = "&nbsp;";
          } else {
            span.className = "char";
            span.textContent = ch;
          }
          frag.appendChild(span);
        });
        el.appendChild(frag);
      }

      document.querySelectorAll("[data-btn-label]").forEach(splitButtonLabel);

      const cookieBanner = document.querySelector("[data-cookie-banner]");
      const COOKIE_KEY = "spacers-cookie-consent";

      if (cookieBanner && !localStorage.getItem(COOKIE_KEY)) {
        cookieBanner.hidden = false;
        cookieBanner.querySelectorAll("[data-cookie-choice]").forEach((btn) => {
          btn.addEventListener("click", () => {
            localStorage.setItem(COOKIE_KEY, btn.getAttribute("data-cookie-choice"));
            cookieBanner.hidden = true;
          });
        });
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
      );

      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

      gsap.registerPlugin(ScrollTrigger);

      const TEXT_REVEAL = {
        blur: 12,
        scale: 1.08,
        duration: 0.8,
        stagger: 0.045,
        ease: "power3.out",
      };

      function blurRevealStagger() {
        return {
          each: TEXT_REVEAL.stagger,
          from: "start",
        };
      }

      function setBlurHidden(units) {
        if (!units.length) return;
        gsap.set(units, {
          autoAlpha: 0,
          scale: TEXT_REVEAL.scale,
          filter: `blur(${TEXT_REVEAL.blur}px)`,
          force3D: true,
        });
      }

      function setBlurVisible(units) {
        if (!units.length) return;
        gsap.set(units, {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          force3D: true,
        });
        clearBlurWillChange(units);
      }

      function clearBlurWillChange(units) {
        if (!units.length) return;
        gsap.set(units, { clearProps: "filter,willChange" });
      }

      function blurRevealTimeline(units, options = {}) {
        const hidden = {
          autoAlpha: 0,
          scale: TEXT_REVEAL.scale,
          filter: `blur(${TEXT_REVEAL.blur}px)`,
        };
        setBlurHidden(units);
        const tl = gsap.timeline({
          paused: true,
          delay: options.delay || 0,
        });
        tl.fromTo(
          units,
          hidden,
          {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: options.duration || TEXT_REVEAL.duration,
            stagger: options.stagger || blurRevealStagger(),
            ease: TEXT_REVEAL.ease,
            immediateRender: false,
            force3D: true,
            onComplete: () => setBlurVisible(units),
          }
        );
        return tl;
      }

      function splitLinesToChars(el, lines) {
        if (!el) return [];
        el.setAttribute("aria-label", lines.join(" "));
        el.textContent = "";
        const chars = [];

        lines.forEach((lineText) => {
          const line = document.createElement("span");
          line.className = "line";
          const words = lineText.split(" ");

          words.forEach((word, wi) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = "word";

            for (const ch of word) {
              const span = document.createElement("span");
              span.className = "char blur-text-unit";
              span.textContent = ch;
              span.setAttribute("aria-hidden", "true");
              wordSpan.appendChild(span);
              chars.push(span);
            }

            line.appendChild(wordSpan);

            if (wi < words.length - 1) {
              const space = document.createElement("span");
              space.className = "char-space";
              space.innerHTML = "&nbsp;";
              space.setAttribute("aria-hidden", "true");
              wordSpan.appendChild(space);
            }
          });

          el.appendChild(line);
        });

        return chars;
      }

      function splitPlainToChars(el) {
        const text = el.textContent.replace(/\s+/g, " ").trim();
        return splitLinesToChars(el, [text]);
      }

      function splitWrapToChars(el, unitClass = "char blur-text-unit") {
        if (!el) return [];
        const text = (el.getAttribute("aria-label") || el.textContent || "")
          .replace(/\s+/g, " ")
          .trim();
        if (!text) return [];
        el.setAttribute("aria-label", text);
        el.textContent = "";
        const chars = [];
        const words = text.split(" ");

        words.forEach((word, wi) => {
          const wordSpan = document.createElement("span");
          wordSpan.className = "word";

          for (const ch of word) {
            const span = document.createElement("span");
            span.className = unitClass;
            span.textContent = ch;
            span.setAttribute("aria-hidden", "true");
            wordSpan.appendChild(span);
            chars.push(span);
          }

          if (wi < words.length - 1) {
            const space = document.createElement("span");
            space.className = "char-space";
            space.innerHTML = "&nbsp;";
            space.setAttribute("aria-hidden", "true");
            wordSpan.appendChild(space);
          }

          el.appendChild(wordSpan);
        });

        return chars;
      }

      const heroTitle = document.querySelector("[data-hero-title]");
      const heroIntro = document.querySelector("[data-hero-intro]");
      let heroTitleTl = null;
      let heroTitleChars = [];

      if (heroTitle) {
        heroTitleChars = splitLinesToChars(heroTitle, [
          "Make space for better",
          "digital experiences.",
        ]);
        if (heroTitleChars.length) {
          heroTitleTl = blurRevealTimeline(heroTitleChars);
        }
      }

      function resetHeroTitleReveal() {
        if (!heroTitleTl || !heroTitleChars.length) return;
        heroTitleTl.pause(0);
        setBlurHidden(heroTitleChars);
      }

      function playHeroTitleReveal() {
        if (!heroTitleTl || !heroTitleChars.length) return;
        if (heroTitleTl.isActive()) return;
        setBlurHidden(heroTitleChars);
        heroTitleTl.restart();
      }

      function isHeroIntroInView() {
        if (!heroIntro) return false;
        const rect = heroIntro.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      }

      function playHeroTitleRevealIfVisible() {
        if (isHeroIntroInView()) playHeroTitleReveal();
      }

      resetHeroTitleReveal();

      const portfolioTitleEls = gsap.utils.toArray("[data-portfolio-title]");

      function bindPortfolioTitleReveal(titleEl, options = {}) {
        const chars = options.lines
          ? splitLinesToChars(titleEl, options.lines)
          : splitPlainToChars(titleEl);
        if (!chars.length) return;

        const tl = blurRevealTimeline(chars, {
          stagger:
            options.stagger || {
              each: TEXT_REVEAL.stagger,
              from: "start",
            },
        });

        function show() {
          setBlurHidden(chars);
          tl.restart();
        }

        function hide() {
          tl.pause(0);
          setBlurHidden(chars);
        }

        function finish() {
          tl.pause();
          setBlurVisible(chars);
        }

        const st = ScrollTrigger.create({
          trigger: options.trigger || titleEl,
          start: options.start || "top 90%",
          end: "bottom top",
          onEnter: show,
          onEnterBack: show,
          onLeave: finish,
          onLeaveBack: hide,
        });

        requestAnimationFrame(() => {
          const probe = options.trigger || titleEl;
          const rect = probe.getBoundingClientRect();
          if (st.isActive || (rect.top < window.innerHeight * 0.92 && rect.bottom > 0)) {
            show();
          } else if (rect.bottom < window.innerHeight * 0.12) {
            finish();
          } else {
            hide();
          }
        });
      }

      const heroShell = document.querySelector(".hero-shell");
      const heroScaleTargets = gsap.utils.toArray("[data-hero-scale]");
      let heroScaleFirst = true;
      // "in" | "out" — prevents double scale-in flicker on scroll-up
      let heroScaleState = "out";

      function playHeroScaleIn(options = {}) {
        const preloading = document.documentElement.classList.contains(
          "is-preloading"
        );
        const exiting = document.documentElement.classList.contains(
          "is-preload-exit"
        );
        if (preloading && !exiting && !options.force) return;
        if (!heroScaleTargets.length) return;
        if (heroScaleState === "in") return;
        heroScaleState = "in";
        const delay = options.overlap ? 0 : heroScaleFirst ? 0.28 : 0;
        heroScaleFirst = false;
        gsap.to(heroScaleTargets, {
          scale: 1,
          duration: options.overlap ? 1.15 : 1.25,
          delay,
          ease: "power3.out",
          overwrite: true,
          transformOrigin: "50% 0%",
          onComplete: playHeroTitleRevealIfVisible,
        });
      }

      function playHeroScaleOut() {
        if (!heroScaleTargets.length) return;
        if (heroScaleState === "out") return;
        heroScaleState = "out";
        resetHeroTitleReveal();
        gsap.to(heroScaleTargets, {
          scale: 0.86,
          duration: 1.05,
          ease: "power3.inOut",
          overwrite: true,
          transformOrigin: "50% 0%",
        });
      }

      if (heroShell && heroScaleTargets.length) {
        gsap.set(heroScaleTargets, {
          scale: 0.86,
          transformOrigin: "50% 0%",
        });

        // Initial entrance only — return from below is handled by the slider trigger
        ScrollTrigger.create({
          trigger: heroShell,
          start: "top bottom",
          once: true,
          onEnter: playHeroScaleIn,
        });
      }

      const heroParallax = document.querySelector("[data-hero-parallax]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (heroShell && heroParallax && !reduceMotion) {
        gsap.fromTo(
          heroParallax,
          { yPercent: 0 },
          {
            yPercent: -16,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: heroShell,
              start: "top top",
              end: "bottom top",
              scrub: 0.7,
            },
          }
        );
      }

      const heroVideo = document.querySelector("[data-hero-video]");
      if (heroVideo) {
        if (reduceMotion) {
          heroVideo.removeAttribute("autoplay");
          heroVideo.preload = "none";
          heroVideo.pause();
        } else {
          const narrow = window.matchMedia("(max-width: 767px)").matches;
          heroVideo.src = narrow ? "/assets/hero-mobile.mp4?v=2" : "/assets/hero.mp4?v=2";
          const playHeroVideo = () => {
            heroVideo.play().catch(() => {});
          };
          if (heroVideo.readyState >= 2) playHeroVideo();
          else heroVideo.addEventListener("canplay", playHeroVideo, { once: true });
          document.addEventListener("visibilitychange", () => {
            if (document.hidden) heroVideo.pause();
            else playHeroVideo();
          });
          if (heroShell) {
            const heroVideoObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) playHeroVideo();
                  else heroVideo.pause();
                });
              },
              { threshold: 0.05 }
            );
            heroVideoObserver.observe(heroShell);
          }
        }
      }

      if (heroIntro && heroTitleTl) {
        ScrollTrigger.create({
          trigger: heroIntro,
          start: "top 92%",
          end: "bottom top",
          onEnterBack: () => {
            if (heroScaleState === "in") playHeroTitleReveal();
          },
          onLeave: resetHeroTitleReveal,
          onLeaveBack: resetHeroTitleReveal,
        });
      }

      const slides = gsap.utils.toArray(".what-slide");
      const counter = document.getElementById("what-counter");
      const progressFill = document.getElementById("what-progress-fill");
      const total = slides.length;

      function pad(n) {
        return String(n).padStart(2, "0");
      }

      const slideCharSets = slides.map((slide) =>
        splitWrapToChars(slide, "char slide-char blur-text-unit")
      );
      let lastSliderActive = -1;
      const sliderLetterEase = gsap.parseEase(TEXT_REVEAL.ease);
      const sliderLetterSpread = Math.max(
        8,
        TEXT_REVEAL.duration / TEXT_REVEAL.stagger
      );

      function paintLetters(chars, reveal) {
        const n = chars.length;
        if (!n) return;

        if (reveal <= 0) {
          gsap.set(chars, {
            autoAlpha: 0,
            scale: TEXT_REVEAL.scale,
            filter: `blur(${TEXT_REVEAL.blur}px)`,
            force3D: true,
          });
          return;
        }

        if (reveal >= 1) {
          gsap.set(chars, {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            force3D: true,
          });
          return;
        }

        const span = n + sliderLetterSpread;
        chars.forEach((ch, i) => {
          const raw = gsap.utils.clamp(
            0,
            1,
            (reveal * span - i) / sliderLetterSpread
          );
          const t = sliderLetterEase(raw);
          gsap.set(ch, {
            autoAlpha: t,
            scale: TEXT_REVEAL.scale + (1 - TEXT_REVEAL.scale) * t,
            filter:
              t >= 0.995
                ? "blur(0px)"
                : `blur(${TEXT_REVEAL.blur * (1 - t)}px)`,
            force3D: true,
          });
        });
      }

      function hideAllSlides() {
        slides.forEach((slide, i) => {
          slide.classList.remove("is-visible");
          paintLetters(slideCharSets[i], 0);
        });
        lastSliderActive = -1;
        setActive(0);
        if (progressFill) {
          gsap.set(progressFill, { scaleX: 0, transformOrigin: "left center" });
        }
      }

      function setActive(activeIndex) {
        counter.textContent = `${pad(activeIndex + 1)} / ${pad(total)}`;
      }

      slideCharSets.forEach((chars) => paintLetters(chars, 0));
      setActive(0);
      gsap.set(progressFill, { scaleX: 0, transformOrigin: "left center" });

      const whatTrack = document.querySelector(".what-track");
      const whatSticky = document.querySelector(".what-sticky");
      const SLIDER_PIN_VH = 2.6;
      const SLIDER_APPROACH_VH = 1;

      let sliderST = null;
      let sliderLetterST = null;

      function sliderOverallProgress() {
        if (!sliderLetterST) return 0;
        const p = sliderLetterST.progress;
        if (p <= 0 && !sliderLetterST.isActive) return 0;
        if (p <= 0) return 0;

        const approachRatio =
          SLIDER_APPROACH_VH / (SLIDER_APPROACH_VH + SLIDER_PIN_VH);
        const lead = 0.22 / total;

        if (p <= approachRatio) {
          return (p / approachRatio) * lead;
        }

        const pinP = (p - approachRatio) / (1 - approachRatio);
        return lead + pinP * (1 - lead);
      }

      function updateSlider() {
        const overall = sliderOverallProgress();

        gsap.set(progressFill, {
          scaleX: overall,
          transformOrigin: "left center",
        });

        if (overall <= 0) {
          hideAllSlides();
          return;
        }

        const slideP = overall * total;
        let active;
        let local;

        if (overall >= 0.999) {
          active = total - 1;
          local = 1;
        } else {
          active = Math.min(total - 1, Math.floor(slideP));
          local = slideP - active;
          if (local < 0.001 && active > 0) {
            active -= 1;
            local = 1;
          }
        }

        slides.forEach((slide, i) => {
          slide.classList.toggle("is-visible", i === active);
          paintLetters(slideCharSets[i], i === active ? local : 0);
        });

        if (active !== lastSliderActive) {
          lastSliderActive = active;
          setActive(active);
        }
      }

      sliderLetterST = whatTrack
        ? ScrollTrigger.create({
            trigger: whatTrack,
            start: "top bottom",
            end: () =>
              `+=${Math.round(
                window.innerHeight * (SLIDER_PIN_VH + SLIDER_APPROACH_VH)
              )}`,
            invalidateOnRefresh: true,
            onUpdate: updateSlider,
            onEnter: updateSlider,
            onEnterBack: updateSlider,
            onLeaveBack: hideAllSlides,
          })
        : null;

      sliderST = ScrollTrigger.create({
        trigger: whatTrack,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * SLIDER_PIN_VH)}`,
        pin: whatSticky,
        scrub: 0.35,
        anticipatePin: 0,
        refreshPriority: 1,
        invalidateOnRefresh: true,
        onLeave: () => {
          playHeroScaleOut();
        },
        onEnterBack: () => {
          playHeroScaleIn();
        },
      });

      const heroOverlay = document.querySelector(".hero-overlay");
      if (heroOverlay && whatTrack) {
        gsap.set(heroOverlay, { autoAlpha: 0 });
        gsap.to(heroOverlay, {
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: whatTrack,
            start: "top bottom",
            end: "top top",
            scrub: 0.6,
          },
        });
      }

      const refreshTriggers = () => ScrollTrigger.refresh();
      window.addEventListener("load", refreshTriggers);
      window.addEventListener("resize", refreshTriggers);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refreshTriggers);
      }

      const portfolioWorks = document.querySelector("[data-portfolio-works]");
      const portfolioRows = gsap.utils.toArray("[data-portfolio-row]");
      const portfolioPreview = document.querySelector("[data-portfolio-preview]");
      const portfolioView = document.querySelector("[data-portfolio-view]");
      const previewImgs = portfolioPreview
        ? gsap.utils.toArray(portfolioPreview.querySelectorAll("[data-preview-img]"))
        : [];

      const portfolioFinePointer =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        window.matchMedia("(min-width: 900px)").matches;

      if (
        portfolioFinePointer &&
        portfolioWorks &&
        portfolioPreview &&
        portfolioView &&
        portfolioRows.length
      ) {
        gsap.set(portfolioPreview, {
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 0,
        });
        gsap.set(portfolioView, {
          xPercent: -50,
          yPercent: -50,
          autoAlpha: 0,
          scale: 0.55,
        });

        const movePreviewX = gsap.quickTo(portfolioPreview, "x", {
          duration: 0.7,
          ease: "power3",
        });
        const movePreviewY = gsap.quickTo(portfolioPreview, "y", {
          duration: 0.7,
          ease: "power3",
        });
        const moveViewX = gsap.quickTo(portfolioView, "x", {
          duration: 0.35,
          ease: "power3",
        });
        const moveViewY = gsap.quickTo(portfolioView, "y", {
          duration: 0.35,
          ease: "power3",
        });

        let previewVisible = false;

        function showPreview(index, clientX, clientY) {
          previewImgs.forEach((img, i) => {
            img.classList.toggle("is-active", i === index);
          });

          if (!previewVisible) {
            previewVisible = true;
            movePreviewX(clientX);
            movePreviewY(clientY);
            moveViewX(clientX);
            moveViewY(clientY);
            gsap.to(portfolioPreview, {
              autoAlpha: 1,
              duration: 0.35,
              ease: "power2.out",
              overwrite: "auto",
            });
            gsap.to(portfolioView, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.4,
              ease: "power3.out",
              overwrite: "auto",
            });
          }
        }

        function hidePreview() {
          if (!previewVisible) return;
          previewVisible = false;
          portfolioWorks.classList.remove("is-hovering");
          portfolioRows.forEach((row) => row.classList.remove("is-active"));
          gsap.to(portfolioPreview, {
            autoAlpha: 0,
            duration: 0.28,
            ease: "power2.in",
            overwrite: "auto",
          });
          gsap.to(portfolioView, {
            autoAlpha: 0,
            scale: 0.55,
            duration: 0.28,
            ease: "power2.in",
            overwrite: "auto",
          });
        }

        portfolioRows.forEach((row) => {
          row.addEventListener("mouseenter", (e) => {
            const index = Number(row.getAttribute("data-preview")) || 0;
            portfolioWorks.classList.add("is-hovering");
            portfolioRows.forEach((r) => r.classList.remove("is-active"));
            row.classList.add("is-active");
            showPreview(index, e.clientX, e.clientY);
          });
        });

        portfolioWorks.addEventListener("mousemove", (e) => {
          if (!previewVisible) return;
          movePreviewX(e.clientX);
          movePreviewY(e.clientY);
          moveViewX(e.clientX);
          moveViewY(e.clientY);
        });

        portfolioWorks.addEventListener("mouseleave", hidePreview);
      }

      const portfolioFooter = document.querySelector("[data-portfolio-footer]");
      if (portfolioFooter) {
        gsap.fromTo(
          portfolioFooter.children,
          { y: 24 },
          {
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: portfolioFooter,
              start: "top 92%",
              once: true,
            },
          }
        );
      }

      function initServiceStack() {
        const list = document.querySelector("[data-services-list]");
        const items = gsap.utils.toArray("[data-service-item]");
        if (!list || items.length < 2) return;

        const titleReveals = items.map((item) => {
          const titleEl = item.querySelector("[data-service-title]");
          if (!titleEl) return null;
          const chars = splitPlainToChars(titleEl);
          if (!chars.length) return null;
          const revealTl = blurRevealTimeline(chars);
          setBlurHidden(chars);
          return {
            show() {
              setBlurHidden(chars);
              revealTl.restart();
            },
            hide() {
              revealTl.pause(0);
              setBlurHidden(chars);
            },
            finish() {
              revealTl.pause();
              setBlurVisible(chars);
            },
          };
        });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          titleReveals.forEach((reveal) => reveal?.finish());
          return;
        }

        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          gsap.set(items, {
            yPercent: (i) => (i === 0 ? 0 : 100),
            force3D: true,
          });

          let activeTitle = -1;
          function setTitle(index) {
            if (index === activeTitle) return;
            activeTitle = index;
            titleReveals[index]?.show();
          }

          const approachST = ScrollTrigger.create({
            trigger: list,
            start: "top 82%",
            end: "top top",
            onEnter: () => setTitle(0),
            onEnterBack: () => setTitle(0),
            onLeaveBack: () => {
              activeTitle = -1;
              titleReveals[0]?.hide();
            },
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "services-stack",
              trigger: list,
              start: "top top",
              end: () =>
                `+=${Math.round(window.innerHeight * (items.length - 1))}`,
              pin: true,
              scrub: 0.45,
              anticipatePin: 1,
              refreshPriority: 1,
              invalidateOnRefresh: true,
              onEnter: () => setTitle(0),
              onEnterBack: () => setTitle(items.length - 1),
              onLeave: () => titleReveals.forEach((reveal) => reveal?.finish()),
              onLeaveBack: () => {
                activeTitle = -1;
                titleReveals.forEach((reveal) => reveal?.hide());
              },
              onUpdate: (self) => {
                const n = items.length;
                const index = Math.min(
                  n - 1,
                  Math.floor(self.progress * (n - 1) + 0.28)
                );
                setTitle(index);
              },
            },
          });

          items.forEach((item, i) => {
            if (i === 0) return;
            tl.to(item, { yPercent: 0, duration: 1 }, i - 1);
          });

          requestAnimationFrame(() => {
            const pinST = tl.scrollTrigger;
            const rect = list.getBoundingClientRect();
            if (pinST?.isActive || approachST.isActive || (rect.top < window.innerHeight * 0.82 && rect.bottom > 0)) {
              setTitle(0);
            }
          });

          return () => {
            approachST.kill();
            if (tl.scrollTrigger) tl.scrollTrigger.kill();
            tl.kill();
            gsap.set(items, { clearProps: "transform" });
          };
        });

        mm.add("(max-width: 767px)", () => {
          const triggers = items.map((item, i) => {
            const reveal = titleReveals[i];
            if (!reveal) return null;
            return ScrollTrigger.create({
              trigger: item,
              start: "top 82%",
              end: "bottom top",
              onEnter: () => reveal.show(),
              onEnterBack: () => reveal.show(),
              onLeave: () => reveal.finish(),
              onLeaveBack: () => reveal.hide(),
            });
          });
          return () => triggers.forEach((st) => st?.kill());
        });
      }

      initServiceStack();

      let navScrollTween = null;

      function navScrollTarget(key) {
        if (key === "contact") {
          const root = document.documentElement;
          return Math.max(0, root.scrollHeight - window.innerHeight);
        }

        const index = key === "service-astro" ? 1 : 0;
        const stack = ScrollTrigger.getById("services-stack");
        const desktop = window.matchMedia("(min-width: 768px)").matches;
        if (stack && desktop && stack.end > stack.start) {
          const count = document.querySelectorAll("[data-service-item]").length;
          const steps = Math.max(1, count - 1);
          return stack.start + (stack.end - stack.start) * (index / steps);
        }

        const el = document.getElementById(key);
        if (!el) return window.scrollY;
        const header = document.querySelector("[data-site-header]");
        const offset = header ? header.getBoundingClientRect().bottom + 12 : 0;
        return el.getBoundingClientRect().top + window.scrollY - offset;
      }

      function animateScrollTo(targetY) {
        const root = document.documentElement;
        const max = Math.max(0, root.scrollHeight - window.innerHeight);
        const target = gsap.utils.clamp(0, max, targetY);
        const from = window.scrollY;
        if (Math.abs(target - from) < 4) return;

        if (navScrollTween) navScrollTween.kill();

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          root.style.scrollBehavior = "auto";
          window.scrollTo(0, target);
          root.style.scrollBehavior = "";
          return;
        }

        const proxy = { y: from };
        const distance = Math.abs(target - from);
        root.style.scrollBehavior = "auto";

        const stopForUser = () => {
          navScrollTween?.kill();
        };
        window.addEventListener("wheel", stopForUser, { passive: true });
        window.addEventListener("touchstart", stopForUser, { passive: true });
        window.addEventListener("keydown", stopForUser);

        const cleanup = () => {
          window.removeEventListener("wheel", stopForUser);
          window.removeEventListener("touchstart", stopForUser);
          window.removeEventListener("keydown", stopForUser);
          root.style.scrollBehavior = "";
          navScrollTween = null;
        };

        navScrollTween = gsap.to(proxy, {
          y: target,
          duration: gsap.utils.clamp(0.72, 1.15, distance / 2200),
          ease: "power2.inOut",
          overwrite: true,
          onUpdate: () => window.scrollTo(0, proxy.y),
          onComplete: cleanup,
          onInterrupt: cleanup,
        });
      }

      document.querySelectorAll("[data-nav-scroll]").forEach((link) => {
        link.addEventListener("click", (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          const key = link.getAttribute("data-nav-scroll");
          if (!key) return;
          event.preventDefault();
          const hash = link.getAttribute("href");
          if (hash && location.hash !== hash) history.pushState(null, "", hash);
          animateScrollTo(navScrollTarget(key));
        });
      });

      function initProcess() {
        const section = document.querySelector("[data-process]");
        const pin = document.querySelector("[data-process-pin]");
        const line = document.querySelector("[data-process-line]");
        if (!section || !pin || !line) return;

        const cards = gsap.utils.toArray("[data-process-card]", section);
        const visuals = cards.map((card) => card.querySelector("[data-process-visual]"));
        const badges = cards.map((card) => card.querySelector("[data-process-badge]"));
        const copies = cards.map((card) => card.querySelector("[data-process-copy]"));
        if (!cards.length || visuals.some((el) => !el) || badges.some((el) => !el)) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const mm = gsap.matchMedia();
        mm.add("(min-width: 900px)", () => {
          const n = cards.length;
          gsap.set(visuals, { y: -50, autoAlpha: 0 });
          gsap.set(badges, { scale: 0, transformOrigin: "50% 50%" });
          gsap.set(copies, { y: 50, autoAlpha: 0 });
          gsap.set(line, { scaleX: 0, scaleY: 0, transformOrigin: "left center" });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: pin,
              start: "top top",
              end: "+=240%",
              pin: true,
              scrub: 0.45,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          cards.forEach((_, i) => {
            tl.to(visuals[i], { y: 0, autoAlpha: 1, duration: 1 }, i);
            tl.to(badges[i], { scale: 1, duration: 1 }, i);
            tl.to(copies[i], { y: 0, autoAlpha: 1, duration: 1 }, i);
          });
          tl.to(line, { scaleX: 1, duration: n }, 0);
          tl.to(line, { scaleY: 1, duration: 1 }, 0);

          return () => {
            if (tl.scrollTrigger) tl.scrollTrigger.kill();
            tl.kill();
            gsap.set([...visuals, ...badges, ...copies, line], {
              clearProps: "all",
            });
          };
        });
      }

      initProcess();

      const processLead = document.querySelector("[data-process-lead]");
      if (processLead) {
        bindPortfolioTitleReveal(processLead, {
          lines: ["Three passes. Each one", "makes the next one simpler."],
        });
      }

      portfolioTitleEls.forEach(bindPortfolioTitleReveal);

      /* —— Footer: sticky reveal + GSAP entrance —— */
      const siteFooter = document.querySelector("[data-site-footer]");
      const footerSpace = document.querySelector("[data-footer-space]");
      const footerHeadline = document.querySelector("[data-footer-headline]");

      function syncFooterHeight() {
        if (!siteFooter || !footerSpace) return;
        const scale = Number(gsap.getProperty(siteFooter, "scale")) || 1;
        gsap.set(siteFooter, { scale: 1 });
        const h = Math.ceil(siteFooter.offsetHeight);
        gsap.set(siteFooter, { scale });
        document.documentElement.style.setProperty("--footer-h", `${h}px`);
      }

      const headlineChars = footerHeadline
        ? splitLinesToChars(footerHeadline, ["Ready to build", "your space?"])
        : [];

      if (siteFooter && footerSpace) {
        syncFooterHeight();
        window.addEventListener("resize", () => {
          syncFooterHeight();
          ScrollTrigger.refresh();
        });

        const left = siteFooter.querySelector("[data-footer-left]");
        const eyebrow = siteFooter.querySelector("[data-footer-eyebrow]");
        const aside = siteFooter.querySelector("[data-footer-aside]");
        const sygnet = siteFooter.querySelector("[data-footer-sygnet]");

        gsap.set(siteFooter, {
          scale: 0.86,
          transformOrigin: "50% 100%",
        });

        gsap.to(siteFooter, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: footerSpace,
            start: "top bottom",
            end: "top 28%",
            scrub: true,
            refreshPriority: -1,
          },
        });

        const footerCopy = left?.querySelector(".footer-copy");
        const footerBlurTargets = [sygnet, eyebrow].filter(Boolean);
        const footerFadeTargets = [footerCopy, aside].filter(Boolean);

        if (headlineChars.length) setBlurHidden(headlineChars);
        if (footerBlurTargets.length) {
          gsap.set(footerBlurTargets, { autoAlpha: 0, y: 24 });
        }
        if (footerFadeTargets.length) {
          gsap.set(footerFadeTargets, { autoAlpha: 0, y: 24 });
        }

        const footerTl = gsap.timeline({ paused: true });
        if (footerBlurTargets.length) {
          footerTl.fromTo(
            footerBlurTargets,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power3.out",
            }
          );
        }

        if (headlineChars.length) {
          footerTl.fromTo(
            headlineChars,
            {
              autoAlpha: 0,
              scale: TEXT_REVEAL.scale,
              filter: `blur(${TEXT_REVEAL.blur}px)`,
            },
            {
              autoAlpha: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: TEXT_REVEAL.duration,
              stagger: blurRevealStagger(),
              ease: TEXT_REVEAL.ease,
              force3D: true,
              immediateRender: false,
              onComplete: () => setBlurVisible(headlineChars),
            },
            footerBlurTargets.length ? "-=0.35" : 0
          );
        }

        if (footerFadeTargets.length) {
          footerTl.fromTo(
            footerFadeTargets,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              stagger: 0.08,
              ease: "power3.out",
            },
            "-=0.5"
          );
        }

        function playFooterIntro() {
          footerTl.pause(0);
          if (headlineChars.length) setBlurHidden(headlineChars);
          if (footerBlurTargets.length) {
            gsap.set(footerBlurTargets, { autoAlpha: 0, y: 24 });
          }
          if (footerFadeTargets.length) {
            gsap.set(footerFadeTargets, { autoAlpha: 0, y: 24 });
          }
          footerTl.restart();
        }

        function resetFooterIntro() {
          footerTl.pause(0);
          if (headlineChars.length) setBlurHidden(headlineChars);
          if (footerBlurTargets.length) {
            gsap.set(footerBlurTargets, { autoAlpha: 0, y: 24 });
          }
          if (footerFadeTargets.length) {
            gsap.set(footerFadeTargets, { autoAlpha: 0, y: 24 });
          }
        }

        resetFooterIntro();

        const footerIntroST = ScrollTrigger.create({
          trigger: footerSpace,
          start: "top 72%",
          end: "bottom top",
          refreshPriority: -1,
          onEnter: playFooterIntro,
          onEnterBack: playFooterIntro,
          onLeave: resetFooterIntro,
          onLeaveBack: resetFooterIntro,
        });

        requestAnimationFrame(() => {
          if (footerIntroST.isActive) playFooterIntro();
        });
      }

      function dismissPreloader() {
        const preload = document.querySelector("[data-preload]");
        document.documentElement.classList.remove(
          "is-preloading",
          "is-preload-exit"
        );
        if (window.__spacersScrollLock) window.__spacersScrollLock.unlock();
        if (preload) preload.remove();
        playHeroScaleIn();
        requestAnimationFrame(() => {
          updateSlider();
          syncFooterHeight();
          ScrollTrigger.refresh();
          const key = location.hash.replace("#", "");
          if (key === "service-uiux" || key === "service-astro" || key === "contact") {
            animateScrollTo(navScrollTarget(key));
          }
        });
      }

      function playStairsPreloader() {
        const preload = document.querySelector("[data-preload]");
        const logo = document.querySelector("[data-preload-logo]");
        const logoParts = gsap.utils.toArray("[data-preload-logo-part]");
        const stairs = gsap.utils.toArray("[data-preload-stairs] span");
        const headerMark = document.querySelector(
          ".site-header--blend .site-logo-mark"
        );
        const reducePreload = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (!preload || !logo || !stairs.length || reducePreload) {
          dismissPreloader();
          return;
        }

        const ease = "cubic-bezier(0.215, 0.61, 0.355, 1)";
        const fill = document.querySelector("[data-preload-fill]");
        const fly = { x: 0, y: 0, scale: 1 };
        gsap.set(logoParts, {
          autoAlpha: 0,
          scale: TEXT_REVEAL.scale,
          filter: `blur(${TEXT_REVEAL.blur}px)`,
          transformOrigin: "50% 55%",
        });
        gsap.set(stairs, { height: "100%" });

        gsap.timeline({
          onComplete: dismissPreloader,
        })
          .to(logoParts, {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: TEXT_REVEAL.duration,
            stagger: blurRevealStagger(),
            ease: TEXT_REVEAL.ease,
            onComplete: () => gsap.set(logoParts, { clearProps: "filter" }),
          })
          .add(() => {
            document.documentElement.classList.add("is-preload-exit");
            if (!headerMark) return;
            const from = logo.getBoundingClientRect();
            const to = headerMark.getBoundingClientRect();
            fly.x =
              to.left + to.width / 2 - (from.left + from.width / 2);
            fly.y =
              to.top + to.height / 2 - (from.top + from.height / 2);
            fly.scale = to.width / Math.max(from.width, 1);
          }, "+=0.5")
          .addLabel("exit")
          .set(fill, { autoAlpha: 0 }, "exit")
          .to(
            logo,
            {
              x: () => fly.x,
              y: () => fly.y,
              scale: () => fly.scale,
              duration: 0.95,
              ease: "power3.inOut",
            },
            "exit"
          )
          .to(
            stairs,
            {
              height: 0,
              duration: 0.45,
              ease,
              stagger: { each: 0.05, from: "end" },
            },
            "exit+=0.06"
          )
          .add(() => {
            playHeroScaleIn({ overlap: true });
          }, "exit+=0.12");
      }

      playStairsPreloader();
