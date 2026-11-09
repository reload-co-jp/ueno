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
  SisterSitesNav,
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

// トップページのタイトル。「上野 イベント」で検索されるようにエリア名＋イベントを先頭に置く
const HOME_TITLES: Texts = {
  ja: "上野のイベント情報【毎日更新】今日・今週末の予定と展覧会・新店舗",
  en: "Ueno Events Today & This Weekend | Exhibitions & New Shops",
  "zh-cn": "上野活动资讯【每日更新】今日・本周末活动与展览・新店",
}
const DESCRIPTIONS: Texts = {
  ja: "上野で今日・今週末・今月に開催されるイベントを毎日更新。上野公園・東京国立博物館・東京都美術館・国立西洋美術館の展覧会、上野・御徒町のマルシェや催し物、POP UP・セール、新店舗まで上野の今がわかる地域メディア。",
  en: "Daily-updated events in Ueno, Tokyo: exhibitions at Ueno Park, the Tokyo National Museum and the Tokyo Metropolitan Art Museum, markets and events around Ueno and Okachimachi, pop-ups, sales and new shops.",
  "zh-cn":
    "每日更新东京上野今日・本周末・本月的活动。上野公园、东京国立博物馆、东京都美术馆的展览，上野・御徒町的市集与活动，快闪店、促销与新店资讯。",
}

// 日本語(app/(ja))・英語/簡体字(app/[lang])の両ルートレイアウトで共用
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocale()
  const siteName = SITE_NAMES[locale]
  const title = `${HOME_TITLES[locale]}${locale === "en" ? " | " : "｜"}${siteName}`
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
          <SisterSitesNav />
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
