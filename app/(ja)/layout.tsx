import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Noto_Sans_JP, WDXL_Lubrifont_JP_N } from "next/font/google"
import Script from "next/script"
import { AdSlot } from "@/components/elements/ad-slot"
import { LanguageSwitcher } from "@/components/elements/language-switcher"
import {
  BottomNav,
  Footer,
  FooterNav,
  Header,
  Main,
  Nav,
  SearchForm,
  Title,
} from "@/components/elements/layout"
import { Link } from "@/components/elements/link"
import { getI18n, getLocale, LOCALE_META, type Texts } from "@/lib/i18n"
import {
  jsonLdString,
  localeAlternates,
  pageUrl,
  SITE_NAMES,
  SITE_URL,
} from "@/lib/seo"
import "../reset.css"

const GA_MEASUREMENT_ID = "G-FXDVEZ8JN2"
const ADSENSE_CLIENT_ID = "ca-pub-6542845006087970"

const TAGLINES: Texts = {
  ja: "上野地域メディア",
  en: "Ueno Local News",
  "zh-cn": "上野本地资讯",
}
const DESCRIPTIONS: Texts = {
  ja: "上野エリアのイベント・新店舗・セール・展示会などの最新情報",
  en: "The latest events, new shops, sales and exhibitions in Ueno, Tokyo",
  "zh-cn": "东京上野地区的活动、新店、促销、展览等最新资讯",
}

// 日本語(app/(ja))・英語/簡体字(app/[lang])の両ルートレイアウトで共用
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale()
  const siteName = SITE_NAMES[locale]
  const title = `${siteName} | ${TAGLINES[locale]}`
  const description = DESCRIPTIONS[locale]
  const alternates = localeAlternates(locale, "/")
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: locale === "en" ? `%s | ${siteName}` : `%s｜${siteName}`,
    },
    description,
    alternates,
    openGraph: {
      type: "website",
      locale: LOCALE_META[locale].og,
      url: alternates.canonical,
      siteName,
      title,
      description,
      // app/opengraph-image.tsx はルートレイアウト外にあり自動付与されないため明示する
      images: ["/opengraph-image"],
    },
    twitter: { card: "summary", title, description },
  }
}

const lubrifont = WDXL_Lubrifont_JP_N({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
  variable: "--font-lubrifont",
})

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
})

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const { locale, path } = await getI18n()
  const siteName = SITE_NAMES[locale]
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: pageUrl(path("/")),
    inLanguage: LOCALE_META[locale].hreflang,
  }
  return (
    <html
      lang={LOCALE_META[locale].hreflang}
      className={`${notoSans.className} ${lubrifont.variable}`}
    >
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
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              {siteName}
            </Link>
          </Title>
          <Nav />
          <SearchForm />
          <LanguageSwitcher />
        </Header>
        <Main>
          {children}
          <AdSlot />
        </Main>
        <Footer>
          <FooterNav />
          <p>&copy; {siteName}</p>
        </Footer>
        <BottomNav />
      </body>
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      )}
    </html>
  )
}
export default RootLayout
