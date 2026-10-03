import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import site from "@/lib/site";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Newsreader } from "next/font/google";
import { Work_Sans } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";
import useRouteTransition from "@/hooks/useRouteTransition";
import usePressedCursor from "@/hooks/usePressedCursor";

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
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  // Site level transition animation
  useRouteTransition();
  usePressedCursor();

  return (
    <>
      <DefaultSeo
        title={site.name}
        description={site.description}
        openGraph={{ type: "website", siteName: site.name, locale: "en_AU" }}
        twitter={{ cardType: "summary" }}
        additionalLinkTags={[
          {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/img/balloon-sloth/favicon-32.png",
          },
          {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/img/balloon-sloth/apple-touch-icon.png",
          },
          {
            rel: "alternate",
            type: "application/rss+xml",
            href: "/feed.xml",
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
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId={site.googleAnalyticsId} />
      )}
    </>
  );
}
