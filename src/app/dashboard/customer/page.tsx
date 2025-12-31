
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function CustomerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // TODO: Fetch customer orders
    // const { data: orders } = await supabase.from('orders').select('*').eq('customer_id', user.id)

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>
            <p>Welcome, {user.email}</p>
            <div className="mt-4 border rounded p-4">
                <p className="text-muted-foreground">No orders yet.</p>
            </div>
        </div>
    )
}
