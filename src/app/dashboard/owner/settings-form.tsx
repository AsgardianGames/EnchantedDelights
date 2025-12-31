"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const DAYS = [
    { id: 0, label: "Sunday" },
    { id: 1, label: "Monday" },
    { id: 2, label: "Tuesday" },
    { id: 3, label: "Wednesday" },
    { id: 4, label: "Thursday" },
    { id: 5, label: "Friday" },
    { id: 6, label: "Saturday" },
]

export function SettingsForm({ initialDays }: { initialDays: number[] }) {
    const [pickupDays, setPickupDays] = useState<number[]>(initialDays)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    const handleToggle = async (dayId: number, isEnabled: boolean) => {
        const newDays = isEnabled
            ? [...pickupDays, dayId].sort()
            : pickupDays.filter(d => d !== dayId)

        setPickupDays(newDays)
        setIsSaving(true)

        // Optimistic UI, but let's save
        const { error } = await supabase
            .from('store_settings')
            .update({ pickup_days: newDays })
            .eq('id', 1)

        setIsSaving(false)

        if (error) {
            toast.error("Failed to update settings")
            console.error(error)
            // Revert on error? For now, we just notify.
        } else {
            toast.success("Schedule updated")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Pickup Schedule</span>
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {DAYS.map((day) => {
                        const isEnabled = pickupDays.includes(day.id)
                        return (
                            <div key={day.id} className="flex items-center space-x-2 border p-3 rounded-lg">
                                <Switch
                                    id={`day-${day.id}`}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleToggle(day.id, checked)}
                                />
                                <Label htmlFor={`day-${day.id}`} className="cursor-pointer font-medium">
                                    {day.label}
                                </Label>
                            </div>
                        )
                    })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    Customers will only be able to select these days for pickup at checkout.
                </p>
            </CardContent>
        </Card>
    )
}
