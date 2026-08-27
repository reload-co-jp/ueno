import { FC } from "react"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

const linkColor = "#c0483a"

export const ArticleBody: FC<{ body: string }> = ({ body }) => (
  <div style={{ fontSize: ".9375rem", lineHeight: 1.8 }}>
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h2 style={{ fontSize: "1.125rem", margin: "1.5rem 0 .75rem" }}>{children}</h2>
        ),
        h2: ({ children }) => (
          <h3 style={{ fontSize: "1.0625rem", margin: "1.5rem 0 .75rem" }}>{children}</h3>
        ),
        h3: ({ children }) => (
          <h4 style={{ fontSize: "1rem", margin: "1.25rem 0 .5rem" }}>{children}</h4>
        ),
        p: ({ children }) => <p style={{ margin: "0 0 1rem" }}>{children}</p>,
        ul: ({ children }) => (
          <ul style={{ margin: "0 0 1rem", paddingLeft: "1.25rem" }}>{children}</ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: "0 0 1rem", paddingLeft: "1.25rem" }}>{children}</ol>
        ),
        li: ({ children }) => <li style={{ margin: ".25rem 0" }}>{children}</li>,
        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noreferrer" style={{ color: linkColor }}>
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote
            style={{
              margin: "0 0 1rem",
              padding: ".5rem 1rem",
              borderLeft: "3px solid #e8e1d3",
              color: "#7a7468",
            }}
          >
            {children}
          </blockquote>
        ),
        hr: () => <hr style={{ border: "none", borderTop: "1px solid #e8e1d3", margin: "1.5rem 0" }} />,
        table: ({ children }) => (
          <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: ".875rem" }}>
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th
            style={{
              textAlign: "left",
              padding: ".5rem",
              borderBottom: "2px solid #e8e1d3",
            }}
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td style={{ padding: ".5rem", borderBottom: "1px solid #e8e1d3" }}>{children}</td>
        ),
        code: ({ children }) => (
          <code
            style={{
              background: "#f3f0e8",
              borderRadius: ".25rem",
              padding: ".125rem .375rem",
              fontSize: ".875em",
            }}
          >
            {children}
          </code>
        ),
      }}
    >
      {body}
    </Markdown>
  </div>
)
