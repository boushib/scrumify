import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import "@/index.sass"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Scrumify",
  description: "Scrumify mission is to help you manage your agile projects!",
  icons: { icon: "/favicon.svg" },
}

export const viewport: Viewport = {
  themeColor: "#161B28",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={poppins.variable}>
    <body>{children}</body>
  </html>
)

export default RootLayout
