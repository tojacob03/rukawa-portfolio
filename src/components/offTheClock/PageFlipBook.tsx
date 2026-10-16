import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from "react";
import { PageFlip, type FlipSetting, type Orientation } from "page-flip";

export type BookState = { index: number; count: number; orientation: Orientation };
export type PageFlipBookHandle = { flipNext: () => void; flipPrev: () => void; flip: (page: number) => void };

/**
 * A thin React wrapper around StPageFlip (page-flip 2.0.7, pinned).
 *
 * The library moves the page elements into its own wrapper, and its
 * destroy() removes that wrapper and the root element. React keeps
 * rendering into the pages themselves, so their content can change at any
 * time, but the set of top-level pages must stay the same while the book
 * is mounted. On unmount the pages and the root go back where React put
 * them, so React can remove them as usual.
 */
const PageFlipBook = forwardRef<PageFlipBookHandle, { settings: FlipSetting; onChange?: (state: BookState) => void; children: ReactNode }>(
  ({ settings, onChange, children }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const bookRef = useRef<PageFlip | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Settings are read once, as the library itself does.
    const settingsRef = useRef(settings);

    useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const pages = Array.from(root.children) as HTMLElement[];
      const book = new PageFlip(root, settingsRef.current);
      book.loadFromHTML(pages);
      const emit = () =>
        onChangeRef.current?.({ index: book.getCurrentPageIndex(), count: book.getPageCount(), orientation: book.getOrientation() });
      book.on("flip", emit);
      book.on("changeOrientation", emit);
      book.on("init", emit);
      bookRef.current = book;
      emit();

      return () => {
        const parent = root.parentNode;
        const next = root.nextSibling;
        book.destroy();
        bookRef.current = null;
        pages.forEach((page) => root.appendChild(page));
        parent?.insertBefore(root, next);
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        flipNext: () => bookRef.current?.flipNext(),
        flipPrev: () => bookRef.current?.flipPrev(),
        flip: (page: number) => bookRef.current?.flip(page),
      }),
      [],
    );

    return <div ref={rootRef}>{children}</div>;
  },
);
PageFlipBook.displayName = "PageFlipBook";

export default PageFlipBook;
