import type { Metadata } from "next"
import { FC } from "react"
import { Breadcrumb } from "@/components/elements/breadcrumb"
import { SITE_NAME } from "@/lib/seo"

const title = "このサイトについて"
const description = `${SITE_NAME}は、上野エリアのイベント・新店舗・セール・展示会などの最新情報をまとめる地域メディア。`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", title, description, siteName: SITE_NAME },
  twitter: { card: "summary", title, description },
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  margin: "0 0 .5rem",
}

const paragraphStyle: React.CSSProperties = {
  fontSize: ".875rem",
  color: "#7a7468",
  lineHeight: 1.7,
  margin: 0,
}

const Page: FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <Breadcrumb items={[{ label: "このサイトについて" }]} />
    <h1 style={{ fontSize: "1.125rem", margin: 0 }}>{title}</h1>

    <section>
      <h2 style={sectionTitleStyle}>{SITE_NAME}について</h2>
      <p style={paragraphStyle}>
        {SITE_NAME}は、上野エリアのイベント・新店舗・閉店・セール・POP
        UP・展示会・施設などの最新情報をまとめる地域メディア。上野公園・上野駅
        周辺の話題を日々更新している。
      </p>
    </section>

    <section>
      <h2 style={sectionTitleStyle}>運営</h2>
      <p style={paragraphStyle}>運営: 株式会社Reload</p>
    </section>

    <section>
      <h2 style={sectionTitleStyle}>掲載情報について</h2>
      <p style={paragraphStyle}>
        掲載情報は独自取材および公開情報をもとに作成している。内容には注意を
        払っているが、店舗・イベントの詳細（日程・料金・営業時間など）は変更
        される場合があるため、利用の際は各店舗・主催者の公式情報もあわせて
        確認すること。
      </p>
    </section>
  </div>
)

export default Page
