import type { Metadata } from "next"
import { GoogleAnalytics } from "@next/third-parties/google"
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google"
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
import { RouteAdModal } from "@/components/elements/route-ad-modal"
import { getLatestArticles, news } from "@/lib/data"
import {
  getI18n,
  getLocale,
  isArticleTranslated,
  LOCALE_META,
  type Texts,
} from "@/lib/i18n"
import { isEventArticle } from "@/lib/types"
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

// 見出し用の明朝体。本文・UIはNoto Sans JP
const mincho = Shippori_Mincho({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
})

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  display: "swap",
})

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const { locale, path, t, article } = await getI18n()
  // 遷移時広告モーダルのおすすめ。記事データをクライアントバンドルに含めないようここで絞り込む
  const recommendedLinks = getLatestArticles(news.length)
    .filter((a) => isArticleTranslated(a.id, locale))
    .slice(0, 5)
    .map((a) => ({
      href: path(isEventArticle(a) ? `/events/${a.id}` : `/articles/${a.id}`),
      title: article(a).title,
    }))
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
      className={`${notoSans.className} ${mincho.variable}`}
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
        <Header
          title={
            <Title>
              <Link href="/">
                <small>UENO LOCAL MAGAZINE</small>
                {siteName}
              </Link>
            </Title>
          }
          menuLabel={t({ ja: "メニュー", en: "Menu", "zh-cn": "菜单" })}
        >
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
          <p
            style={{
              opacity: 0.7,
              borderTop: "1px solid rgba(255,255,255,.2)",
              paddingTop: "1.5rem",
            }}
          >
            &copy; {siteName}
          </p>
        </Footer>
        <BottomNav />
        <RouteAdModal
          links={recommendedLinks}
          heading={t({
            ja: "おすすめ記事",
            en: "Recommended",
            "zh-cn": "推荐文章",
          })}
        />
      </body>
      {process.env.NODE_ENV === "production" && (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      )}
    </html>
  )
}
export default RootLayout
