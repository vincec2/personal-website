document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
  }

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

  const contactTrigger = document.getElementById("contact-trigger");
  const hand = document.querySelector(".hand-cta");
  const pageShell = document.querySelector(".page-shell");

  if (contactTrigger && hand && pageShell && contactSection) {
    contactTrigger.addEventListener("click", (event) => {
      event.preventDefault();

      if (hand.classList.contains("is-running")) {
        contactSection.scrollIntoView({ behavior: "smooth" });
        return;
      }

      hand.classList.add("is-running", "is-visible");

      requestAnimationFrame(() => {
        hand.classList.add("is-grabbing");
        pageShell.classList.add("is-crumpled");
      });

      setTimeout(() => {
        hand.classList.add("is-pulling");
        contactSection.scrollIntoView({ behavior: "smooth" });
      }, 350);

      setTimeout(() => {
        hand.className = "hand-cta";
        pageShell.classList.remove("is-crumpled");
      }, 1200);

      setTimeout(() => {
        hand.classList.remove("is-running");
      }, 1300);
    });
  }
});
