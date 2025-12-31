"use client"

import { useState } from "react"
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"

export function CheckoutForm({ clientSecret, pickupDate }: { clientSecret: string; pickupDate: Date }) {
    const stripe = useStripe()
    const elements = useElements()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const { items, clearCart } = useCartStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements) return

        setIsLoading(true)

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        })

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.")
            toast.error(error.message)
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            <Button
                disabled={!stripe || isLoading}
                className="w-full bg-primary text-primary-foreground font-serif text-lg py-6"
            >
                {isLoading ? "Processing..." : "Pay Now"}
            </Button>
        </form>
    )
}
