document.addEventListener("DOMContentLoaded", () => {
  // Preload crumple images so they don't flash blank on first use
  const crumpleStageUrls = [
    "paper_stage1.png",
    "paper_stage2.png",
    "paper_stage3.png",
    "paper.png",
  ];

  crumpleStageUrls.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

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
    const targetHref = projectsTrigger.getAttribute("data-href") || projectsTrigger.getAttribute("href"); // final destination

    projectsTrigger.addEventListener("click", (event) => {
      event.preventDefault();

      // avoid spamming animation
      if (body.classList.contains("is-project-shot-running")) {
        return;
      }
      body.classList.add("is-project-shot-running");

      // Get button positions in the viewport BEFORE hiding them
      const paperRect = projectsTrigger.getBoundingClientRect();
      const netRect = contactTrigger.getBoundingClientRect();

      // Hide actual buttons immediately so you don't see them under the overlay
      projectsTrigger.classList.add("is-hidden-for-shot");
      contactTrigger.classList.add("is-hidden-for-shot");

      // Visually morph the contact button to the net
      contactTrigger.classList.add("is-morphing-to-net");

      // Create overlays
      const paper = document.createElement("div");
      paper.className = "shot-paper";

      const net = document.createElement("div");
      net.className = "shot-net";

      // Make sure paper is above net
      paper.style.zIndex = "10002";
      net.style.zIndex = "10001";

      // Start both at their respective button centers
      const startX = paperRect.left + paperRect.width / 2;
      const startY = paperRect.top + paperRect.height / 2;
      const endX = netRect.left + netRect.width / 2;
      const endY = netRect.top + netRect.height / 2;

      // Position overlays
      paper.style.left = `${startX}px`;
      paper.style.top = `${startY}px`;
      net.style.left = `${endX}px`;
      net.style.top = `${endY}px`;

      // ---- Use the real button as the first "flat" stage ----
      // Match size + background to the original button
      const btnStyles = window.getComputedStyle(projectsTrigger);
      paper.style.width = `${paperRect.width}px`;
      paper.style.height = `${paperRect.height}px`;
      paper.style.borderRadius = btnStyles.borderRadius;
      paper.style.background = btnStyles.background; // same gradient as button
      paper.style.backgroundImage = "none"; // we'll set PNGs later
      paper.style.backgroundSize = "cover";
      paper.style.backgroundRepeat = "no-repeat";
      paper.style.backgroundPosition = "center";

      document.body.appendChild(net);
      document.body.appendChild(paper);

      // Make the net pop in slightly
      requestAnimationFrame(() => {
        net.classList.add("is-visible");
      });

      // ====== CRUMPLE STAGES (smooth, no flicker) ======
      const crumpleStages = [
        "url('paper_stage1.png')",
        "url('paper_stage2.png')",
        "url('paper_stage3.png')",
        "url('paper.png')", // final crumpled ball
      ];

      let stageIndex = 0;
      const stageDuration = 200; // ms per frame - tweak for speed

      function runCrumpleStage() {
        paper.style.backgroundImage = crumpleStages[stageIndex];
        paper.style.backgroundRepeat = "no-repeat";
        paper.style.backgroundPosition = "center";

        // 🔽 make stage1 + stage2 bigger, keep stage3 + paper.png as-is
        if (stageIndex === 0) {
          // stage1: largest
          paper.style.backgroundSize = "150% auto";
        } else if (stageIndex === 1) {
          // stage2: slightly smaller
          paper.style.backgroundSize = "130% auto";
        } else if (stageIndex === 2) {
          // stage3: smaller
          paper.style.backgroundSize = "50% auto";
        } else {
          // stage3 + final ball
          paper.style.backgroundSize = "contain";
        }

        if (stageIndex < crumpleStages.length - 1) {
          stageIndex += 1;
          setTimeout(runCrumpleStage, stageDuration);
        } else {
          startShot();
        }
      }

      // ====== PARABOLIC SHOT + FALL THROUGH NET ======
      function startShot() {
        const duration = 700; // ms for the shot
        const peakHeight = 180; // arc height (px)
        const startTime = performance.now();

        function animate(time) {
          const elapsed = time - startTime;
          const t = Math.min(elapsed / duration, 1); // 0..1

          // Linear interpolation for x and baseline y
          const x = startX + (endX - startX) * t;
          const baseY = startY + (endY - startY) * t;

          // Parabolic arc
          const arcOffset = peakHeight * 4 * t * (1 - t);
          const y = baseY - arcOffset;

          paper.style.left = `${x}px`;
          paper.style.top = `${y}px`;

          const rotation = 720 * t; // 2 spins across the flight
          paper.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            // Hit the net: tiny pop
            net.classList.add("is-scored");

            // Fall straight down 75px and fade out
            const fallDistance = 75;
            const fallDuration = 350;
            const fallStartY = endY;
            const fallStartTime = performance.now();

            function fallStep(now) {
              const elapsedFall = now - fallStartTime;
              const tf = Math.min(elapsedFall / fallDuration, 1); // 0..1

              const currentY = fallStartY + fallDistance * tf;
              paper.style.top = `${currentY}px`;
              paper.style.opacity = String(1 - tf);

              if (tf < 1) {
                requestAnimationFrame(fallStep);
              } else {
                // Done: cleanup + navigate
                paper.remove();
                net.remove();

                projectsTrigger.classList.remove("is-hidden-for-shot");
                contactTrigger.classList.remove("is-hidden-for-shot");
                contactTrigger.classList.remove("is-morphing-to-net");
                body.classList.remove("is-project-shot-running");

                if (targetHref) {
                  window.location.href = targetHref;
                } else {
                  console.warn("No targetHref set on #projects-trigger");
                }
              }
            }

            requestAnimationFrame(fallStep);
          }
        }

        requestAnimationFrame(animate);
      }

      // Start with the button-look, then quickly crumple through PNG stages
      runCrumpleStage();
    });
  }
});
