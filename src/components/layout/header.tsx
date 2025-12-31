"use client"

import Link from "next/link"
import { CartSheet } from "@/components/cart-sheet"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { User, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-8 flex items-center space-x-2">
                        <span className="font-serif text-xl font-bold text-primary tracking-widest pl-2">ENCHANTED DELIGHTS</span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname === "/" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Home
                        </Link>
                        <Link
                            href="/#menu"
                            className={cn(
                                "transition-colors hover:text-foreground/80",
                                pathname.includes("menu") ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Menu
                        </Link>
                        <Link
                            href="/dashboard/menu"
                            className={cn(
                                "transition-colors hover:text-foreground/80 hidden sm:block", // Hide on mobile if too crowded, or keep.
                                pathname === "/dashboard/menu" ? "text-foreground" : "text-foreground/60"
                            )}
                        >
                            Manage Menu
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/profile">
                            <UserCircle className="h-5 w-5" />
                        </Link>
                    </Button>
                    <CartSheet />
                </div>
            </div>
        </header>
    )
}
