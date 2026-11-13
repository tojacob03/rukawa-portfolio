// The one module entry of index.html. On / the page is the static home page
// (built with tasteskill): this loads its kit scripts, in order. Every other
// path reaches this file through the host's SPA fallback: there it removes the
// home page and starts the React app, whose code and styles load only then.

const HOME_SCRIPTS = ["/home/home.js"];

async function startHome() {
  // Public files are served unchanged. A module script loads them directly;
  // import() makes Vite request a source transform that public files cannot use.
  for (const src of HOME_SCRIPTS) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "module";
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load home script: ${src}`));
      document.body.appendChild(script);
    });
  }
}

async function startApp() {
  document.querySelectorAll("[data-home]").forEach((node) => node.remove());
  const html = document.documentElement;
  for (const name of ["data-type", "data-radius", "data-buttons", "data-motion"]) html.removeAttribute(name);
  html.removeAttribute("class");
  html.removeAttribute("style");
  const root = document.createElement("div");
  root.id = "root";
  document.body.replaceChildren(root);
  await import("./main");
}

void (/^\/(index\.html)?$/.test(location.pathname) ? startHome() : startApp());
