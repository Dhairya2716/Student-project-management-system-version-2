"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm" aria-label="Toggle theme">
                <span className="h-5 w-5 block" />
            </button>
        )
    }

    return (
        <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="group relative p-2.5 rounded-xl bg-white/80 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <Sun className={`absolute inset-0 h-5 w-5 text-amber-500 transition-all duration-500 ${resolvedTheme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                    }`} />
                {/* Moon icon */}
                <Moon className={`absolute inset-0 h-5 w-5 text-indigo-400 transition-all duration-500 ${resolvedTheme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                    }`} />
            </div>
            {/* Hover glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-orange-400/0 dark:from-indigo-400/0 dark:to-purple-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 dark:group-hover:from-indigo-400/10 dark:group-hover:to-purple-400/10 transition-all duration-300" />
        </button>
    )
}
