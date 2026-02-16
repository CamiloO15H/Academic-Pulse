'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SubjectResource } from '../../domain/entities/SubjectResource';
import { getSubjectResources, deleteSubjectResource, uploadAttachment, addSubjectResourceLink } from '@/app/actions';
import { FileText, ImageIcon, Link as LinkIcon, Paperclip, ExternalLink, Trash2, Plus, Download, Loader2, Upload, FileCode, FileArchive, X, Folder, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SubjectVaultProps {
    subjectId: string;
}

const SubjectVault: React.FC<SubjectVaultProps> = ({ subjectId }) => {
    const [resources, setResources] = useState<SubjectResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Link states
    const [isAddingLink, setIsAddingLink] = useState(false);
    const [linkName, setLinkName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [isSubmittingLink, setIsSubmittingLink] = useState(false);

    useEffect(() => {
        fetchResources();
    }, [subjectId]);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const result = await getSubjectResources(subjectId);
            if (result.status === 'SUCCESS') {
                setResources(result.data || []);
            } else {
                toast.error('Error al cargar el baúl');
            }
        } catch (error) {
            console.error('Fetch Resources Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este recurso permanentemente?')) return;

        try {
            const result = await deleteSubjectResource(id);
            if (result.status === 'SUCCESS') {
                setResources(prev => prev.filter(r => r.id !== id));
                toast.success('Recurso eliminado del baúl');
            } else {
                toast.error('Error al eliminar recurso');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        const toastId = toast.loading(`Subiendo ${files.length} recurso(s) al baúl...`);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress({ current: i + 1, total: files.length });

                // 20MB Limit for Vault
                if (file.size > 20 * 1024 * 1024) {
                    toast.error(`"${file.name}" excede el límite de 20MB.`, { id: toastId });
                    continue;
                }

                // OPTIMISTIC: Add a placeholder item
                const tempId = `temp-upload-${Date.now()}-${i}`;
                const tempResource: SubjectResource & { isOptimistic?: boolean } = {
                    id: tempId,
                    subjectId,
                    name: file.name,
                    url: '#',
                    type: file.type,
                    size: file.size,
                    createdAt: new Date().toISOString(),
                    isOptimistic: true
                };
                setResources(prev => [tempResource, ...prev]);

                try {
                    await new Promise<void>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = async () => {
                            const base64 = (reader.result as string).split(',')[1];
                            const result = await uploadAttachment(subjectId, file.name, base64, file.type, 'subject');

                            if (result.status === 'SUCCESS') {
                                // Replace optimistic item with actual data
                                setResources(prev => prev.map(r => r.id === tempId ? (result.data as SubjectResource) : r));
                                resolve();
                            } else {
                                // Remove optimistic item on error
                                setResources(prev => prev.filter(r => r.id !== tempId));
                                toast.error(`Error con "${file.name}": ${result.message}`, { id: toastId });
                                reject(new Error(result.message));
                            }
                        };
                        reader.onerror = () => reject(new Error("File read error"));
                        reader.readAsDataURL(file);
                    });
                } catch (uploadErr) {
                    console.error("Upload error for file:", file.name, uploadErr);
                }
            }
            toast.success('Carga completada', { id: toastId });
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Error al procesar archivos', { id: toastId });
        } finally {
            setIsUploading(false);
            setUploadProgress({ current: 0, total: 0 });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkName || !linkUrl) return;

        setIsSubmittingLink(true);
        const toastId = toast.loading('Guardando enlace...');

        // OPTIMISTIC: Add a placeholder link
        const tempId = `temp-link-${Date.now()}`;
        const tempLink: SubjectResource & { isOptimistic?: boolean } = {
            id: tempId,
            subjectId,
            name: linkName,
            url: linkUrl,
            type: 'text/link',
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        const currentLinkName = linkName;
        const currentLinkUrl = linkUrl;

        setResources(prev => [tempLink, ...prev]);
        setIsAddingLink(false);
        setLinkName('');
        setLinkUrl('');

        try {
            const result = await addSubjectResourceLink(subjectId, currentLinkName, currentLinkUrl);
            if (result.status === 'SUCCESS') {
                // Replace optimistic item with actual data
                setResources(prev => prev.map(r => r.id === tempId ? (result.data as SubjectResource) : r));
                toast.success('Enlace guardado', { id: toastId });
            } else {
                // Remove optimistic item on error
                setResources(prev => prev.filter(r => r.id !== tempId));
                toast.error(result.message || 'Error al guardar enlace', { id: toastId });
                // Restore form values if error
                setLinkName(currentLinkName);
                setLinkUrl(currentLinkUrl);
                setIsAddingLink(true);
            }
        } catch (err) {
            setResources(prev => prev.filter(r => r.id !== tempId));
            toast.error('Error de conexión', { id: toastId });
            setLinkName(currentLinkName);
            setLinkUrl(currentLinkUrl);
            setIsAddingLink(true);
        } finally {
            setIsSubmittingLink(false);
        }
    };

    const getFileIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('image')) return <ImageIcon className="w-5 h-5 text-purple-400" />;
        if (t.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
        if (t.includes('link')) return <LinkIcon className="w-5 h-5 text-blue-400" />;
        if (t.includes('zip') || t.includes('rar')) return <FileArchive className="w-5 h-5 text-orange-400" />;
        if (t.includes('json') || t.includes('javascript') || t.includes('typescript')) return <FileCode className="w-5 h-5 text-green-400" />;
        return <Paperclip className="w-5 h-5 text-zinc-400" />;
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Abriendo el baúl...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Vault Header Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-zinc-900 to-[#0a0a0a] border border-white/5 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Baúl de Materia</h2>
                        <p className="text-zinc-400 text-sm mt-1 font-medium italic">Documentos permanentes, libros y recursos clave de la materia.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsAddingLink(true)}
                            className="flex items-center gap-2 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all"
                        >
                            <LinkIcon className="w-5 h-5" />
                            Añadir Enlace
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="group relative flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 group-hover:bounce" />}
                            {isUploading ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}` : 'Subir Archivos'}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                multiple
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Link Modal */}
            {isAddingLink && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Nuevo Enlace</h3>
                            <button onClick={() => setIsAddingLink(false)} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">Nombre</label>
                                <input
                                    type="text"
                                    value={linkName}
                                    onChange={e => setLinkName(e.target.value)}
                                    placeholder="Ej. Clase Grabada - 12/02"
                                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 ml-1">URL</label>
                                <input
                                    type="url"
                                    value={linkUrl}
                                    onChange={e => setLinkUrl(e.target.value)}
                                    placeholder="https://google.drive..."
                                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                                    required
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmittingLink}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    {isSubmittingLink ? 'Guardando...' : 'Guardar en el Baúl'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Resources Grid */}
            {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/20">
                    <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                        <Paperclip className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-400">El baúl está vacío</h3>
                    <p className="text-zinc-600 text-sm mt-2 font-medium">Empieza a guardar recursos importantes aquí.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className={`group relative overflow-hidden rounded-3xl bg-[#0f0f0f] border border-white/5 p-6 hover:border-blue-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.15)] ${(resource as any).isOptimistic ? 'opacity-50 grayscale' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/20 group-hover:scale-110 transition-all">
                                    {(resource as any).isOptimistic ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : getFileIcon(resource.type)}
                                </div>
                                {!(resource as any).isOptimistic && (
                                    <div className="flex gap-2">
                                        <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all"
                                            title="Descargar/Ver"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(resource.id!)}
                                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/50 transition-all"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-bold text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-1">{resource.name}</h4>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <span>{resource.type.split('/')[1] || 'Recurso'}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span>{formatSize(resource.size)}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-600">
                                    Añadido: {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'N/A'}
                                </span>
                                <div className="flex -space-x-2">
                                    {/* Decoration */}
                                    <div className="w-5 h-5 rounded-full border border-zinc-800 bg-zinc-900" />
                                    <div className="w-5 h-5 rounded-full border border-zinc-800 bg-zinc-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubjectVault;
