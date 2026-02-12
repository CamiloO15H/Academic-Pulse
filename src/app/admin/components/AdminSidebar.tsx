'use client'

import { Button } from '@/components/ui/button'
import { Users, FileText, Activity, LayoutDashboard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/infrastructure/database/supabaseClient'

export function AdminSidebar() {
    const pathname = usePathname()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
        { icon: Users, label: 'Usuarios', href: '/admin/users' },
        { icon: FileText, label: 'Contenido', href: '/admin/content' },
        { icon: Activity, label: 'Logs de Sistema', href: '/admin/logs' },
    ]

    return (
        <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col hidden md:flex">
            <div className="p-6 border-b border-white/5">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <span className="text-white font-black text-sm">AP</span>
                    </div>
                    <span className="font-bold tracking-tight">Admin Console</span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 transition-all duration-200",
                                    isActive
                                        ? "bg-white/5 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]"
                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <item.icon className={cn("w-4 h-4", isActive && "text-blue-400")} />
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-white/5">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                </Button>
            </div>
        </aside>
    )
}
