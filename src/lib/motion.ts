/**
 * The site's one easing curve: exponential ease-out, a fast start and a long
 * gentle settle. Same values as --ease-out-expo in index.css, so CSS
 * transitions and framer-motion share one motion language.
 */
export const EASE = [0.16, 1, 0.3, 1] as const;
