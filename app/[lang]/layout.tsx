import { TRANSLATED_LOCALES } from "@/lib/i18n"

// 英語・簡体字版のルートレイアウト。実装は日本語版と共用し、言語はroot param(lang)で切り替える
export { default, generateMetadata } from "@/app/(ja)/layout"

export const generateStaticParams = () => TRANSLATED_LOCALES.map((lang) => ({ lang }))

export const dynamicParams = false
