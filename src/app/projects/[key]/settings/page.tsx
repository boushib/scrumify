import type { Metadata } from "next"
import SettingsView from "@/views/Settings"

export const metadata: Metadata = { title: "Settings | Scrumify" }

const SettingsPage = () => <SettingsView />

export default SettingsPage
