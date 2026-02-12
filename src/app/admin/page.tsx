'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/infrastructure/database/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, Activity, ChevronRight, Settings } from 'lucide-react'
import Link from 'next/link'
import { AdminHeader } from './components/AdminHeader'

export default function AdminPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadStats() {
            try {
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
                const { count: contentCount } = await supabase.from('academic_content').select('*', { count: 'exact', head: true })

                setStats({
                    users: usersCount || 0,
                    content: contentCount || 0
                })
            } catch (error) {
                console.error('Error loading stats:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    return (
        <>
            <AdminHeader title="Dashboard Overview" />
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* Hero Stats Section */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/admin/users" className="block">
                        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden group hover:border-blue-500/30 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                <Users className="w-12 h-12" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Métricas de Usuario</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-white italic">
                                    {loading ? '---' : stats?.users}
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                                    Ver todos los usuarios <ChevronRight className="w-3 h-3" />
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/content" className="block">
                        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden group hover:border-indigo-500/30 transition-all cursor-pointer">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                <FileText className="w-12 h-12" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contenido Académico</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-white italic">
                                    {loading ? '---' : stats?.content}
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
                                    Administrar documentos <ChevronRight className="w-3 h-3" />
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="border-blue-500/20 bg-blue-500/[0.03] backdrop-blur-md overflow-hidden border-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-400">Estado Global</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-200 flex items-center gap-3">
                                <div className="h-3 w-3 bg-blue-500 rounded-full animate-ping" />
                                OPERATIVO
                            </div>
                            <p className="text-xs text-blue-400/60 mt-2 italic">
                                Latencia: 24ms // Todos los sistemas OK
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions / Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-white/5 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Actividad Reciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center text-xs">U{i}</div>
                                        <div>
                                            <p className="text-sm font-medium">Nuevo usuario registrado</p>
                                            <p className="text-[10px] text-zinc-500">Hace {i * 15} minutos</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-700" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-black/40 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-emerald-500" />
                                Controles Rápidos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs h-16 flex flex-col gap-1">
                                <span>Exportar Data</span>
                                <span className="text-[9px] text-zinc-500 font-mono">.CSV / .JSON</span>
                            </Button>
                            <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs h-16 flex flex-col gap-1">
                                <span>Limpiar Cache</span>
                                <span className="text-[9px] text-zinc-500 font-mono">REDIS / CDN</span>
                            </Button>
                            <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs h-16 flex flex-col gap-1">
                                <span>Mantenimiento</span>
                                <span className="text-[9px] text-zinc-500 font-mono">MODO OFF</span>
                            </Button>
                            <Button className="bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-blue-400 text-xs h-16 flex flex-col gap-1">
                                <span>Escalar API</span>
                                <span className="text-[9px] text-blue-500/50 font-mono">+2 INSTANCIAS</span>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
