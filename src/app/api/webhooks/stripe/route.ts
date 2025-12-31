import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any,
})

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        return new NextResponse(`Webhook Error: ${(error as Error).message}`, {
            status: 400,
        })
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent

    if (event.type === 'payment_intent.succeeded') {
        // Basic validation
        if (!paymentIntent?.metadata?.orderId) {
            return new NextResponse('Order ID missing in metadata', { status: 400 })
        }

        const orderId = paymentIntent.metadata.orderId

        // Update order status to 'paid'
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid', stripe_session_id: paymentIntent.id })
            .eq('id', orderId)

        if (error) {
            console.error('Error updating order:', error)
            return new NextResponse('Error updating order', { status: 500 })
        }
    }

    return new NextResponse(null, { status: 200 })
}
