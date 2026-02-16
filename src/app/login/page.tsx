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
    const [confirmPassword, setConfirmPassword] = useState('')
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

        if (isSignUp && password !== confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

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
                alert('¡Cuenta creada! Revisa tu email para confirmar tu cuenta antes de iniciar sesión.')
                setIsSignUp(false)
                setPassword('')
                setConfirmPassword('')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                })
                if (error) throw error
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
        <div className="flex min-h-screen w-full bg-background font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
            {/* Left Side: Form Section - Clean & Geometric */}
            <div className="flex w-full flex-col justify-center px-8 sm:px-12 lg:w-[45%] xl:px-24 z-10 bg-background border-r border-border/60 relative">
                {/* Background Pattern for Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.4] pointer-events-none" />

                <div className="mx-auto w-full max-w-[420px] space-y-10 animate-in slide-in-from-left duration-700 relative z-20">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-foreground text-background flex items-center justify-center font-bold text-lg rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                                AP
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">Academic Pulse</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-display">
                                {isSignUp ? 'Crear cuenta.' : 'Bienvenido.'}
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium">
                                {isSignUp ? 'Únete a la nueva era académica.' : 'Gestiona tu conocimiento con precisión.'}
                            </p>
                        </div>
                    </div>

                    {/* mode switcher tabs */}
                    <div className="grid grid-cols-2 p-1 bg-secondary/50 rounded-xl border border-border/50">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={cn(
                                "py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                !isSignUp ? "bg-white text-blue-600 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Acceder
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={cn(
                                "py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                isSignUp ? "bg-white text-blue-600 shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Registro
                        </button>
                    </div>

                    {/* Auth Form */}
                    <div className="grid gap-6">
                        <form onSubmit={handleAuthAction} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="estudiante@universidad.edu"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 bg-white border-2 border-border text-zinc-900 transition-all focus:border-blue-500 focus:ring-0 rounded-md placeholder:text-zinc-400 shadow-sm"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                                        {isSignUp ? 'Contraseña' : 'Contraseña'}
                                    </Label>
                                    {!isSignUp && (
                                        <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                            Recuperar acceso
                                        </button>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 bg-white border-2 border-border text-zinc-900 transition-all focus:border-blue-500 focus:ring-0 rounded-md shadow-sm"
                                />
                            </div>

                            {isSignUp && (
                                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label htmlFor="confirmPassword" className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                                        Confirmar Contraseña
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 bg-white border-2 border-border text-zinc-900 transition-all focus:border-blue-500 focus:ring-0 rounded-md shadow-sm"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-md shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all active:scale-[0.98] mt-2 group"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                        <span>Procesando</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isSignUp ? 'Comenzar Ahora' : 'Ingresar'}
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                <span className="bg-background px-4 text-muted-foreground font-bold">O continúa con</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                            onClick={handleGoogleLogin}
                            className="h-12 w-full justify-center gap-3 border-2 border-border bg-white text-zinc-800 hover:bg-slate-50 transition-all active:scale-[0.98] font-semibold rounded-md"
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

                    <p className="text-center text-sm font-medium text-muted-foreground">
                        {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta todavía?'}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 font-bold text-primary hover:text-primary/80 transition-colors hover:underline"
                        >
                            {isSignUp ? 'Inicia Sesión' : 'Crea una aquí'}
                        </button>
                    </p>
                </div>

                {/* Footer status */}
                <div className="absolute bottom-8 left-8 sm:left-12 flex items-center gap-4 text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                    <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" /> Sistema Seguro</span>
                    <span>Build 2026.11.0</span>
                </div>
            </div>

            {/* Right Side: Visual Section - Bold & Immersive */}
            <div className="relative hidden w-[55%] lg:block overflow-hidden bg-zinc-900">
                <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay z-10" />
                <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
                    alt="Minimalist Architecture"
                    className="h-full w-full object-cover grayscale opacity-80 hover:scale-105 transition-transform duration-[10s] ease-out"
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-20 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="w-full flex justify-end">
                        <div className="h-12 w-12 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                            <span className="text-white text-xs font-bold">AP</span>
                        </div>
                    </div>

                    <div className="max-w-xl animate-in fade-in slide-in-from-bottom duration-1000">
                        <blockquote className="space-y-6">
                            <p className="text-4xl font-medium leading-tight tracking-tight text-white font-display">
                                "La simplicidad es la máxima sofisticación."
                            </p>
                            <footer className="flex items-center gap-4">
                                <div className="h-px w-12 bg-white/50" />
                                <cite className="text-sm font-bold uppercase tracking-[0.2em] text-white/70 font-sans not-italic">
                                    Leonardo da Vinci
                                </cite>
                            </footer>
                        </blockquote>
                    </div>
                </div>
            </div>
        </div>
    )
}
