"use client"

import { createClient } from "@/utils/supabase/client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { formatCurrency } from "@/lib/utils"
import { Plus, Pencil } from "lucide-react"
import { upsertProduct, toggleProductStatus } from "./actions"
import { toast } from "sonner"

type Product = {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_active: boolean
}

export function MenuManager({ initialProducts }: { initialProducts: Product[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsDialogOpen(true)
    }

    const handleAddNew = () => {
        setEditingProduct(null)
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            const file = (e.currentTarget.elements.namedItem('image_file') as HTMLInputElement)?.files?.[0]

            // Handle File Upload
            if (file) {
                const supabase = createClient()
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file)

                if (uploadError) throw new Error('Upload failed: ' + uploadError.message)

                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
                formData.set('image_url', publicUrl)
            }

            // Append ID if editing
            if (editingProduct) {
                formData.append('id', editingProduct.id)
            }

            // If editing and no new file, image_url is already in input or we need to preserve it?
            // The form has a hidden input or text input for manual override? 
            // Let's rely on the fact that if image_url is empty string, we might not want to overwrite it if we didn't upload?
            // Actually, best practice: 
            // If user uploads file -> use that. 
            // If editing -> preserve old URL unless changed.
            // We can keep a hidden input with the old URL.

            // Using logic: If formData has 'image_url' (from text input or set by us above), it uses it.

            await upsertProduct(formData)
            toast.success(editingProduct ? "Product updated" : "Product created")
            setIsDialogOpen(false)
        } catch (error) {
            toast.error("Failed to save product")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await toggleProductStatus(id, !currentStatus)
            toast.success("Status updated")
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif text-primary">Current Menu</h2>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    {product.image_url && (
                                        <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded" />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={product.is_active}
                                        onCheckedChange={() => handleToggleActive(product.id, product.is_active)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? "Make changes to the product details." : "Add a new item to the bakery menu."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required defaultValue={editingProduct?.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingProduct?.description || ''} />
                        </div>
                        <div className="grid gap-2">
                            {/* Price formatted in Dollars */}
                            <Label htmlFor="price">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                defaultValue={editingProduct ? (editingProduct.price / 100).toFixed(2) : ''}
                                placeholder="5.50"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image_file">Product Image</Label>
                            <Input id="image_file" name="image_file" type="file" accept="image/*" />
                            <p className="text-xs text-muted-foreground">Or verify existing URL below:</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image_url">Image URL (Auto-filled on upload)</Label>
                            <Input id="image_url" name="image_url" defaultValue={editingProduct?.image_url || ''} placeholder="https://..." />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch id="is_active" name="is_active" defaultChecked={editingProduct?.is_active ?? true} />
                            <Label htmlFor="is_active">Active (Visible)</Label>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
