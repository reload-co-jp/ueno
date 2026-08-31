import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { WDXL_Lubrifont_JP_N } from "next/font/google"
import Script from "next/script"
import { Footer, Header, Main, Nav, Title } from "@/components/elements/layout"
import { jsonLdString, SITE_NAME, SITE_URL } from "@/lib/seo"
import "./reset.css"

const GA_MEASUREMENT_ID = "G-FXDVEZ8JN2"
const ADSENSE_CLIENT_ID = "ca-pub-6542845006087970"

const description = "上野エリアのイベント・新店舗・セール・展示会などの最新情報"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | 上野地域メディア`, template: `%s | ${SITE_NAME}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | 上野地域メディア`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | 上野地域メディア`,
    description,
  },
}

const lubrifont = WDXL_Lubrifont_JP_N({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
})

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja" className={lubrifont.className}>
      <body>
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(websiteJsonLd) }}
        />
        <Header>
          <Title>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>
              {SITE_NAME}
            </a>
          </Title>
          <Nav />
        </Header>
        <Main>{children}</Main>
        <Footer>
          <p>&copy; {SITE_NAME}</p>
        </Footer>
      </body>
      {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  )
}
export default RootLayout
