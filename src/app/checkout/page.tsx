"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { useCartStore } from "@/store/cart-store"
import { CheckoutForm } from "@/components/checkout-form"
import { Calendar } from "@/components/ui/calendar"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { addDays, format } from "date-fns"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState("")
    const [pickupDate, setPickupDate] = useState<Date | undefined>()
    const { items, total } = useCartStore()
    const [isLoading, setIsLoading] = useState(false)
    const [pickupDays, setPickupDays] = useState<number[]>([]) // Default empty until fetch
    const [daysLoaded, setDaysLoaded] = useState(false)

    // Fetch Allowed Pickup Days
    useEffect(() => {
        const fetchSettings = async () => {
            const supabase = createClient()
            const { data } = await supabase.from('store_settings').select('pickup_days').single()
            if (data) {
                setPickupDays(data.pickup_days || [0, 1, 2, 3, 4, 5, 6])
            } else {
                setPickupDays([0, 1, 2, 3, 4, 5, 6]) // Fallback all days
            }
            setDaysLoaded(true)
        }
        fetchSettings()
    }, [])

    // Minimum date is tomorrow
    const tomorrow = addDays(new Date(), 1)

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
            setClientSecret(data.clientSecret)
        } catch (error) {
            console.error(error)
            toast.error((error as Error).message || "Something went wrong")
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
        <div className="min-h-screen container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-serif text-primary mb-12 text-center">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Left Col: Date Selection */}
                <div className="space-y-6">
                    <div className="bg-card border rounded-xl p-8 shadow-sm flex flex-col items-center">
                        <h2 className="text-xl font-serif mb-4">1. Choose Pickup Date</h2>
                        <p className="text-muted-foreground text-sm mb-6 text-center">
                            Orders require 24h notice.
                        </p>

                        <Calendar
                            mode="single"
                            selected={pickupDate}
                            onSelect={setPickupDate}
                            disabled={(date) => {
                                const isBeforeTomorrow = date < tomorrow
                                const isDayAllowed = pickupDays.includes(date.getDay())
                                return isBeforeTomorrow || !isDayAllowed
                            }}
                            className="rounded-md border shadow p-4 bg-background"
                        />

                        {pickupDate && (
                            <p className="mt-4 text-primary font-medium">
                                Selected: {format(pickupDate, "PPP")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Col: Summary & Payment */}
                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm">
                        <h2 className="text-xl font-serif mb-6">Order Summary</h2>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(total / 1.082)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (8.2%)</span>
                                <span>{formatCurrency(total - (total / 1.082))}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Payment or Confirm Date Button */}
                    {!clientSecret ? (
                        <Button
                            onClick={initializePayment}
                            disabled={!pickupDate || isLoading}
                            className="w-full h-14 text-lg rounded-xl shadow-lg transition-all hover:scale-[1.02] bg-emerald-700 hover:bg-emerald-800 text-white border-2 border-emerald-600"
                        >
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Continue to Payment
                        </Button>
                    ) : (
                        stripePromise && (
                            <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-serif mb-6">2. Payment Details</h2>
                                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#d4af37' } } }}>
                                    <CheckoutForm clientSecret={clientSecret} pickupDate={pickupDate!} />
                                </Elements>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
