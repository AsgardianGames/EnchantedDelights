"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

type Order = {
    id: string
    pickup_date: string
    status: string
    total_amount: number
    order_items: {
        quantity: number
        products: {
            name: string
        }
    }[]
}

export function OrderHistory({ initialOrders }: { initialOrders: Order[] }) {
    if (initialOrders.length === 0) {
        return <p className="text-muted-foreground py-8 text-center">No past orders found.</p>
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Pickup Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialOrders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-mono">{order.id.slice(0, 8)}</TableCell>
                            <TableCell>
                                {format(new Date(order.pickup_date), 'MMM d, yyyy p')}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                                {order.order_items.map(i => `${i.quantity}x ${i.products?.name}`).join(', ')}
                            </TableCell>
                            <TableCell>
                                <Badge variant={order.status === 'picked_up' ? 'secondary' : 'destructive'}>
                                    {order.status === 'picked_up' ? 'Picked Up' : 'Cancelled'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {order.total_amount ? formatCurrency(order.total_amount) : '-'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
