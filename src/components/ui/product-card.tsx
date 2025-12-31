"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useCartStore } from "@/store/cart-store"
import { toast } from "sonner"

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_active: boolean
}

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAdd = () => {
        addItem(product)
        toast.success(`Added ${product.name} to order`)
    }

    return (
        <Card className="overflow-hidden border-border bg-card hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full bg-muted">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <span className="text-4xl">🥐</span>
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-serif text-xl text-primary">{product.name}</CardTitle>
                    <Badge variant="outline" className="border-primary text-primary whitespace-nowrap">
                        {formatCurrency(product.price)}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2 text-muted-foreground/90 font-light">
                    {product.description}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-serif tracking-wider"
                    onClick={handleAdd}
                >
                    ADD TO ORDER
                </Button>
            </CardFooter>
        </Card>
    )
}
