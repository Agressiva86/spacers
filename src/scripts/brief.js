import gsap from "gsap";

const TEXT_REVEAL = { blur: 12, scale: 1.08, duration: 0.8, stagger: 0.045, ease: "power3.out" };
      const briefTitle = document.querySelector("[data-brief-title]");
      let briefTitleTl = null;
      let briefTitlePlayed = false;

      function splitLinesToChars(el, lines) {
        el.setAttribute("aria-label", lines.join(" "));
        el.textContent = "";
        const chars = [];
        lines.forEach((lineText) => {
          const line = document.createElement("span");
          line.className = "line";
          lineText.split(" ").forEach((word, wi, words) => {
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
            if (wi < words.length - 1) {
              const space = document.createElement("span");
              space.className = "char-space";
              space.innerHTML = "&nbsp;";
              space.setAttribute("aria-hidden", "true");
              wordSpan.appendChild(space);
            }
            line.appendChild(wordSpan);
          });
          el.appendChild(line);
        });
        return chars;
      }

      function playBriefTitle() {
        if (briefTitlePlayed) return;
        briefTitlePlayed = true;
        if (!briefTitleTl) return;
        briefTitleTl.restart();
      }

      if (briefTitle && typeof gsap !== "undefined") {
        const chars = splitLinesToChars(briefTitle, ["Tell us what", "you need"]);
        gsap.set(chars, {
          autoAlpha: 0,
          scale: TEXT_REVEAL.scale,
          filter: "blur(" + TEXT_REVEAL.blur + "px)",
          force3D: true,
        });
        briefTitleTl = gsap.timeline({ paused: true });
        briefTitleTl.to(chars, {
          autoAlpha: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: TEXT_REVEAL.duration,
          stagger: { each: TEXT_REVEAL.stagger, from: "start" },
          ease: TEXT_REVEAL.ease,
          force3D: true,
          onComplete: () => gsap.set(chars, { clearProps: "filter,willChange" }),
        });
      }

      function dismissPreloader() {
        const preload = document.querySelector("[data-preload]");
        document.documentElement.classList.remove("is-preloading", "is-preload-exit");
        if (window.__spacersScrollLock) window.__spacersScrollLock.unlock();
        if (preload) preload.remove();
        playBriefTitle();
      }

      function playStairsPreloader() {
        const preload = document.querySelector("[data-preload]");
        const logo = document.querySelector("[data-preload-logo]");
        const logoParts = gsap.utils.toArray("[data-preload-logo-part]");
        const stairs = gsap.utils.toArray("[data-preload-stairs] span");
        const logoMark = document.querySelector(".brief-logo-mark");
        const reducePreload = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!preload || !logo || !stairs.length || reducePreload || typeof gsap === "undefined") {
          dismissPreloader();
          return;
        }

        const ease = "cubic-bezier(0.215, 0.61, 0.355, 1)";
        const fill = document.querySelector("[data-preload-fill]");
        const fly = { x: 0, y: 0, scale: 1 };
        gsap.set(logoParts, {
          autoAlpha: 0,
          scale: TEXT_REVEAL.scale,
          filter: "blur(" + TEXT_REVEAL.blur + "px)",
          transformOrigin: "50% 55%",
        });
        gsap.set(stairs, { height: "100%" });

        gsap.timeline({ onComplete: dismissPreloader })
          .to(logoParts, {
            autoAlpha: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: TEXT_REVEAL.duration,
            stagger: { each: TEXT_REVEAL.stagger, from: "start" },
            ease: TEXT_REVEAL.ease,
            onComplete: () => gsap.set(logoParts, { clearProps: "filter" }),
          })
          .add(() => {
            document.documentElement.classList.add("is-preload-exit");
            if (!logoMark) return;
            const from = logo.getBoundingClientRect();
            const to = logoMark.getBoundingClientRect();
            fly.x = to.left + to.width / 2 - (from.left + from.width / 2);
            fly.y = to.top + to.height / 2 - (from.top + from.height / 2);
            fly.scale = to.width / Math.max(from.width, 1);
          }, "+=0.5")
          .addLabel("exit")
          .set(fill, { autoAlpha: 0 }, "exit")
          .to(logo, {
            x: () => fly.x,
            y: () => fly.y,
            scale: () => fly.scale,
            duration: 0.95,
            ease: "power3.inOut",
          }, "exit")
          .to(stairs, {
            height: 0,
            duration: 0.45,
            ease,
            stagger: { each: 0.05, from: "end" },
          }, "exit+=0.06")
          .add(() => playBriefTitle(), "exit+=0.42");
      }

      playStairsPreloader();

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

      const form = document.getElementById("brief-form");
      const success = document.getElementById("brief-success");
      const mailtoLink = document.getElementById("mailto-link");
      const copyBtn = document.getElementById("copy-brief");
      const otherBox = document.getElementById("needs-other");
      const otherField = document.getElementById("other-field");
      let briefText = "";

      function setError(name, message) {
        const field = form.querySelector(`[data-field="${name}"]`);
        const error = form.querySelector(`[data-error="${name}"]`);
        if (field) field.classList.toggle("is-invalid", Boolean(message));
        if (error) error.textContent = message || "";
        const control = field?.querySelector("input, textarea, select");
        if (control) {
          control.setAttribute("aria-invalid", message ? "true" : "false");
        }
      }

      function value(name) {
        return (form.elements[name]?.value || "").trim();
      }

      function checkedValues(name) {
        return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
      }

      function looksLikeUrl(text) {
        if (!text) return true;
        try {
          const withProtocol = /^https?:\/\//i.test(text) ? text : `https://${text}`;
          const url = new URL(withProtocol);
          return url.hostname.includes(".");
        } catch (err) {
          return false;
        }
      }

      otherBox.addEventListener("change", () => {
        otherField.hidden = !otherBox.checked;
        if (!otherBox.checked) {
          otherField.querySelector("input").value = "";
          setError("other", "");
        }
      });

      document.querySelectorAll("[data-repeater]").forEach((repeater) => {
        const list = repeater.querySelector("[data-rows]");
        const add = repeater.querySelector("[data-add]");
        const template = list.querySelector("[data-row]");
        const urlLabel = repeater.getAttribute("data-url-label");
        const noteLabel = repeater.getAttribute("data-note-label");

        function refresh() {
          const rows = [...list.querySelectorAll("[data-row]")];
          rows.forEach((row, index) => {
            row.querySelector("[data-remove]").hidden = index === 0;
            row.querySelector("[data-url]").setAttribute("aria-label", `${urlLabel} ${index + 1}`);
            row.querySelector("[data-note]").setAttribute("aria-label", `${noteLabel} ${index + 1}`);
          });
          add.hidden = rows.length >= 5;
        }

        add.addEventListener("click", () => {
          const clone = template.cloneNode(true);
          clone.querySelectorAll("input").forEach((input) => {
            input.value = "";
            input.classList.remove("is-filled");
          });
          list.appendChild(clone);
          refresh();
          clone.querySelector("[data-url]").focus();
        });

        list.addEventListener("click", (event) => {
          const button = event.target.closest("[data-remove]");
          if (!button || button.hidden) return;
          const row = button.closest("[data-row]");
          const rows = [...list.querySelectorAll("[data-row]")];
          if (!row || row === rows[0]) return;
          row.remove();
          refresh();
        });

        refresh();
      });

      function syncFilled(control) {
        if (!control || !control.classList || !control.classList.contains("control")) return;
        control.classList.toggle("is-filled", control.value.trim() !== "");
      }

      form.addEventListener("input", (event) => syncFilled(event.target));
      form.addEventListener("change", (event) => syncFilled(event.target));

      function pairs(name) {
        return [...form.querySelectorAll(`[data-repeater="${name}"] [data-row]`)]
          .map((row) => ({
            url: row.querySelector("[data-url]").value.trim(),
            note: row.querySelector("[data-note]").value.trim(),
          }))
          .filter((item) => item.url || item.note);
      }

      function formatPairs(items) {
        if (!items.length) return "—";
        return items
          .map((item) => [item.url, item.note].filter(Boolean).join(" — "))
          .map((line) => `- ${line}`)
          .join("\n");
      }

      function buildBrief(data) {
        const lines = [
          "THE BASICS",
          `Name or company: ${data.name}`,
          `Email: ${data.email}`,
          data.website ? `Current website: ${data.website}` : "",
          "",
          "THE PROJECT",
          `Services: ${data.needs.join(", ")}`,
          data.other ? `Other: ${data.other}` : "",
          `Main goal: ${data.goal.join(", ")}`,
          "Pages:",
          data.pages,
          data.materials.length ? `Brand materials: ${data.materials.join(", ")}` : "",
          data.problem ? `Biggest problem:\n${data.problem}` : "",
          "",
          "MARKET AND PREFERENCES",
          "Competitors:",
          formatPairs(data.competitors),
          "Good benchmarks:",
          formatPairs(data.benchmarks),
          "Anti-benchmarks:",
          formatPairs(data.avoid),
          "",
          "BUDGET AND TIMING",
          `Net budget: ${data.budget}`,
          data.deadline ? `Deadline: ${data.deadline}` : "",
          data.notes ? `Notes:\n${data.notes}` : "",
        ];
        return lines.filter((line) => line !== "").join("\n").replace(/\n{3,}/g, "\n\n").trim();
      }

      form.addEventListener("input", (event) => {
        const field = event.target.closest("[data-field]");
        if (field) setError(field.getAttribute("data-field"), "");
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        ["name", "email", "email_consent", "website", "needs", "other", "goal", "pages", "budget"].forEach((name) => setError(name, ""));

        const data = {
          name: value("name"),
          email: value("email"),
          website: value("website"),
          needs: checkedValues("needs"),
          other: value("other"),
          goal: checkedValues("goal"),
          pages: value("pages"),
          materials: checkedValues("materials"),
          problem: value("problem"),
          competitors: pairs("competitors"),
          benchmarks: pairs("benchmarks"),
          avoid: pairs("avoid"),
          budget: value("budget"),
          deadline: value("deadline"),
          notes: value("notes"),
        };

        const errors = [];
        if (!data.name) errors.push(["name", "Add a name or company."]);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push(["email", "Add a valid email address."]);
        if (!form.querySelector('input[name="email_consent"]')?.checked) {
          errors.push(["email_consent", "Please confirm consent to process your email address."]);
        }
        if (data.website && !looksLikeUrl(data.website)) errors.push(["website", "Add a full website address, or leave this empty."]);
        if (!data.needs.length) errors.push(["needs", "Choose at least one service."]);
        if (data.needs.includes("Other") && data.other.length < 2) errors.push(["other", "Tell us what the other service is."]);
        if (!data.goal.length) errors.push(["goal", "Choose at least one goal."]);
        if (data.pages.length < 3) errors.push(["pages", "List the pages the site should include."]);
        if (!data.budget) errors.push(["budget", "Select a budget range."]);

        errors.forEach(([name, message]) => setError(name, message));
        if (errors.length) {
          const first = form.querySelector(`[data-field="${errors[0][0]}"] input, [data-field="${errors[0][0]}"] textarea, [data-field="${errors[0][0]}"] select`);
          first?.focus();
          return;
        }

        if (value("company_website")) {
          form.classList.add("is-hidden");
          success.classList.add("is-visible");
          return;
        }

        briefText = buildBrief(data);
        const subject = `Project brief — ${data.name}`;
        const href = `mailto:hello@spacers.agency?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText)}`;
        mailtoLink.href = href;
        form.classList.add("is-hidden");
        success.classList.add("is-visible");
        success.scrollIntoView({ behavior: "smooth", block: "start" });
        const opener = document.createElement("a");
        opener.href = href;
        opener.click();
      });

      const copyStatus = document.getElementById("copy-status");
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(briefText);
          copyStatus.hidden = false;
        } catch (err) {
          window.prompt("Copy the brief:", briefText);
        }
      });

      const briefPanel = document.querySelector(".brief-panel");
      const desktopSplit = window.matchMedia("(min-width: 768px)");
      window.addEventListener("wheel", (event) => {
        if (document.documentElement.classList.contains("is-preloading")) return;
        if (!desktopSplit.matches || !briefPanel || briefPanel.contains(event.target)) return;
        briefPanel.scrollTop += event.deltaY;
      }, { passive: true });
