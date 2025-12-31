import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        <div className="flex flex-col items-center text-center space-y-6 max-w-2xl px-4 animate-in fade-in zoom-in duration-1000">
          <Badge className="bg-amber-500 text-black border-none px-4 py-1 text-base font-semibold shadow-lg mb-4 animate-bounce">
            Grand Opening!
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-bold font-serif tracking-tight text-emerald-950 dark:text-[#f5e6d3] drop-shadow-sm">
            Enchanted Delights
          </h1>
          <p className="text-lg sm:text-xl text-emerald-800/90 dark:text-[#d4c5b0] font-medium max-w-lg mx-auto leading-relaxed">
            Experience the magic of artisanal baking. Fresh, organic, and made with love.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800 h-12 px-8 flex items-center justify-center font-medium transition-colors shadow-md"
            >
              <Link href="#menu">View Menu</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-50 h-12 px-8 flex items-center justify-center font-bold transition-colors dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-400/10"
            >
              <Link href="/dashboard/customer">My Orders</Link>
            </Button>
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
