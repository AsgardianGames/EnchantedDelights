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
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            total: 0,
            addItem: (product) => {
                const items = get().items
                const existingItem = items.find((item) => item.id === product.id)

                if (existingItem) {
                    const updatedItems = items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                    set({
                        items: updatedItems,
                        total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    })
                } else {
                    const updatedItems = [...items, { ...product, quantity: 1 }]
                    set({
                        items: updatedItems,
                        total: updatedItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
                    })
                }
            },
            removeItem: (productId) => {
                const items = get().items.filter((item) => item.id !== productId)
                set({
                    items,
                    total: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
                })
            },
            updateQuantity: (productId, quantity) => {
                const items = get().items.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
                set({
                    items,
                    total: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
                })
            },
            clearCart: () => {
                set({ items: [], total: 0 })
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
