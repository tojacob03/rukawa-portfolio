# Architecture rules

- Load the static homepage's public JavaScript through module script elements, sequentially, and keep the React app lazy-loaded on other paths; Vite cannot transform public files imported from source code.