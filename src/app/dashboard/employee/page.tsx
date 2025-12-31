
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KitchenBoard } from './kitchen-board'
import { OrderHistory } from './order-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = 'force-dynamic'

export default async function KitchenDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role verification done by RLS/Middleware, but extra safety check good here normally.

    // 1. Fetch Active Orders
    const { data: activeOrders } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            pickup_date,
            order_items (
                quantity,
                products (name)
            )
        `)
        .in('status', ['paid', 'pending', 'baking', 'ready']) // Include pending if unpaid check needed, usually just paid
        .order('pickup_date', { ascending: true })

    // 2. Fetch History Orders (Picked Up or Cancelled)
    const { data: historyOrders } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            pickup_date,
            total_amount,
            order_items (
                quantity,
                products (name)
            )
        `)
        .in('status', ['picked_up', 'cancelled'])
        .order('pickup_date', { ascending: false }) // Newest first for history

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif text-primary mb-8">Kitchen Dashboard</h1>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <KitchenBoard initialOrders={activeOrders as any || []} />
                </TabsContent>

                <TabsContent value="history">
                    <OrderHistory initialOrders={historyOrders as any || []} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
