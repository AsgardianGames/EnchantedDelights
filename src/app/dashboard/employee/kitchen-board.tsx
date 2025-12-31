"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { updateOrderStatus } from "./actions"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const handleStatusUpdate = async (id: string, newStatus: 'baking' | 'ready' | 'picked_up' | 'cancelled') => {
        try {
            await updateOrderStatus(id, newStatus)
            toast.success(`Order moved to ${newStatus}`)
            if (selectedOrder?.id === id) setSelectedOrder(null)
        } catch (error) {
            toast.error("Failed to update order")
        }
    }

    // Filter into columns
    const toBake = initialOrders.filter(o => o.status === 'paid' || o.status === 'pending')
    const baking = initialOrders.filter(o => o.status === 'baking')
    const ready = initialOrders.filter(o => o.status === 'ready')

    const OrderCard = ({ order, actionLabel, onAction }: { order: Order, actionLabel: string, onAction: () => void }) => (
        <Card className="mb-4 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedOrder(order)}>
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
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        onAction()
                    }}
                    className="w-full h-8 text-xs"
                >
                    {actionLabel}
                </Button>

                {/* Cancel Button for all active columns */}
                {(order.status === 'paid' || order.status === 'pending' || order.status === 'baking' || order.status === 'ready') && (
                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            if (confirm("Are you sure you want to cancel this order?")) {
                                handleStatusUpdate(order.id, 'cancelled')
                            }
                        }}
                        variant="destructive"
                        className="w-full h-8 text-xs"
                    >
                        Cancel Order
                    </Button>
                )}
            </CardContent>
        </Card>
    )

    return (
        <>
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

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
                        <DialogDescription>
                            Pickup: {selectedOrder && format(new Date(selectedOrder.pickup_date), 'PPP p')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedOrder?.order_items.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{item.products?.name}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
