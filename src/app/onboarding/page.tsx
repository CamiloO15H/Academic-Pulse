'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/database/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getColombiaNow } from '@/application/utils/date'
// We might not have Input/Label, so using standard HTML or checking next
// standard HTML fallback for now to avoid errors if missing

export default function OnboardingPage() {
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (username.length < 3) {
            setError('El usuario debe tener al menos 3 caracteres.')
            setIsLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No authenticado')

            // Upsert profile to handle missing records
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    username: username,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                    updated_at: getColombiaNow().toISOString()
                }, { onConflict: 'id' })

            if (updateError) {
                if (updateError.code === '23505') { // Unique violation
                    throw new Error('Este nombre de usuario ya está en uso.')
                }
                throw updateError
            }

            // Redirect based on role
            // Since we don't have ADMIN_EMAIL on client easily, we can just redirect to / 
            // and let the middleware handle the admin check.
            router.push('/')
            router.refresh()
        } catch (err: any) {
            console.error('Onboarding error:', err)
            setError(err.message || 'Error al guardar el usuario.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Bienvenido a Academic Pulse</CardTitle>
                    <CardDescription className="text-center">
                        Para continuar, elige un nombre de usuario único.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Nombre de Usuario
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                placeholder="usuario_ejemplo"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                minLength={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Solo letras minúsculas, números y guiones bajos.
                            </p>
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-red-500">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Comenzar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
