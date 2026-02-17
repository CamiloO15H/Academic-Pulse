'use client';

import React from 'react';
import { Smartphone, Settings, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface IntegrationsSectionProps {
    googleSyncEnabled: boolean;
    onToggleSync: () => void;
    onSyncNow: () => void;
    onMigrate: () => void;
    isMigrating: boolean;
    isSyncing: boolean;
}

/**
 * Sección de integraciones y herramientas inteligentes.
 */
const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
    googleSyncEnabled,
    onToggleSync,
    onSyncNow,
    onMigrate,
    isMigrating,
    isSyncing
}) => {
    return (
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Sync */}
            <div className="p-8 rounded-[2.5rem] bg-white/50 dark:bg-gray-800/40 border border-white/20 backdrop-blur-sm shadow-sm group">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-500/10 p-3 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                            <Smartphone className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">Sincronización Google</h3>
                            <p className="text-sm text-gray-500">Mantén tu calendario al día</p>
                        </div>
                    </div>
                    <button
                        onClick={onToggleSync}
                        className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${googleSyncEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${googleSyncEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
                {googleSyncEnabled && (
                    <button
                        onClick={onSyncNow}
                        disabled={isSyncing}
                        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                    </button>
                )}
            </div>

            {/* Smart Enrichent / Intelligence */}
            <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">Enriquecimiento de IA</h3>
                    </div>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Migra tus blogcitos antiguos al nuevo modelo de IA para obtener mejores insights y resúmenes automáticos.</p>
                    <button
                        onClick={onMigrate}
                        disabled={isMigrating}
                        className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {isMigrating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Migrando...</span>
                            </>
                        ) : (
                            <span>Migrar Inteligencia</span>
                        )}
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            </div>
        </div>
    );
};

export default IntegrationsSection;
