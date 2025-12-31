import { createClient } from '@/utils/supabase/server'
import { ProductCard, type Product } from '@/components/ui/product-card'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
    const supabase = await createClient()

    let { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

    if (error) {
        console.error("Error fetching products:", error)
    }

    // MOCK DATA for demonstration if DB is empty
    if (!products || products.length === 0) {
        products = [
            {
                id: '1',
                name: 'Cinnamon Roll - Original',
                description: 'Our signature soft, fluffy roll with rich cinnamon filling.',
                price: 500,
                image_url: null,
                is_active: true
            },
            {
                id: '2',
                name: 'Macaron - Raspberry',
                description: 'Delicate almond meringue cookies with fresh raspberry filling.',
                price: 375,
                image_url: null,
                is_active: true
            },
            {
                id: '3',
                name: 'Sourdough Loaf',
                description: 'Traditional artisan sourdough with a perfect crust.',
                price: 1400,
                image_url: null,
                is_active: true
            },
            {
                id: '4',
                name: 'Focaccia - Herbs & Cheese',
                description: 'Italian olive oil bread topped with fresh herbs and mozzarella.',
                price: 1600,
                image_url: null,
                is_active: true
            },
            {
                id: '5',
                name: 'Coffee Cinnamon Roll',
                description: 'Infused with espresso for a morning pick-me-up.',
                price: 600,
                image_url: null,
                is_active: true
            },
            {
                id: '6',
                name: 'Strawberry Banana Loaf',
                description: 'Sweet and moist dessert bread.',
                price: 1400,
                image_url: null,
                is_active: true
            }
        ]
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12">
                <header className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-serif text-primary tracking-tight">
                        Our Menu
                    </h1>
                    <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
                    <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
                        Handcrafted with passion, baked to order. Please allow 24 hours for pickup.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products!.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {(!products || products.length === 0) && (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground">No items currently available.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
