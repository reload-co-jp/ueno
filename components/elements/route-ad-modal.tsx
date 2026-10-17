"use client"

import NextLink from "next/link"
import { usePathname } from "next/navigation"
import { FC, useEffect, useRef, useState } from "react"
import { AdSlot } from "@/components/elements/ad-slot"

// クライアント側のページ遷移2回に1回、全画面広告とおすすめ記事を出す。
// ネイティブ<dialog>のshowModal()は子の広告push後に開くため広告幅0で失敗する→開いている間だけ描画する
export const RouteAdModal: FC<{
  links: { href: string; title: string }[]
  heading: string
}> = ({ links, heading }) => {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const navCount = useRef(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (prevPathname.current === pathname) return
    prevPathname.current = pathname
    navCount.current += 1
    if (navCount.current % 2 === 0) setOpen(true)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  if (!open) return null

  const close = () => setOpen(false)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        style={{
          alignSelf: "flex-end",
          width: "2.5rem",
          height: "2.5rem",
          fontSize: "1.5rem",
          lineHeight: 1,
          color: "#fff",
          background: "rgba(255,255,255,.2)",
          border: "none",
          borderRadius: "50%",
          cursor: "pointer",
        }}
      >
        ×
      </button>
      <div style={{ width: "100%", maxWidth: 728 }}>
        <AdSlot key={pathname} />
      </div>
      {links.length > 0 && (
        <nav
          style={{
            width: "100%",
            maxWidth: 728,
            maxHeight: "40dvh",
            overflowY: "auto",
            background: "#fff",
            borderRadius: 8,
            padding: "1rem",
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: ".5rem" }}>{heading}</p>
          <ul style={{ display: "grid", gap: ".5rem" }}>
            {links.map((link) => (
              <li key={link.href}>
                <NextLink href={link.href} onClick={close}>
                  {link.title}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
