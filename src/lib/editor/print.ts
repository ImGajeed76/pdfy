/**
 * Inject a dynamic <style> with the user's chosen page size for printing.
 * Updates on demand.
 */
const STYLE_ID = "pdfy-print-page";

export function applyPageSize(size: "A4" | "Letter"): void {
  if (typeof document === "undefined") return;
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    @media print {
      @page { size: ${size}; }
    }
  `;
}
