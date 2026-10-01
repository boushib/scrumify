/**
 * Runs during HTML parsing on full page loads, before first paint. Rendered as
 * text/plain on the client so React doesn't warn about script tags (pattern
 * from the Next.js "Preventing flash before hydration" guide).
 */
const InlineScript = ({ html }: { html: string }) => (
  <script
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: html }}
  />
)

export default InlineScript
