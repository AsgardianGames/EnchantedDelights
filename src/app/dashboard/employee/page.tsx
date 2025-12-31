
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KitchenBoard } from './kitchen-board'

export const dynamic = 'force-dynamic'

export default async function KitchenDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role Check logic if needed (Middleware handles basic auth, RLS handles data access)

    // Fetch Active Orders
    // We want: paid, baking, ready. 
    // We exclude 'pending' (unless we want to see unpaid ones? usually no) and 'picked_up' (history)
    const { data: orders } = await supabase
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
        .in('status', ['paid', 'baking', 'ready'])
        .order('pickup_date', { ascending: true })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif text-primary mb-8">Kitchen Dashboard</h1>
            <KitchenBoard initialOrders={orders as any || []} />
        </div>
    )
}
