import { Fragment } from "react"
import styles from "./Markdown.module.sass"

/*
 * A small Markdown subset for descriptions: headings, bullet and numbered
 * lists, **bold**, *italic*, `code` and [links](https://…). Everything is
 * rendered as React elements, so user text is never injected as HTML.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g

const renderInline = (text: string) =>
  text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      const safe = /^https?:\/\//i.test(link[2])
      return safe ? (
        <a key={i} href={link[2]} target="_blank" rel="noreferrer noopener">
          {link[1]}
        </a>
      ) : (
        <Fragment key={i}>{link[1]}</Fragment>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>
    return <Fragment key={i}>{part}</Fragment>
  })

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "h"; level: number; text: string }
  | { kind: "ul" | "ol"; items: string[] }

const parse = (source: string): Block[] => {
  const blocks: Block[] = []
  for (const line of source.split("\n")) {
    const last = blocks[blocks.length - 1]
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (!line.trim()) blocks.push({ kind: "p", lines: [] })
    else if (heading) blocks.push({ kind: "h", level: heading[1].length, text: heading[2] })
    else if (bullet) {
      if (last?.kind === "ul") last.items.push(bullet[1])
      else blocks.push({ kind: "ul", items: [bullet[1]] })
    } else if (numbered) {
      if (last?.kind === "ol") last.items.push(numbered[1])
      else blocks.push({ kind: "ol", items: [numbered[1]] })
    } else if (last?.kind === "p") last.lines.push(line)
    else blocks.push({ kind: "p", lines: [line] })
  }
  return blocks.filter(b => b.kind !== "p" || b.lines.length)
}

const Markdown = ({ source, className }: { source: string; className?: string }) => (
  <div className={[styles.markdown, className].filter(Boolean).join(" ")}>
    {parse(source).map((block, i) => {
      if (block.kind === "h") {
        const Tag = `h${block.level + 2}` as "h3" | "h4" | "h5"
        return <Tag key={i}>{renderInline(block.text)}</Tag>
      }
      if (block.kind !== "p") {
        const Tag = block.kind
        return (
          <Tag key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </Tag>
        )
      }
      return (
        <p key={i}>
          {block.lines.map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {renderInline(line)}
            </Fragment>
          ))}
        </p>
      )
    })}
  </div>
)

export default Markdown
