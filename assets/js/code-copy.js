const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

const copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch (_) {
  }

  if (!fallbackCopy(text)) {
    throw new Error("Browser refused to write to clipboard");
  }
};

const setCopyState = (button, state) => {
  window.clearTimeout(button.copyResetTimer);
  button.classList.toggle("is-copied", state === "copied");
  button.setAttribute("aria-label", state === "copied" ? "Code copied" : "Copy code");
  button.title = state === "copied" ? "Copied" : "Copy code";

  if (state === "copied") {
    button.copyResetTimer = window.setTimeout(() => setCopyState(button, "idle"), 1800);
  }
};

const initialiseCodeCopy = () => {
  document.querySelectorAll(".sc-code__copy").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".sc-code")?.querySelector("pre code");
      if (!code) return;

      try {
        await copyText(code.textContent);
        setCopyState(button, "copied");
      } catch (error) {
        console.warn("Code copy failed", error);
      }
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialiseCodeCopy, { once: true });
} else {
  initialiseCodeCopy();
}
