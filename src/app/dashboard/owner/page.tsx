import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify role
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role !== 'owner') redirect('/dashboard/customer')

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Financial Analytics</h1>
            <div className="grid grid-cols-2 gap-8">
                <div className="bg-card p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                    <p className="text-2xl font-bold mt-2">$0.00</p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow border">
                    <h3 className="text-sm font-medium text-muted-foreground">Orders this Month</h3>
                    <p className="text-2xl font-bold mt-2">0</p>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                <div className="border rounded-md p-4">
                    <p className="text-muted-foreground">No recent transactions.</p>
                </div>
            </div>
        </div>
    )
}
