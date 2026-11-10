// The one module entry of index.html. On / the page is the static home page
// (built with tasteskill): this loads its kit scripts, in order. Every other
// path reaches this file through the host's SPA fallback: there it removes the
// home page and starts the React app, whose code and styles load only then.

const HOME_SCRIPTS = ["/assets/system.js", "/assets/motion/motion.js", "/assets/layout/layout.js"];

async function startHome() {
  for (const src of HOME_SCRIPTS) await import(/* @vite-ignore */ src);
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
