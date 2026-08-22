import { Footer, Header, Main, Nav, Title } from "@/components/elements/layout"
import "./reset.css"

export const metadata = {
  title: "上野ナビ | 上野地域メディア",
  description: "上野エリアのイベント・新店舗・セール・展示会などの最新情報",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ja">
      <body>
        <Header>
          <Title>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>
              上野ナビ
            </a>
          </Title>
          <Nav />
        </Header>
        <Main>{children}</Main>
        <Footer>
          <p>&copy; 上野ナビ</p>
        </Footer>
      </body>
    </html>
  )
}
export default RootLayout
