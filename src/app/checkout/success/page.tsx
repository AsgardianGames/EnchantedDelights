"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

function SuccessContent() {
    const searchParams = useSearchParams()
    const { clearCart } = useCartStore()
    const redirectStatus = searchParams.get("redirect_status")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (redirectStatus === "succeeded") {
            clearCart()
        }
    }, [redirectStatus, clearCart])

    if (!mounted) return null

    return (
        <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center space-y-6 shadow-lg">
            <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>

            <h1 className="text-3xl font-serif text-primary">Order Confirmed!</h1>

            <p className="text-muted-foreground">
                Thank you for your order. We have received your payment and will begin baking shortly.
            </p>

            <div className="pt-4 space-y-3">
                <Button asChild className="w-full h-12 text-lg">
                    <Link href="/profile">View Order Status</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        </div>
    )
}

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center container mx-auto px-4">
            <Suspense fallback={<div className="text-center">Loading...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    )
}
