import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import InlineScript from "@/components/InlineScript"
import "@/styles/globals.sass"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Poppins is kept for the Scrumify wordmark
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Scrumify",
  description: "Scrumify mission is to help you manage your agile projects!",
  icons: { icon: "/favicon.svg" },
}

export const viewport: Viewport = {
  themeColor: "#14171f",
}

// Apply the saved theme before first paint so light mode doesn't flash dark
const themeScript = `try{var t=JSON.parse(localStorage.getItem("scrumify:v2")).state.theme;if(t)document.documentElement.dataset.theme=t}catch(e){}`

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" className={`${inter.variable} ${poppins.variable}`} data-theme="dark" suppressHydrationWarning>
    <head>
      <InlineScript html={themeScript} />
    </head>
    <body>{children}</body>
  </html>
)

export default RootLayout
