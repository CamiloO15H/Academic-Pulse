'use client'

import { createClient } from '@/infrastructure/database/supabaseClient'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mounted, setMounted] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleGoogleLogin = async () => {
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
            console.error('Google Login error:', error)
            alert('Error al iniciar sesión con Google')
            setIsLoading(false)
        }
    }

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                alert('¡Cuenta creada! Revisa tu email para confirmar.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                })
                if (error) throw error
                // Force a reload to let middleware handle the redirect to /admin if applicable
                window.location.href = '/'
            }
        } catch (error: any) {
            console.error('Auth error:', error)
            alert(error.message || 'Error en autenticación')
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <div className="flex min-h-screen w-full bg-black selection:bg-blue-500/30 overflow-hidden">
            {/* Left Side: Form Section */}
            <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-1/2 xl:px-24 z-10 bg-black/40 backdrop-blur-sm border-r border-white/5">
                <div className="mx-auto w-full max-w-[400px] space-y-8 animate-in slide-in-from-left duration-700">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform hover:scale-110">
                                <span className="text-white font-black text-xl tracking-tighter">AP</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">Academic Pulse</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            {isSignUp ? 'Empieza hoy.' : 'Bienvenido.'}
                        </h1>
                        <p className="text-lg text-zinc-400">
                            {isSignUp ? 'Crea tu cuenta académica en segundos.' : 'Inicia sesión para acceder a tu pulso académico.'}
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleAuthAction} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-zinc-300">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="tu@universidad.edu"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 h-12 text-white focus:border-blue-500 transition-all placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-zinc-300">
                                        Contraseña
                                    </Label>
                                    {!isSignUp && (
                                        <button type="button" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white/[0.03] border-white/10 h-12 text-white focus:border-blue-500 transition-all focus:ring-1 focus:ring-blue-500/20"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="h-12 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] mt-2 group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        <span>Procesando...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isSignUp ? 'Unirse Ahora' : 'Acceder al Panel'}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-black px-4 text-zinc-500">O continúa con</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                            onClick={handleGoogleLogin}
                            className="h-12 w-full justify-center gap-3 border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] transition-all hover:border-white/20 active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                            Google
                        </Button>
                    </div>

                    <p className="px-8 text-center text-sm text-zinc-500">
                        {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?'}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 font-bold text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                        >
                            {isSignUp ? 'Inicia Sesión' : 'Crea una aquí'}
                        </button>
                    </p>
                </div>

                {/* Footer status */}
                <div className="absolute bottom-8 left-8 sm:left-12 flex items-center gap-4 text-[10px] font-mono text-zinc-600 tracking-wider">
                    <span className="flex items-center gap-1.5"><div className="h-1 w-1 bg-green-500 rounded-full animate-pulse" /> ENCRIPTACIÓN SSL ACTIVA</span>
                    <span>V1.1.0-BRUTAL</span>
                </div>
            </div>

            {/* Right Side: Visual Section */}
            <div className="relative hidden w-1/2 lg:block overflow-hidden">
                <div className="absolute inset-0 bg-blue-600">
                    <img
                        src="/forest_login.jpg"
                        alt="Academic Pulse Visual"
                        className="h-full w-full object-cover opacity-60 grayscale hover:scale-110 transition-transform ease-out"
                        style={{ transitionDuration: '10000ms' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-transparent" />

                    {/* Glowing Orbs for the 'previous color' vibe */}
                    <div className="absolute top-[10%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[100px]" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end p-20 text-white">
                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom duration-1000">
                        <svg className="h-10 w-10 text-blue-400 mb-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16L9.01703 16C7.91246 16 7.01703 16.8954 7.01703 18L7.01703 21M14.017 21L14.017 21.0001M14.017 21H7.01703M17.017 6.00003C17.017 8.76145 14.7784 11 12.017 11C9.25561 11 7.01703 8.76145 7.01703 6.00003C7.01703 3.23861 9.25561 1 12.017 1C14.7784 1 17.017 3.23861 17.017 6.00003Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M3.5 12h17M3.5 12l3-3m-3 3l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <blockquote className="space-y-4">
                            <p className="text-3xl font-medium leading-tight tracking-tight lg:text-4xl italic font-serif">
                                &ldquo;La educación es el arma más poderosa que puedes usar para cambiar el mundo.&rdquo;
                            </p>
                            <footer className="flex items-center gap-3">
                                <div className="h-px w-8 bg-blue-500" />
                                <cite className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 font-sans">
                                    Nelson Mandela
                                </cite>
                            </footer>
                        </blockquote>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-12 right-12 text-[10px] font-mono text-white/20 vertical-rl tracking-[0.5em] hidden xl:block">
                    PULSO ACADÉMICO // SISTEMA DE SEGURIDAD // 2026
                </div>
            </div>
        </div>
    )
}
