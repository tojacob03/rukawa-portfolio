// page-flip 2.0.7 (StPageFlip) ships no type definitions; these cover the part
// of its API the Off the clock passport uses (src/components/offTheClock/PageFlipBook.tsx).
declare module "page-flip" {
  export type FlipCorner = "top" | "bottom";
  export type Orientation = "portrait" | "landscape";

  export interface FlipSetting {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    startPage?: number;
  }

  export class PageFlip {
    constructor(element: HTMLElement, setting: FlipSetting);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(page: number, corner?: FlipCorner): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): Orientation;
    on(event: "flip" | "changeOrientation" | "changeState" | "init" | "update", callback: (e: { data: unknown; object: PageFlip }) => void): PageFlip;
    destroy(): void;
  }
}
