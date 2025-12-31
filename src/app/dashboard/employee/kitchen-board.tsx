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
    profiles?: { full_name: string }
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
        <Card className="mb-4 cursor-pointer hover:border-primary transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/20" onClick={() => setSelectedOrder(order)}>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-serif text-primary">
                            {order.profiles?.full_name || 'Guest Customer'}
                        </CardTitle>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">#{order.id.slice(0, 6)}</p>
                    </div>
                    <Badge variant="outline" className="border-primary/40 text-primary">
                        {format(new Date(order.pickup_date), 'h:mm a')}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
                <div className="text-sm space-y-1 bg-background/40 p-2 rounded-md border border-primary/10">
                    {order.order_items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                            <span className="text-foreground/90">{item.products?.name}</span>
                            <span className="font-bold text-primary">x{item.quantity}</span>
                        </div>
                    ))}
                </div>
                <Button
                    onClick={(e) => {
                        e.stopPropagation()
                        onAction()
                    }}
                    className="w-full h-8 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50"
                    variant="outline"
                >
                    {actionLabel}
                </Button>

                {/* Cancel Button */}
                {(order.status === 'paid' || order.status === 'pending' || order.status === 'baking' || order.status === 'ready') && (
                    <div className="text-right">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (confirm("Are you sure you want to cancel this order?")) {
                                    handleStatusUpdate(order.id, 'cancelled')
                                }
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 underline"
                        >
                            Cancel Order
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: To Bake */}
                <div className="bg-black/20 p-4 rounded-xl border border-primary/10 min-h-[500px]">
                    <h2 className="font-serif text-lg mb-4 text-primary font-bold flex justify-between items-center border-b border-primary/20 pb-2">
                        To Bake <Badge variant="secondary" className="bg-primary/20 text-primary">{toBake.length}</Badge>
                    </h2>
                    {toBake.length === 0 && <p className="text-sm text-muted-foreground text-center italic py-10">All baking caught up.</p>}
                    {toBake.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            actionLabel="Start Baking"
                            onAction={() => handleStatusUpdate(order.id, 'baking')}
                        />
                    ))}
                </div>

                {/* Column 2: Baking */}
                <div className="bg-black/20 p-4 rounded-xl border border-primary/10 min-h-[500px]">
                    <h2 className="font-serif text-lg mb-4 text-orange-400 font-bold flex justify-between items-center border-b border-primary/20 pb-2">
                        In Oven <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">{baking.length}</Badge>
                    </h2>
                    {baking.length === 0 && <p className="text-sm text-muted-foreground text-center italic py-10">Ovens empty.</p>}
                    {baking.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            actionLabel="Mark Ready"
                            onAction={() => handleStatusUpdate(order.id, 'ready')}
                        />
                    ))}
                </div>

                {/* Column 3: Ready */}
                <div className="bg-black/20 p-4 rounded-xl border border-primary/10 min-h-[500px]">
                    <h2 className="font-serif text-lg mb-4 text-emerald-400 font-bold flex justify-between items-center border-b border-primary/20 pb-2">
                        Ready for Pickup <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">{ready.length}</Badge>
                    </h2>
                    {ready.length === 0 && <p className="text-sm text-muted-foreground text-center italic py-10">No pickups ready.</p>}
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
