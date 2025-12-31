import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function KitchenDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify role
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role !== 'employee' && profile?.role !== 'owner') redirect('/dashboard/customer')

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Kitchen Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder for order columns */}
                <div className="border bg-card rounded-lg p-4 shadow-sm border-orange-500/20">
                    <h2 className="font-serif text-lg mb-4 text-orange-400">Pending (To Bake)</h2>
                    <p className="text-sm text-muted-foreground">No pending orders.</p>
                </div>
                <div className="border bg-card rounded-lg p-4 shadow-sm border-yellow-500/20">
                    <h2 className="font-serif text-lg mb-4 text-yellow-400">Baking</h2>
                    <p className="text-sm text-muted-foreground">Ovens are empty.</p>
                </div>
                <div className="border bg-card rounded-lg p-4 shadow-sm border-green-500/20">
                    <h2 className="font-serif text-lg mb-4 text-green-400">Ready for Pickup</h2>
                    <p className="text-sm text-muted-foreground">All cleared.</p>
                </div>
            </div>
        </div>
    )
}
