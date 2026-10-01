import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar/"
import Board from "@/views/Board"

const App = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "dark")

  useEffect(() => {
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <div className="app" data-theme={theme}>
      <Navbar
        isLight={theme === "light"}
        onThemeChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
      <Board />
    </div>
  )
}

export default App
