const ROLE_LABELS: Record<string, string> = {
  button: "Botón",
  link: "Enlace",
  heading: "Encabezado",
  navigation: "Navegación",
  main: "Contenido principal",
  textbox: "Campo de texto",
  combobox: "Lista desplegable",
  checkbox: "Casilla",
  radio: "Opción",
  tab: "Pestaña",
  menuitem: "Opción de menú",
  search: "Búsqueda",
};

const SKIP_SPEECH_SELECTORS = [
  '[aria-hidden="true"]',
  ".sr-only",
  "script",
  "style",
  "noscript",
  '[aria-label="Controles de lectura asistida"]',
  "[data-alae-skip-speech]",
].join(",");

function roleLabel(el: Element): string | null {
  const explicit = el.getAttribute("role");
  if (explicit && ROLE_LABELS[explicit]) return ROLE_LABELS[explicit];

  const tag = el.tagName.toLowerCase();
  if (tag === "button") return "Botón";
  if (tag === "a") return "Enlace";
  if (/^h[1-6]$/.test(tag)) return "Encabezado";
  if (tag === "input") {
    const type = (el as HTMLInputElement).type;
    if (type === "checkbox") return "Casilla";
    if (type === "radio") return "Opción";
    if (type === "search") return "Búsqueda";
    return "Campo de texto";
  }
  if (tag === "textarea") return "Campo de texto";
  if (tag === "select") return "Lista desplegable";
  if (tag === "nav") return "Navegación";
  if (tag === "main") return "Contenido principal";

  return null;
}

function textFromLabelledBy(el: Element): string | null {
  const ids = el.getAttribute("aria-labelledby")?.split(/\s+/) ?? [];
  const parts = ids
    .map((id) => document.getElementById(id)?.textContent?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(". ") : null;
}

/** Texto legible para síntesis de voz a partir de un elemento del DOM. */
export function getReadableLabel(el: Element): string | null {
  if (!(el instanceof HTMLElement)) return null;
  if (el.closest('[aria-hidden="true"]')) return null;
  if (el.closest('[aria-label="Controles de lectura asistida"]')) return null;
  if (el.id?.startsWith("sr-announcer")) return null;
  if (el.classList.contains("sr-only") && el.closest("[aria-live]")) return null;

  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;

  const labelled = textFromLabelledBy(el);
  if (labelled) return labelled;

  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    const id = el.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      const labelText = label?.textContent?.replace(/\s+/g, " ").trim();
      if (labelText) {
        const value =
          el instanceof HTMLSelectElement
            ? el.options[el.selectedIndex]?.text
            : el.value;
        if (el.type === "password") return `${labelText}. Campo de contraseña`;
        if (value?.trim()) return `${labelText}. ${value.trim()}`;
        if ("placeholder" in el && el.placeholder)
          return `${labelText}. ${el.placeholder}`;
        return labelText;
      }
    }
    if (el instanceof HTMLInputElement && el.placeholder)
      return el.placeholder;
    if (el instanceof HTMLInputElement && el.type === "password")
      return "Contraseña";
  }

  if (el instanceof HTMLImageElement && el.alt?.trim()) return el.alt.trim();

  const text = el.textContent?.replace(/\s+/g, " ").trim();
  if (!text || text.length > 400) return null;

  const prefix = roleLabel(el);
  return prefix ? `${prefix}: ${text}` : text;
}

function getReadableRoot(): HTMLElement {
  return (
    (document.getElementById("main-content") as HTMLElement | null) ??
    (document.querySelector("main") as HTMLElement | null) ??
    document.body
  );
}

/** Lee el contenido principal de la página actual. */
export function getMainContentSpeech(): string {
  const main = getReadableRoot();
  const clone = main.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(SKIP_SPEECH_SELECTORS).forEach((el) => el.remove());

  const text = clone.innerText.replace(/\s+/g, " ").trim();
  if (!text) return "Página sin texto legible.";
  if (text.length > 4000) return `${text.slice(0, 4000)}.`;
  return text;
}

export const ASSISTED_READING_HELP =
  "Modo lectura asistida activo. Usa Tab para moverte. Atajos: Alt más R lee la página, Alt más S detiene la voz, Alt más H ayuda. En formularios, usa el botón del micrófono para dictar correo y contraseña.";
