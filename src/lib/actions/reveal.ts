import type { Action } from "svelte/action";

interface RevealOptions {
  delay?: number;
  threshold?: number;
}

export const reveal: Action<HTMLElement, RevealOptions | undefined> = (node, options) => {
  const delay = options?.delay ?? 0;
  const threshold = options?.threshold ?? 0.1;

  node.style.opacity = "0";
  node.style.transform = "translateY(8px)";
  node.style.transition = `opacity 400ms ease-out ${delay}ms, transform 400ms ease-out ${delay}ms`;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.style.opacity = "1";
          node.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold },
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    },
  };
};
