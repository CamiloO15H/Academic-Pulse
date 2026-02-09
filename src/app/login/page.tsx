'use client'

import { createClient } from '@/infrastructure/database/supabaseClient'
import { useState } from 'react'
import Image from 'next/image' // Assuming we will use the generated image

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error) {
            console.error('Login error:', error)
            alert('Error logging in')
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-24">
                <div className="mx-auto w-full max-w-sm space-y-8">
                    <div className="space-y-2 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500">
                            Academic Pulse
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Tu asistente académico inteligente. Gestiona, automatiza y domina tus estudios.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-lg font-medium text-black transition-all duration-200 hover:bg-gray-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            ) : (
                                <>
                                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    <span>Continuar con Google</span>
                                </>
                            )}
                        </button>

                        <p className="px-8 text-center text-sm text-muted-foreground">
                            Al continuar, aceptas nuestros <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Términos de Servicio</span> y <span className="underline underline-offset-4 hover:text-primary cursor-pointer">Política de Privacidad</span>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="relative hidden w-0 flex-1 flex-col bg-muted lg:flex">
                <div className="absolute inset-0 h-full w-full bg-zinc-900 border-l border-white/10">
                    {/* Placeholder or Image will go here. Using a gradient as fallback or the image if generated */}
                    <div className="relative h-full w-full overflow-hidden">
                        {/* We will try to load the generated image here, or fallback to a nice gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 z-10" />
                        <img
                            src="/forest_login.jpg"
                            alt="Academic Pulse Visual"
                            className="h-full w-full object-cover opacity-80"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)';
                            }}
                        />

                        <div className="absolute bottom-0 p-12 z-20">
                            <blockquote className="space-y-2">
                                <p className="text-xl font-medium text-white/90">
                                    &ldquo;La educación es el arma más poderosa que puedes usar para cambiar el mundo.&rdquo;
                                </p>
                                <footer className="tex-sm text-white/60 text-right">— Nelson Mandela</footer>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
