import { useEffect } from "react";

// Downloads the images after the page has loaded and keeps them cached while
// the component is mounted; `srcs` must be memoized to avoid restarting.
export default function usePreloadImages(srcs: string[]) {
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    const preload = () => {
      for (const src of srcs) {
        const image = new window.Image();
        image.src = src;
        images.push(image);
      }
    };

    if (document.readyState === "complete") {
      preload();
    } else {
      window.addEventListener("load", preload, { once: true });
    }
    return () => {
      window.removeEventListener("load", preload);
      // Clearing src stops any download still in progress.
      for (const image of images) {
        image.removeAttribute("src");
      }
    };
  }, [srcs]);
}
