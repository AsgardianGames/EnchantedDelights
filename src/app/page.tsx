
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { MenuGrid } from "@/components/menu-grid";

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch Active Products for Menu
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-[#fdfbf7] dark:bg-black/20">
        <div className="text-center space-y-6 px-4 max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-bold font-serif tracking-tight text-[#3d2b1f] dark:text-[#d4af37]">
            Enchanted Delights
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            Artisan pastries, breads, and cakes baked fresh daily.
            <br className="hidden sm:block" /> Order online for pickup in 24 hours.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="#menu"
              className="rounded-full bg-[#5c4033] text-white hover:bg-[#4a332a] h-12 px-8 flex items-center justify-center font-medium transition-colors"
            >
              View Menu
            </Link>
            <Link
              href="/profile"
              className="rounded-full border border-[#5c4033] text-[#5c4033] hover:bg-[#5c4033]/10 h-12 px-8 flex items-center justify-center font-medium transition-colors dark:border-[#d4af37] dark:text-[#d4af37]"
            >
              My Account
            </Link>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-20 px-4 sm:px-8 bg-white dark:bg-black/10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-primary font-bold mb-4">Our Menu</h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <MenuGrid products={products as any || []} />
        </div>
      </section>
    </div>
  );
}
