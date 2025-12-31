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
        <div id="menu" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {products.map((product, idx) => (
                <div key={product.id} className="group relative overflow-hidden rounded-xl shadow-lg border border-emerald-900/10">
                    {/* Image Container & Overlay */}
                    <div className="relative w-full aspect-square bg-emerald-950/5">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-emerald-800/40 bg-emerald-900/5">
                                No Image
                            </div>
                        )}

                        {/* Badges */}
                        {idx % 4 === 0 && (
                            <Badge className="absolute top-4 left-4 bg-amber-500 text-black border-none font-bold shadow-md">
                                Best Seller!
                            </Badge>
                        )}
                        {idx % 3 === 0 && idx % 4 !== 0 && (
                            <Badge className="absolute top-4 right-4 bg-emerald-600 text-white border-none shadow-md">
                                New!
                            </Badge>
                        )}

                        {/* Gradient Overlay & Content */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/80 to-transparent pt-12 pb-4 px-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1 text-left">
                                    <h3 className="font-serif text-xl font-bold tracking-wide text-[#f5e6d3] drop-shadow-sm">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-[#d4c5b0]/80 line-clamp-2 leading-snug max-w-[85%]">
                                        {product.description || "Freshly baked goodness."}
                                    </p>
                                    <p className="text-lg font-bold text-amber-400 pt-1">
                                        {formatCurrency(product.price)}
                                        <span className="text-xs text-[#d4c5b0]/60 font-medium ml-1">/ each</span>
                                    </p>
                                </div>

                                <Button
                                    size="icon"
                                    className="h-10 w-10 shrink-0 rounded-full bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-lg mb-1"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
