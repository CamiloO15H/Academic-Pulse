'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminHeader } from '../components/AdminHeader'
import { FileText, Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContentAdminPage() {
    return (
        <>
            <AdminHeader title="Biblioteca Académica" />
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            placeholder="Buscar documentos, guías, exámenes..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                        />
                    </div>
                    <Button variant="outline" className="border-white/10 gap-2">
                        <Filter className="w-4 h-4" /> Filtros
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                        <Plus className="w-4 h-4" /> Subir Material
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="border-white/5 bg-black/40 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="p-2 rounded bg-blue-500/10 text-blue-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-500">PDF // 2.4MB</span>
                                </div>
                                <CardTitle className="text-sm font-bold mt-4 leading-tight">Guía de Cálculo Multivariado - Semana {i}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-zinc-500 line-clamp-2">
                                    Resumen detallado de integrales triples y coordenadas esféricas para el examen final.
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] text-zinc-600 italic">Subido hace 2 días</span>
                                    <Button variant="ghost" className="h-7 text-[10px] text-blue-400 hover:text-blue-300">Detalles</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    )
}
