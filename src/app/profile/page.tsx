
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Profile for Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch Orders
    const { data: orders } = await supabase
        .from('orders')
        .select(`
        *,
        order_items (
            quantity,
            products (name, price)
        )
    `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-serif text-primary mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {/* User Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Role</label>
                            <p className="capitalize">{profile?.role || 'Customer'}</p>
                        </div>

                        {/* Kitchen/Owner Access */}
                        {(profile?.role === 'employee' || profile?.role === 'owner') && (
                            <div className="pt-4 border-t">
                                <Button asChild className="w-full mb-2" variant="secondary">
                                    <Link href="/dashboard/employee">Kitchen Dashboard</Link>
                                </Button>
                                {profile?.role === 'owner' && (
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href="/dashboard/owner">Financials</Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <form action="/auth/signout" method="post">
                                <Button variant="destructive" className="w-full">Sign Out</Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Order History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Order History</CardTitle>
                        <CardDescription>View your past and upcoming orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(!orders || orders.length === 0) ? (
                            <p className="text-muted-foreground text-center py-8">No orders found.</p>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id} className="border rounded-lg p-4 bg-muted/20">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Pickup: {format(new Date(order.pickup_date), 'PPP p')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'ready' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                                        `}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                                <p className="font-bold mt-1">{formatCurrency(order.total_amount)}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm space-y-1">
                                            {order.order_items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between">
                                                    <span>{item.quantity}x {item.products?.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
