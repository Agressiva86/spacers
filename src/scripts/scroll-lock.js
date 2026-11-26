window.__spacersScrollLock = (function () {
        const keys = new Set([
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
          "Spacebar",
        ]);
        const opts = { capture: true, passive: false };
        let locked = false;

        function onWheel(e) {
          e.preventDefault();
        }

        function onTouch(e) {
          e.preventDefault();
        }

        function onKey(e) {
          if (!keys.has(e.key)) return;
          const tag = (e.target && e.target.tagName) || "";
          if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
          if (e.target && e.target.isContentEditable) return;
          e.preventDefault();
        }

        function onScroll() {
          if (locked) window.scrollTo(0, 0);
        }

        function lock() {
          if (locked) return;
          locked = true;
          window.scrollTo(0, 0);
          window.addEventListener("wheel", onWheel, opts);
          window.addEventListener("touchmove", onTouch, opts);
          window.addEventListener("keydown", onKey, opts);
          window.addEventListener("scroll", onScroll, { passive: true });
        }

        function unlock() {
          if (!locked) return;
          locked = false;
          window.removeEventListener("wheel", onWheel, opts);
          window.removeEventListener("touchmove", onTouch, opts);
          window.removeEventListener("keydown", onKey, opts);
          window.removeEventListener("scroll", onScroll);
        }

        if (document.documentElement.classList.contains("is-preloading")) {
          lock();
        }

        return { lock, unlock };
      })();