
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
    const { items, pickupDate } = await req.json()

    if (!items || items.length === 0) {
        return new NextResponse("No items in cart", { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    // Calculate total (Simplified for Dev Mode - trusting client or re-calc)
    // Ideally duplicate logic from create-payment-intent to be safe
    const productIds = items.map((item: any) => item.id)
    const { data: dbProducts } = await supabase.from('products').select('id, price').in('id', productIds)

    let total = 0
    if (dbProducts) {
        for (const item of items) {
            const dbProduct = dbProducts.find((p) => p.id === item.id)
            if (dbProduct) {
                total += dbProduct.price * item.quantity
            }
        }
    } else {
        // Fallback
        for (const item of items) {
            total += item.price * item.quantity
        }
    }

    // Create "Paid" Order
    const { data: order, error } = await supabase.from('orders').insert({
        customer_id: user.id,
        total_amount: total,
        status: 'paid', // Directly Paid
        pickup_date: pickupDate || new Date().toISOString(),
        stripe_session_id: 'simulated_dev_payment'
    }).select().single()

    if (error) {
        console.error(error)
        return new NextResponse("Database Error", { status: 500 })
    }

    // Insert Items
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity
    }))

    // Check if product IDs are valid UUIDs before inserting to avoid error if using mock data "1" "2"
    // Since we are in Dev Mode and might be using Mock Data, we will TRY to insert.
    // If it fails (fk violation), we ignore for demo content, but real app would fail.
    // For this specific request, we assume user might seed DB or we just care about Order record.
    // Let's try-catch the item insert.
    try {
        await supabase.from('order_items').insert(orderItems)
    } catch (e) {
        console.warn("Could not insert items (likely mock data FK violation)", e)
    }

    return NextResponse.json({ success: true, orderId: order.id })
}
