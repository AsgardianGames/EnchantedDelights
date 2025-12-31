import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/ui/product-card'

export interface CartItem extends Product {
    quantity: number
}

interface CartState {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    total: number
    tax: number
}

// Fixed Tax Rate: 8.2% (Lewis County, WA)
const TAX_RATE = 0.082

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            tax: 0,
            addItem: (product) => {
                const items = get().items
                const existingItem = items.find((item) => item.id === product.id)
                let updatedItems

                if (existingItem) {
                    updatedItems = items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                } else {
                    updatedItems = [...items, { ...product, quantity: 1 }]
                }

                const subtotal = updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
                const tax = subtotal * TAX_RATE

                set({
                    items: updatedItems,
                    tax,
                    total: subtotal + tax,
                })
            },
            removeItem: (productId) => {
                const items = get().items.filter((item) => item.id !== productId)
                const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
                const tax = subtotal * TAX_RATE
                set({
                    items,
                    tax,
                    total: subtotal + tax,
                })
            },
            updateQuantity: (productId, quantity) => {
                const items = get().items.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
                const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
                const tax = subtotal * TAX_RATE
                set({
                    items,
                    tax,
                    total: subtotal + tax,
                })
            },
            clearCart: () => {
                set({ items: [], total: 0, tax: 0 })
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
