
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export const dynamic = 'force-dynamic'

export default async function OwnerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Role check - in a real app, middleware or RLS enforces this, but safe to redirect if not owner here too
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'owner') redirect('/profile')

    // 1. Calculate Total Revenue (All non-cancelled orders)
    // Note: handling large datasets requires aggregation queries or serverless functions.
    // For this scale, client-side sum of fetched 'total_amount' is acceptable.
    const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .neq('status', 'cancelled')
        .neq('status', 'pending') // Only count paid/completed revenue

    const totalRevenue = allOrders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0

    // 2. Orders this Month
    const currentMonthStart = startOfMonth(new Date()).toISOString()
    const { count: monthlyOrderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentMonthStart)
        .neq('status', 'cancelled')
        .neq('status', 'pending')

    // 3. Recent Transactions
    const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
            id,
            total_amount,
            status,
            created_at,
            profiles (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-serif text-primary mb-8">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime revenue (paid orders)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders this Month</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{monthlyOrderCount || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            + from start of month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <div className="font-medium">{order.profiles?.full_name || 'Guest'}</div>
                                        <div className="text-xs text-muted-foreground truncate w-24">#{order.id}</div>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'MMM d, p')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(order.total_amount || 0)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!recentOrders || recentOrders.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
