export const SITE_URL = "https://ueno.reload.co.jp"
export const SITE_NAME = "上野ライブ"

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`

// JSON-LDを<script>に埋め込む際、</script>による早期終了・タグインジェクションを防ぐ
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c")
