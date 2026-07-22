const WA = "628991971197";

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();

  const menuButton = document.querySelector("#menuBtn");
  const mobileMenu = document.querySelector("#mobileMenu");
  menuButton?.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    menuButton.setAttribute("aria-expanded", String(!mobileMenu.classList.contains("hidden")));
  });

  document.querySelectorAll("[data-faq]").forEach((button) => {
    button.addEventListener("click", () => {
      button.nextElementSibling.classList.toggle("hidden");
      button.querySelector("svg")?.classList.toggle("rotate-180");
    });
  });

  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in")),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  const track = document.querySelector("#reviewTrack");
  const rail = document.querySelector("#reviewRail");

  if (track && rail) {
    const originals = [...rail.children];
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      rail.appendChild(clone);
    });

    let offset = 0;
    let lastTime = performance.now();
    let paused = false;
    const speed = 34;

    function loopWidth() {
      return originals.reduce((total, card) => total + card.getBoundingClientRect().width, 0) + 20 * originals.length;
    }

    function animate(time) {
      const delta = Math.min(40, time - lastTime);
      lastTime = time;
      if (!paused) {
        offset += (speed * delta) / 1000;
        const width = loopWidth();
        if (offset >= width) offset -= width;
        rail.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      requestAnimationFrame(animate);
    }

    track.addEventListener("mouseenter", () => (paused = true));
    track.addEventListener("mouseleave", () => (paused = false));
    track.addEventListener("focusin", () => (paused = true));
    track.addEventListener("focusout", () => (paused = false));
    requestAnimationFrame(animate);
  }

  document.querySelector("#contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = `Halo Khuf, saya ${form.get("name")}. Saya ingin konsultasi ${form.get("service")} untuk ${form.get("item")}. Catatan: ${form.get("message") || "-"}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(message)}`, "_blank");
  });
});
