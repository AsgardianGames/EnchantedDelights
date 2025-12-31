
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { MenuManager } from './menu-client'

export const dynamic = 'force-dynamic'

export default async function ManageMenuPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'employee' && profile.role !== 'owner')) {
        redirect('/profile') // Unauthorized
    }

    // Fetch Products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('name')

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif text-primary mb-8">Manage Menu</h1>
            <MenuManager initialProducts={products || []} />
        </div>
    )
}
