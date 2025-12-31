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
import { ShoppingBasket, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function CartSheet() {
    const { items, total, removeItem } = useCartStore()
    const [mounted, setMounted] = useState(false)

    // Hydration fix
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingBasket className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                            {items.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Your Order</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4 h-[calc(100vh-200px)] overflow-y-auto">
                    {items.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Your cart is empty.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-4">
                                <div className="flex flex-col">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-sm text-muted-foreground">{formatCurrency(item.price)} x {item.quantity}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <SheetFooter className="flex-col gap-4 sm:flex-col">
                    <div className="flex justify-between items-center w-full text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    <SheetClose asChild>
                        <Button asChild className="w-full bg-primary text-primary-foreground" disabled={items.length === 0}>
                            <Link href="/checkout">Checkout</Link>
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
