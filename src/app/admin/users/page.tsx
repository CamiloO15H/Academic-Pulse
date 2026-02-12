'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/infrastructure/database/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminHeader } from '../components/AdminHeader'
import { Users as UsersIcon, Mail, Shield, Calendar } from 'lucide-react'

export default function UsersAdminPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchUsers() {
            const { data } = await supabase.from('profiles').select('*').order('id', { ascending: false })
            setUsers(data || [])
            setLoading(false)
        }
        fetchUsers()
    }, [])

    return (
        <>
            <AdminHeader title="Gestión de Usuarios" />
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <Card className="border-white/5 bg-black/40 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <UsersIcon className="w-5 h-5 text-blue-500" />
                            Usuarios del Sistema
                        </CardTitle>
                        <div className="text-xs text-zinc-500 font-mono">TOTAL: {users.length}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-zinc-500 text-xs uppercase tracking-widest">
                                        <th className="py-4 px-4 font-bold">Usuario</th>
                                        <th className="py-4 px-4 font-bold">Username</th>
                                        <th className="py-4 px-4 font-bold">Rol</th>
                                        <th className="py-4 px-4 font-bold">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="py-8 text-center text-zinc-500 italic">Cargando base de datos...</td></tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:border-blue-500/50 transition-colors">
                                                            {user.full_name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-zinc-200">{user.full_name || 'Sin nombre'}</p>
                                                            <p className="text-[10px] text-zinc-500 flex items-center gap-1 italic">
                                                                <Mail className="w-2 h-2" /> (ID oculto)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                                        @{user.username || 'n/a'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                        <Shield className="w-3 h-3 text-emerald-500" />
                                                        Estudiante
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
