/**
 * Shared IntersectionObserver: toggles the `in` class both ways,
 * so elements animate in when scrolled into view and out again when they leave.
 */
let observer: IntersectionObserver | null = null;

function get() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
  }
  return observer;
}

export function observeReveal(el: Element) {
  const io = get();
  io.observe(el);
  return () => io.unobserve(el);
}
