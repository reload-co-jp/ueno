import NextLink from "next/link"
import { ComponentProps, FC } from "react"
import { getLocale, localePath } from "@/lib/i18n"

// 内部リンク。現在の言語のパスプレフィックス(/en, /zh-cn)を付与する
export const Link: FC<
  ComponentProps<typeof NextLink> & { href: string }
> = async ({ href, ...props }) => (
  <NextLink href={localePath(await getLocale(), href)} {...props} />
)
