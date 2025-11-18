document.addEventListener("DOMContentLoaded", () => {
  // ====== YEAR IN FOOTER ======
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

  // ====== CONTACT SECTION VISIBILITY (SLIDE / FADE IN) ======
  const contactSection = document.getElementById("contact");
  if (contactSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            contactSection.classList.add("visible");
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(contactSection);
  }

  // ====== HAND + PAGE CRUMPLE FOR "CONTACT ME" ======
  const contactTrigger = document.getElementById("contact-trigger");
  const hand = document.querySelector(".hand-cta");
  const pageShell = document.querySelector(".page-shell");

  if (contactTrigger && hand && pageShell && contactSection) {
    contactTrigger.addEventListener("click", (event) => {
      event.preventDefault();

      // Avoid double-trigger
      if (hand.classList.contains("is-running")) {
        contactSection.scrollIntoView({ behavior: "smooth" });
        return;
      }

      hand.classList.add("is-running", "is-visible");

      // Stage 1: hand slides down & page crumples a bit
      requestAnimationFrame(() => {
        hand.classList.add("is-grabbing");
        pageShell.classList.add("is-crumpled");
      });

      // Stage 2: hand pulls upward + start smooth scroll to contact
      setTimeout(() => {
        hand.classList.add("is-pulling");
        contactSection.scrollIntoView({ behavior: "smooth" });
      }, 350);

      // Stage 3: cleanup
      setTimeout(() => {
        hand.className = "hand-cta"; // reset to base classes
        pageShell.classList.remove("is-crumpled");
      }, 1200);

      setTimeout(() => {
        hand.classList.remove("is-running");
      }, 1300);
    });
  }

  // ====== PARABOLIC PAPER SHOT FOR "VIEW MY PROJECTS" ======
  const projectsTrigger = document.getElementById("projects-trigger");
  const body = document.body;

  if (projectsTrigger && contactTrigger) {
    // Get the destination from data-href
    const targetHref = projectsTrigger.dataset.href;

    projectsTrigger.addEventListener("click", (event) => {
      event.preventDefault();

      // avoid spamming animation
      if (body.classList.contains("is-project-shot-running")) {
        return;
      }
      body.classList.add("is-project-shot-running");

      // Get button positions in the viewport
      const paperRect = projectsTrigger.getBoundingClientRect();
      const netRect = contactTrigger.getBoundingClientRect();

      // Create overlays
      const paper = document.createElement("div");
      paper.className = "shot-paper";

      const net = document.createElement("div");
      net.className = "shot-net";

      // Make sure the paper is definitely above the net
      paper.style.zIndex = "10002";
      net.style.zIndex = "10001";

      // Start both at their respective button centers
      const startX = paperRect.left + paperRect.width / 2;
      const startY = paperRect.top + paperRect.height / 2;
      const endX = netRect.left + netRect.width / 2;
      const endY = netRect.top + netRect.height / 2;

      paper.style.left = `${startX}px`;
      paper.style.top = `${startY}px`;
      net.style.left = `${endX}px`;
      net.style.top = `${endY}px`;

      document.body.appendChild(net);   // net first
      document.body.appendChild(paper); // paper on top

      // Hide actual buttons while the shot plays
      projectsTrigger.classList.add("is-hidden-for-shot");
      contactTrigger.classList.add("is-hidden-for-shot");

      // Make the net pop in slightly
      requestAnimationFrame(() => {
        net.classList.add("is-visible");
      });

      // Animation settings
      const duration = 700; // ms for the shot
      const peakHeight = 180; // how high the paper arcs (px)
      const startTime = performance.now();

      function animate(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1); // clamp 0..1

        const x = startX + (endX - startX) * t;
        const baseY = startY + (endY - startY) * t;
        const arcOffset = peakHeight * 4 * t * (1 - t);
        const y = baseY - arcOffset;

        paper.style.left = `${x}px`;
        paper.style.top = `${y}px`;
        const rotation = 720 * t;
        paper.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          // Phase 2: fall straight down + fade out

          // Little net pop when it "scores"
          net.classList.add("is-scored");

          const fallDistance = 75;      // px to fall
          const fallDuration = 350;     // ms for the fall
          const fallStartY = endY;      // it lands at the net's Y
          const fallStartTime = performance.now();

          function fallStep(now) {
            const elapsed = now - fallStartTime;
            const tf = Math.min(elapsed / fallDuration, 1); // 0..1

            // Straight down from the rim
            const currentY = fallStartY + fallDistance * tf;
            paper.style.top = `${currentY}px`;

            // Fade from 1 → 0
            paper.style.opacity = String(1 - tf);

            if (tf < 1) {
              requestAnimationFrame(fallStep);
            } else {
              // Done falling – cleanup and navigate
              paper.remove();
              net.remove();

              projectsTrigger.classList.remove("is-hidden-for-shot");
              contactTrigger.classList.remove("is-hidden-for-shot");
              body.classList.remove("is-project-shot-running");

              window.location.href = targetHref; // or targetHref if you stored it
            }
          }

          // Start the fall immediately after the shot finishes
          requestAnimationFrame(fallStep);
        }
      }
      requestAnimationFrame(animate);
    });
  }
});
