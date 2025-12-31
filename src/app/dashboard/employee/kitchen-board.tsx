"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { updateOrderStatus } from "./actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type Order = {
    id: string
    pickup_date: string
    status: 'pending' | 'paid' | 'baking' | 'ready' | 'picked_up'
    order_items: {
        quantity: number
        products: {
            name: string
        }
    }[]
}

export function KitchenBoard({ initialOrders }: { initialOrders: Order[] }) {
    // We could use optimistic UI here, but for simplicity we rely on revalidatePath

    const handleStatusUpdate = async (id: string, newStatus: 'baking' | 'ready' | 'picked_up') => {
        try {
            await updateOrderStatus(id, newStatus)
            toast.success(`Order moved to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update order")
        }
    }

    // Filter into columns
    // 'paid' orders are "To Bake"
    const toBake = initialOrders.filter(o => o.status === 'paid' || o.status === 'pending') // Include pending just in case of lag, but ideally only paid
    const baking = initialOrders.filter(o => o.status === 'baking')
    const ready = initialOrders.filter(o => o.status === 'ready')

    const OrderCard = ({ order, actionLabel, onAction }: { order: Order, actionLabel: string, onAction: () => void }) => (
        <Card className="mb-4">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base">#{order.id.slice(0, 6)}</CardTitle>
                    <Badge variant="outline">{format(new Date(order.pickup_date), 'p')}</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <div className="text-sm space-y-1">
                    {order.order_items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span>{item.quantity}x {item.products?.name}</span>
                        </div>
                    ))}
                </div>
                <Button onClick={onAction} className="w-full h-8 text-xs">
                    {actionLabel}
                </Button>
            </CardContent>
        </Card>
    )

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: To Bake */}
            <div className="bg-muted/30 p-4 rounded-lg min-h-[500px]">
                <h2 className="font-serif text-lg mb-4 text-orange-500 font-bold flex justify-between">
                    To Bake <Badge variant="secondary">{toBake.length}</Badge>
                </h2>
                {toBake.length === 0 && <p className="text-sm text-muted-foreground text-center">No orders.</p>}
                {toBake.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        actionLabel="Start Baking ->"
                        onAction={() => handleStatusUpdate(order.id, 'baking')}
                    />
                ))}
            </div>

            {/* Column 2: Baking */}
            <div className="bg-muted/30 p-4 rounded-lg min-h-[500px]">
                <h2 className="font-serif text-lg mb-4 text-yellow-500 font-bold flex justify-between">
                    Baking <Badge variant="secondary">{baking.length}</Badge>
                </h2>
                {baking.length === 0 && <p className="text-sm text-muted-foreground text-center">Ovens empty.</p>}
                {baking.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        actionLabel="Mark Ready ->"
                        onAction={() => handleStatusUpdate(order.id, 'ready')}
                    />
                ))}
            </div>

            {/* Column 3: Ready */}
            <div className="bg-muted/30 p-4 rounded-lg min-h-[500px]">
                <h2 className="font-serif text-lg mb-4 text-green-500 font-bold flex justify-between">
                    Ready for Pickup <Badge variant="secondary">{ready.length}</Badge>
                </h2>
                {ready.length === 0 && <p className="text-sm text-muted-foreground text-center">No pickups.</p>}
                {ready.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        actionLabel="Complete (Picked Up)"
                        onAction={() => handleStatusUpdate(order.id, 'picked_up')}
                    />
                ))}
            </div>
        </div>
    )
}
