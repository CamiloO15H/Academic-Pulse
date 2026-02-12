'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminHeader } from '../components/AdminHeader'
import { Terminal, Cpu, Database, Cloud } from 'lucide-react'

export default function LogsAdminPage() {
    return (
        <>
            <AdminHeader title="Terminal de Sistema" />
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
                        <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
                            <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">CPU</p>
                            <p className="text-sm font-mono text-zinc-200">12.4%</p>
                        </div>
                    </Card>
                    <Card className="border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
                        <div className="p-2 rounded bg-blue-500/10 text-blue-500">
                            <Database className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">DB Pool</p>
                            <p className="text-sm font-mono text-zinc-200">8/20</p>
                        </div>
                    </Card>
                    <Card className="border-white/5 bg-white/[0.02] p-4 flex items-center gap-4">
                        <div className="p-2 rounded bg-indigo-500/10 text-indigo-500">
                            <Cloud className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">API V1</p>
                            <p className="text-sm font-mono text-zinc-200 italic text-indigo-400">Stable</p>
                        </div>
                    </Card>
                    <Card className="border-white/5 bg-white/[0.02] p-4 flex items-center gap-4 text-emerald-400">
                        <div className="p-2 rounded bg-emerald-500/10">
                            <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Status</p>
                            <p className="text-sm font-mono uppercase font-black">Live</p>
                        </div>
                    </Card>
                </div>

                <Card className="border-white/10 bg-black/60 border-2">
                    <CardHeader className="border-b border-white/5 py-4">
                        <CardTitle className="text-sm font-mono flex items-center gap-2 text-zinc-400">
                            <Terminal className="w-4 h-4" /> system.log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="bg-[#050505] p-6 font-mono text-[11px] leading-relaxed overflow-y-auto max-h-[500px] text-zinc-400">
                            <p className="text-zinc-600">[2026-02-11 19:40:01] <span className="text-emerald-500 font-bold">INFO</span>: Connection established with Supabase Auth</p>
                            <p className="text-zinc-600">[2026-02-11 19:40:15] <span className="text-emerald-500 font-bold">INFO</span>: Migrations verified successfully (v2.1.4)</p>
                            <p className="text-zinc-600">[2026-02-11 19:42:33] <span className="text-emerald-500 font-bold">INFO</span>: User @camilo login successful (Admin session initiated)</p>
                            <p className="text-zinc-600">[2026-02-11 19:45:10] <span className="text-indigo-400">SHARD</span>: Rotating Gemini API Key (Slot index [2] {'->'} [3])</p>
                            <p className="text-zinc-600">[2026-02-11 19:46:00] <span className="text-amber-500 font-bold">WARN</span>: Slow query detected in 'academic_content' fetch (120ms)</p>
                            <p className="text-zinc-600 animate-pulse">[2026-02-11 19:46:07] <span className="text-emerald-500 font-bold">INFO</span>: Routing to /admin/logs...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
