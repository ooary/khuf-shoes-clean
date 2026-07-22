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
  const dots = document.querySelector("#reviewDots");

  if (track && rail && dots) {
    const cards = [...rail.children];
    let index = 0;
    let timer;

    cards.forEach((_, cardIndex) => {
      const dot = document.createElement("button");
      dot.className = `review-dot${cardIndex === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Ke review ${cardIndex + 1}`);
      dot.addEventListener("click", () => {
        index = cardIndex;
        render();
        restart();
      });
      dots.appendChild(dot);
    });

    const visibleCount = () => (window.innerWidth < 768 ? 1 : 3);
    const maxIndex = () => Math.max(0, cards.length - visibleCount());
    const step = () => cards[0].getBoundingClientRect().width + 20;

    function render(animate = true) {
      index = Math.min(index, maxIndex());
      rail.style.transition = animate ? "transform .75s cubic-bezier(.22,.61,.36,1)" : "none";
      rail.style.transform = `translate3d(${-index * step()}px,0,0)`;
      [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
    }

    function advance() {
      if (index >= maxIndex()) {
        index = 0;
        render(false);
        requestAnimationFrame(() => requestAnimationFrame(() => render(true)));
      } else {
        index += 1;
        render(true);
      }
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(advance, 3800);
    }

    window.addEventListener("resize", () => render(false));
    track.addEventListener("mouseenter", () => clearInterval(timer));
    track.addEventListener("mouseleave", restart);
    track.addEventListener("focusin", () => clearInterval(timer));
    track.addEventListener("focusout", restart);

    render(false);
    restart();
  }

  document.querySelector("#contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = `Halo Khuf, saya ${form.get("name")}. Saya ingin konsultasi ${form.get("service")} untuk ${form.get("item")}. Catatan: ${form.get("message") || "-"}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(message)}`, "_blank");
  });
});
