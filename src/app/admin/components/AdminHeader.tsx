'use client'

import { ShieldCheck, Users } from 'lucide-react'

export function AdminHeader({ title = "Panel Principal" }: { title?: string }) {
    return (
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    <Users className="w-4 h-4 text-zinc-400" />
                </div>
                <span className="text-sm font-medium text-zinc-300">Admin</span>
            </div>
        </header>
    )
}
