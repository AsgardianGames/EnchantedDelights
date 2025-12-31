"use client"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"
import { ShoppingBasket, Trash2, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"

export function CartSheet() {
    const { items, total, removeItem, updateQuantity } = useCartStore()
    const [mounted, setMounted] = useState(false)

    // Hydration fix
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative border-none bg-transparent hover:bg-muted/50">
                    <ShoppingBasket className="h-6 w-6" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#primary] bg-orange-600 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                            {items.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="font-serif text-2xl text-center">Your Cart</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <ShoppingBasket className="h-12 w-12 opacity-20" />
                            <p>Your cart is empty.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 items-start">
                                {/* Thumbnail */}
                                <div className="h-20 w-20 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary">No Img</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-serif font-medium leading-none line-clamp-2">{item.name}</h4>
                                    <p className="text-sm font-semibold text-primary">{formatCurrency(item.price)}</p>

                                    {/* Qty Controls */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="flex items-center border rounded-full h-8 px-2 bg-background">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                className="p-1 hover:text-primary transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-primary transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <SheetFooter className="border-t pt-6 sm:flex-col gap-4 px-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-base">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold font-serif text-primary">
                            <span>Total</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <SheetClose asChild>
                        <Button asChild className="w-full h-12 text-lg rounded-full" disabled={items.length === 0}>
                            <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
