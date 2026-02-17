'use client';

import React from 'react';
import { LogOut, BookOpen } from 'lucide-react';

interface DashboardNavbarProps {
    onLogout: () => void;
}

/**
 * Navbar superior del Dashboard.
 * Diseño limpio y minimalista siguiendo la identidad de Academic Pulse.
 */
const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onLogout }) => {
    return (
        <nav className="flex items-center justify-between p-6 mb-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/20 shadow-sm">
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Academic Pulse
                    </h1>
                    <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                        Intelligence Hub
                    </p>
                </div>
            </div>

            <button
                onClick={onLogout}
                className="group flex items-center gap-2 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-xl transition-all duration-300"
            >
                <span className="text-sm font-medium">Salir</span>
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </nav>
    );
};

export default DashboardNavbar;
