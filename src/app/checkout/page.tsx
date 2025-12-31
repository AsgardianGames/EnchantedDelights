"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useCartStore } from "@/store/cart-store"
import { CheckoutForm } from "@/components/checkout-form"
import { DatePicker } from "@/components/ui/date-picker"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState("")
    const [pickupDate, setPickupDate] = useState<Date | undefined>()
    const { items, total } = useCartStore()
    const [isLoading, setIsLoading] = useState(false)

    // Auto-redirect if empty? 
    // For now just show empty message

    const initializePayment = async () => {
        if (!pickupDate) return
        setIsLoading(true)

        try {
            const res = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, pickupDate }),
            })

            if (!res.ok) throw new Error(await res.text())

            const data = await res.json()
            setClientSecret(data.clientSecret)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Your cart is empty.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen container mx-auto px-4 py-12 max-w-2xl text-center md:text-left">
            <h1 className="text-4xl font-serif text-primary mb-8 text-center">Checkout</h1>

            <div className="space-y-8">
                {/* Step 1: Review & Date */}
                {!clientSecret && (
                    <div className="bg-card border rounded-lg p-6 space-y-6">
                        <h2 className="text-2xl font-serif">1. Choose Pickup Date</h2>
                        <div className="flex flex-col gap-4">
                            <p className="text-muted-foreground text-sm">
                                Please select a pickup date. Note: We require 24 hours notice for all orders.
                            </p>
                            <div className="flex justify-center md:justify-start">
                                <DatePicker date={pickupDate} setDate={setPickupDate} />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between font-bold text-lg mb-6">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            <Button
                                onClick={initializePayment}
                                disabled={!pickupDate || isLoading}
                                className="w-full bg-primary h-12 text-lg"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Payment */}
                {clientSecret && stripePromise && (
                    <div className="bg-card border rounded-lg p-6">
                        <h2 className="text-2xl font-serif mb-6">2. Payment Details</h2>
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#d4af37' } } }}>
                            <CheckoutForm clientSecret={clientSecret} pickupDate={pickupDate!} />
                        </Elements>
                    </div>
                )}
            </div>
        </div>
    )
}
