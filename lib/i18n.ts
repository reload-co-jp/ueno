// 多言語対応(日本語=ルート、英語=/en、簡体字=/zh-cn)。
// 記事・施設・店舗の抽出/判定ロジックは日本語データのまま行い、表示時にのみ翻訳を重ねる
// (ジャンル判定・無料判定等が日本語キーワードに依存するため)
import { lang } from "next/root-params"
import enJson from "@/data/i18n/en.json"
import zhCnJson from "@/data/i18n/zh-cn.json"
import { getArticleImage, getArticleSpots } from "@/lib/data"
import {
  CATEGORY_LABELS,
  type Category,
  type NewsArticle,
  type Spot,
  type Store,
  type Translations,
} from "@/lib/types"

export const LOCALES = ["ja", "en", "zh-cn"] as const
export type Locale = (typeof LOCALES)[number]
export type TranslatedLocale = Exclude<Locale, "ja">
export const TRANSLATED_LOCALES: TranslatedLocale[] = ["en", "zh-cn"]

export const LOCALE_META: Record<
  Locale,
  { hreflang: string; og: string; label: string }
> = {
  ja: { hreflang: "ja", og: "ja_JP", label: "日本語" },
  en: { hreflang: "en", og: "en_US", label: "English" },
  "zh-cn": { hreflang: "zh-Hans", og: "zh_CN", label: "简体中文" },
}

export type Texts<T = string> = Record<Locale, T>

const TRANSLATIONS: Record<TranslatedLocale, Translations> = {
  en: enJson as Translations,
  "zh-cn": zhCnJson as Translations,
}

// ルート(日本語)はroot paramを持たないためundefined→ja
export const getLocale = async (): Promise<Locale> => {
  const value = await lang()
  return value === "en" || value === "zh-cn" ? value : "ja"
}

export const localePath = (locale: Locale, path: string) =>
  locale === "ja" ? path : `/${locale}${path === "/" ? "" : path}`

// 未翻訳の記事は英語・簡体字版で日本語のまま表示されるため、noindex・sitemap除外に使う
export const isArticleTranslated = (id: string, locale: Locale) =>
  locale === "ja" || !!TRANSLATIONS[locale].news[id]

// 未翻訳(翻訳スクリプト未実行の新着記事等)は日本語のまま表示する
export const localizeArticle = <T extends NewsArticle>(
  article: T,
  locale: Locale
): T =>
  locale === "ja"
    ? article
    : { ...article, ...TRANSLATIONS[locale].news[article.id]?.fields }

export const localizeSpot = (spot: Spot, locale: Locale): Spot =>
  locale === "ja"
    ? spot
    : { ...spot, ...TRANSLATIONS[locale].spots[spot.id]?.fields }

export const localizeStore = (store: Store, locale: Locale): Store =>
  locale === "ja"
    ? store
    : { ...store, ...TRANSLATIONS[locale].stores[store.id]?.fields }

// getArticleImageの言語対応版。施設画像へのフォールバック判定は日本語原文で行い、altのみ翻訳する
export const localizeArticleImage = (article: NewsArticle, locale: Locale) => {
  if (locale === "ja") return getArticleImage(article)
  if (article.imageUrl) return { url: article.imageUrl, alt: localizeArticle(article, locale).title }
  const spot = getArticleSpots(article).find((s) => s.imageUrl)
  return spot?.imageUrl ? { url: spot.imageUrl, alt: localizeSpot(spot, locale).name } : null
}

const CATEGORY_LABELS_I18N: Record<
  TranslatedLocale,
  Record<Category, string>
> = {
  en: {
    event: "Event",
    new_opening: "New Opening",
    closing: "Closing",
    renewal: "Renewal",
    sale: "Sale",
    campaign: "Campaign",
    popup: "Pop-up",
    new_product: "New Product",
    exhibition: "Exhibition",
    facility_news: "Facility News",
    local_news: "Local News",
  },
  "zh-cn": {
    event: "活动",
    new_opening: "新店开业",
    closing: "闭店",
    renewal: "重新装修",
    sale: "促销",
    campaign: "优惠活动",
    popup: "快闪店",
    new_product: "新品",
    exhibition: "展览",
    facility_news: "设施新闻",
    local_news: "本地新闻",
  },
}

export const categoryLabel = (category: Category, locale: Locale) =>
  locale === "ja"
    ? CATEGORY_LABELS[category]
    : CATEGORY_LABELS_I18N[locale][category]

// ページ内で使う言語依存ヘルパーをまとめて返す
export const getI18n = async () => {
  const locale = await getLocale()
  return {
    locale,
    t: <T>(texts: Texts<T>) => texts[locale],
    path: (p: string) => localePath(locale, p),
    article: <T extends NewsArticle>(a: T) => localizeArticle(a, locale),
    spot: (s: Spot) => localizeSpot(s, locale),
    store: (s: Store) => localizeStore(s, locale),
    image: (a: NewsArticle) => localizeArticleImage(a, locale),
    category: (c: Category) => categoryLabel(c, locale),
  }
}
