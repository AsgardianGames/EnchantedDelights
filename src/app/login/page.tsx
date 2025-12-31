import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message?: string; error?: string }
}) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="font-serif text-2xl text-primary">Enchanted Delights</CardTitle>
                    <CardDescription>Sign in to manage your orders</CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams.message && (
                        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded text-sm">
                            {searchParams.message}
                        </div>
                    )}
                    {searchParams.error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded text-sm">
                            {searchParams.error}
                        </div>
                    )}

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form className="space-y-4 pt-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button formAction={login} className="w-full bg-primary text-primary-foreground font-serif">Sign In</Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form className="space-y-4 pt-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input id="full_name" name="full_name" type="text" required />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" required />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button formAction={signup} className="w-full bg-primary text-primary-foreground font-serif">Create Account</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
