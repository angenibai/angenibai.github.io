import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { Newsreader } from "next/font/google";
import { Work_Sans } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import useRouteTransition from "@/hooks/useRouteTransition";

const work_sans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
});

const ibm_plex_mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  // Site level transition animation
  useRouteTransition();

  return (
    <>
      <DefaultSeo
        title="angeni bai"
        description="angeni's website"
        additionalLinkTags={[
          {
            rel: "icon",
            href: "/img/balloon-sloth/balloon-sloth.svg",
          },
        ]}
        additionalMetaTags={[
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
          },
        ]}
      />
      <div
        className={`${work_sans.variable} ${newsreader.variable} ${ibm_plex_mono.variable}`}
      >
        <Component {...pageProps} />
      </div>
    </>
  );
}
