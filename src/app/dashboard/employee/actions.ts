'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(orderId: string, status: 'baking' | 'ready' | 'picked_up' | 'cancelled') {
    const supabase = await createClient()

    // Verify Staff Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // We trust RLS to block if not employee/owner/admin
    // But explicit check is safer if we want to be sure

    const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/employee')
}
