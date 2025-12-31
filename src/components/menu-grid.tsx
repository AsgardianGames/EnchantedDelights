"use client"

import { useCartStore } from "@/store/cart-store"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_active: boolean
}

export function MenuGrid({ products }: { products: Product[] }) {
    const { addItem } = useCartStore()

    const handleAddToCart = (product: Product) => {
        addItem(product)
        toast.success(`Added ${product.name} to cart`)
    }

    return (
        <div id="menu" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {products.map((product, idx) => (
                <div key={product.id} className="group relative flex flex-col items-center text-center">
                    {/* Image Container */}
                    <div className="relative w-full aspect-square mb-6 overflow-hidden rounded-lg bg-muted/20">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
                                No Image
                            </div>
                        )}

                        {/* Badges (Mock Logic for demo) */}
                        {idx % 4 === 0 && (
                            <Badge className="absolute top-4 left-4 bg-[#5c4033] hover:bg-[#4a332a] text-white border-0 rounded-full px-3">
                                Best Seller!
                            </Badge>
                        )}
                        {idx % 3 === 0 && idx % 4 !== 0 && (
                            <Badge className="absolute top-4 right-4 bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-full px-3">
                                New!
                            </Badge>
                        )}

                        {/* Add Button Overlay */}
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                            <Button
                                size="icon"
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-[#5c4033] hover:bg-[#4a332a] text-white transition-transform hover:scale-110"
                                onClick={() => handleAddToCart(product)}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2 max-w-[90%]">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide text-[#3d2b1f] dark:text-[#d4af37]">
                            {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
                            {product.description || "Freshly baked goodness."}
                        </p>
                        <p className="text-lg font-medium text-primary pt-1">
                            {formatCurrency(product.price)}
                            <span className="text-xs text-muted-foreground font-normal ml-1">/ each</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
