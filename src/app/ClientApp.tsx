"use client"

import dynamic from "next/dynamic"

// The board reads and writes localStorage, so it only renders in the browser
const App = dynamic(() => import("@/App"), { ssr: false })

const ClientApp = () => <App />

export default ClientApp
