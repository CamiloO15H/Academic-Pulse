import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-red-500">Error de Autenticación</CardTitle>
                    <CardDescription>
                        No se pudo procesar el código de autenticación. Esto puede ser porque el enlace ha expirado o ya fue utilizado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-zinc-400 text-center">
                        Por favor, intenta iniciar sesión de nuevo. Si el problema persiste, contacta a soporte.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/login text-white">Volver al Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
