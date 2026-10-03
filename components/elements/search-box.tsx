"use client"

import { useId, useRef, useState } from "react"
import type { SearchEntry } from "@/lib/search-index"

const LIMIT = 8

// 表記ゆれ吸収。キーが入力に含まれたら値のいずれかに一致すればよい
const SYNONYMS: Record<string, string[]> = {
  子供: ["子供", "子ども", "こども", "キッズ", "親子", "ファミリー"],
  子ども: ["子供", "子ども", "こども", "キッズ", "親子", "ファミリー"],
  こども: ["子供", "子ども", "こども", "キッズ", "親子", "ファミリー"],
  ぱんだ: ["パンダ", "ぱんだ", "panda"],
  パンダ: ["パンダ", "ぱんだ", "panda"],
}

const normalize = (s: string) => s.normalize("NFKC").toLowerCase().trim()

// 空白区切りの全語を含むものに絞る(AND検索)。並びはインデックス順=優先度順
export const filterEntries = (entries: SearchEntry[], query: string) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  return entries
    .filter((e) => terms.every((term) => (SYNONYMS[term] ?? [term]).some((v) => e.s.includes(v.toLowerCase()))))
    .slice(0, LIMIT)
}

export const SearchBox = ({
  locale,
  prefix,
  label,
  site,
}: {
  locale: string
  // 言語パスプレフィックス("" | "/en" | "/zh-cn")
  prefix: string
  label: string
  site: string
}) => {
  const id = useId()
  const [entries, setEntries] = useState<SearchEntry[] | null>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const loading = useRef(false)

  // 初回フォーカス時のみ取得。失敗時はサジェスト無しでGoogle検索として動く
  const load = () => {
    if (entries || loading.current) return
    loading.current = true
    fetch(`/search-index.${locale}.json`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {
        loading.current = false
      })
  }

  const results = entries ? filterEntries(entries, query) : []
  const shown = open && results.length > 0
  const href = (e: SearchEntry) => `${prefix}${e.h === "/" ? "" : e.h}`

  return (
    <form
      action="https://www.google.com/search"
      role="search"
      style={{ flex: "1 1 16rem", maxWidth: "24rem", position: "relative" }}
      onSubmit={(ev) => {
        // 候補選択中のEnterはサイト内遷移、それ以外はGoogleのサイト内検索
        if (shown && active >= 0) {
          ev.preventDefault()
          window.location.assign(href(results[active]))
        }
      }}
    >
      <input type="hidden" name="sitesearch" value={site} />
      <input
        type="search"
        name="q"
        role="combobox"
        aria-label={label}
        aria-expanded={shown}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={shown && active >= 0 ? `${id}-${active}` : undefined}
        autoComplete="off"
        placeholder={`🔍 ${label}`}
        value={query}
        onFocus={() => {
          load()
          setOpen(true)
        }}
        onBlur={() => setOpen(false)}
        onChange={(ev) => {
          setQuery(ev.target.value)
          setActive(-1)
          setOpen(true)
        }}
        onKeyDown={(ev) => {
          if (!shown) return
          if (ev.key === "ArrowDown") {
            ev.preventDefault()
            setActive((i) => (i + 1) % results.length)
          } else if (ev.key === "ArrowUp") {
            ev.preventDefault()
            setActive((i) => (i <= 0 ? results.length : i) - 1)
          } else if (ev.key === "Escape") {
            setOpen(false)
          }
        }}
        style={{
          width: "100%",
          padding: ".5rem .875rem",
          border: "1px solid var(--border)",
          borderRadius: "999px",
          background: "#fff",
          fontSize: ".875rem",
        }}
      />
      {shown && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + .375rem)",
            left: 0,
            right: 0,
            listStyle: "none",
            margin: 0,
            padding: ".25rem 0",
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: ".5rem",
            boxShadow: "0 .5rem 1.5rem rgba(0, 0, 0, .12)",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {results.map((e, i) => (
            <li key={e.h} id={`${id}-${i}`} role="option" aria-selected={i === active}>
              <a
                href={href(e)}
                className="row"
                // blurで一覧が閉じる前にクリックを確定させる
                onMouseDown={(ev) => ev.preventDefault()}
                onMouseEnter={() => setActive(i)}
                style={{
                  display: "block",
                  padding: ".5rem .875rem",
                  color: "var(--text)",
                  textDecoration: "none",
                  background: i === active ? "var(--accent-soft)" : undefined,
                }}
              >
                <span className="tag" style={{ marginRight: ".5rem" }}>
                  {e.k}
                </span>
                <span style={{ fontSize: ".875rem", fontWeight: 700 }}>{e.t}</span>
                {e.d && (
                  <span style={{ display: "block", fontSize: ".75rem", color: "var(--secondary)", marginTop: ".125rem" }}>
                    {e.d}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}
