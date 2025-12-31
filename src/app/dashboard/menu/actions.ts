'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function upsertProduct(formData: FormData) {
    const supabase = await createClient()

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = Math.round(parseFloat(formData.get('price') as string) * 100) // Convert dollars to cents
    const image_url = formData.get('image_url') as string
    const is_active = formData.get('is_active') === 'on'

    const productData = {
        name,
        description,
        price,
        image_url,
        is_active
    }

    let error

    if (id) {
        // Update
        const res = await supabase.from('products').update(productData).eq('id', id)
        error = res.error
    } else {
        // Insert
        const res = await supabase.from('products').insert(productData)
        error = res.error
    }

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/menu')
    revalidatePath('/') // Revalidate menu page too
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    const supabase = await createClient()

    const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/dashboard/menu')
    revalidatePath('/')
}
