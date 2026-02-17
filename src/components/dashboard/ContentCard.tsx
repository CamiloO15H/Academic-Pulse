'use client';

import React, { useState, useRef } from 'react';
import { AcademicContent } from '../../domain/entities/AcademicContent';
import { Calendar, ChevronDown, CheckCircle2, Copy, Check, Edit2, Save, X, Link as LinkIcon, Paperclip, Plus, Trash2, MessageCircle, FileText, ImageIcon, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { updateAcademicContent, uploadAttachment } from '@/app/actions';
import { toast } from 'sonner';
import { formatUTC, toISODateUTC, toUTCDate } from '@/application/utils/date';

interface ContentCardProps {
    content: AcademicContent;
    onAskAI?: (content: AcademicContent) => void;
    onDelete?: (id: string) => void;
    onUpdate?: () => void;
    className?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ content, onAskAI, onDelete, onUpdate, className }) => {
    const [displayContent, setDisplayContent] = useState<AcademicContent>(content);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(content.title);
    const [editedDescription, setEditedDescription] = useState(content.description);
    const [editedClassDate, setEditedClassDate] = useState(toISODateUTC(content.classDate));
    const [editedNotes, setEditedNotes] = useState(content.notes || '');
    const [isQuickEditingNotes, setIsQuickEditingNotes] = useState(false);
    const [isSavingQuickNotes, setIsSavingQuickNotes] = useState(false);

    // Sync local state if props change (e.g. parent refetch)
    React.useEffect(() => {
        setDisplayContent(content);
        setEditedTitle(content.title);
        setEditedDescription(content.description);
        setEditedClassDate(toISODateUTC(content.classDate));
        setEditedNotes(content.notes || '');
    }, [content]);

    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [newAttachmentName, setNewAttachmentName] = useState('');
    const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!content.id) return;
        setIsSaving(true);
        try {
            const result = await updateAcademicContent(content.id, {
                title: editedTitle,
                description: editedDescription,
                notes: editedNotes,
                classDate: editedClassDate ? toUTCDate(editedClassDate) : undefined
            });

            if (result.status === 'SUCCESS' && result.data) {
                setDisplayContent(result.data as AcademicContent);
                setIsEditing(false);
                setIsQuickEditingNotes(false);
                toast.success('Cambios guardados');
                if (onUpdate) onUpdate();
            } else {
                toast.error('Error al guardar cambios');
            }
        } catch (error) {
            console.error('Failed to save changes:', error);
            toast.error('Error al guardar cambios');
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickSaveNotes = async () => {
        if (!content.id) return;
        setIsSavingQuickNotes(true);
        try {
            const result = await updateAcademicContent(content.id, {
                notes: editedNotes
            });

            if (result.status === 'SUCCESS' && result.data) {
                setDisplayContent(result.data as AcademicContent);
                setIsQuickEditingNotes(false);
                toast.success('Nota guardada');
                if (onUpdate) onUpdate();
            } else {
                toast.error('Error al guardar nota');
            }
        } catch (error) {
            console.error('Failed to save quick notes:', error);
            toast.error('Error al guardar nota');
        } finally {
            setIsSavingQuickNotes(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !content.id) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        if (!content.id) return;

        // 10MB Limit
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El archivo es demasiado grande (Máx 10MB)');
            return;
        }

        setIsUploading(true);
        try {
            const reader = new FileReader();

            reader.onload = async () => {
                const base64 = (reader.result as string).split(',')[1];
                const result = await uploadAttachment(content.id!, file.name, base64, file.type);

                if (result.status === 'SUCCESS' && result.data) {
                    const newAttachment = result.data as any;
                    setDisplayContent(prev => ({
                        ...prev,
                        attachments: [...(prev.attachments || []), newAttachment]
                    }));
                    toast.success('Archivo subido correctamente');
                    if (onUpdate) await onUpdate();
                    setShowAttachmentOptions(false);
                } else {
                    console.error('[Upload Error]', result.message);
                    toast.error(result.message || 'Error al subir archivo');
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Error al procesar archivo');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    await uploadFile(file);
                    toast.info('Subiendo imagen pegada...');
                }
            }
        }
    };

    const handleAddLink = async () => {
        if (!content.id || !newAttachmentName || !newAttachmentUrl) return;
        setIsSaving(true);
        try {
            const currentAttachments = displayContent.attachments || [];
            const newAttachment = { name: newAttachmentName, url: newAttachmentUrl, type: 'link' };
            const newAttachments = [...currentAttachments, newAttachment];

            const result = await updateAcademicContent(content.id, { attachments: newAttachments });

            if (result.status === 'SUCCESS' && result.data) {
                setDisplayContent(result.data as AcademicContent);
                setShowLinkInput(false);
                setShowAttachmentOptions(false);
                setNewAttachmentName('');
                setNewAttachmentUrl('');
                toast.success('Enlace añadido');
            } else {
                toast.error('Error al añadir enlace');
            }
        } catch (error) {
            console.error('Failed to add attachment:', error);
            toast.error('Error al añadir enlace');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAttachment = async (idx: number) => {
        if (!content.id) return;
        setIsSaving(true);
        try {
            const newAttachments = [...(displayContent.attachments || [])];
            newAttachments.splice(idx, 1);
            const result = await updateAcademicContent(content.id, { attachments: newAttachments });

            if (result.status === 'SUCCESS' && result.data) {
                setDisplayContent(result.data as AcademicContent);
                toast.success('Adjunto eliminado');
            } else {
                toast.error('Error al eliminar adjunto');
            }
        } catch (error) {
            console.error('Failed to remove attachment:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const copyToClipboard = () => {
        const text = `
Título: ${content.title}
Descripción: ${content.description}

Key Insights:
${content.keyInsights?.map(i => `- ${i}`).join('\n')}

Notas:
${content.notes || 'Sin notas.'}

Plan de Estudio:
${content.studySteps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getImportanceColor = (level?: number) => {
        if (!level) return 'border-blue-500/30 text-blue-500 bg-blue-500/10';
        if (level >= 5) return 'border-red-500 text-red-500 bg-red-500/10 shadow-sm';
        if (level >= 3) return 'border-yellow-500 text-yellow-600 bg-yellow-500/10';
        return 'border-blue-500 text-blue-500 bg-blue-500/10';
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-4 h-4" />;
        if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
        if (type === 'link') return <LinkIcon className="w-4 h-4" />;
        return <Paperclip className="w-4 h-4" />;
    };

    return (
        <div
            onPaste={handlePaste}
            className={`group relative overflow-hidden rounded-[2rem] border border-border bg-card p-1 transition-all duration-500 hover:border-primary/30 hover:shadow-lg ${className || ''}`}
        >
            <div className="flex flex-col h-full rounded-[1.8rem] bg-card p-7 transition-colors relative overflow-hidden">

                {/* Uploading Overlay Animation */}
                {isUploading && (
                    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-500">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin transition-all duration-1000" />
                            <div className="absolute inset-4 flex items-center justify-center bg-primary/10 rounded-full animate-pulse">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h4 className="text-xl font-black text-foreground tracking-tight animate-pulse">
                                PROCESANDO
                            </h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                                Sincronizando Cerebrito...
                            </p>
                        </div>
                    </div>
                )}

                {/* Header: Importance & Status */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getImportanceColor(displayContent.importanceLevel)}`}>
                        {displayContent.importanceLevel && displayContent.importanceLevel >= 5 ? 'Prioridad Crítica' : `Nivel ${displayContent.importanceLevel || 1}`}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1.5 rounded-full bg-secondary border border-border px-4 py-1.5 text-[11px] font-bold text-muted-foreground">
                            {displayContent.sourceType === 'transcription' ? '🎤' : '📄'} {displayContent.contentType || 'Apunte'}
                        </span>
                    </div>
                </div>

                {/* Actions Floating Bar (Always Visible on Hover) */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={copyToClipboard}
                        className="p-2.5 rounded-xl bg-background border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all hover:scale-110"
                        title="Copiar"
                    >
                        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onAskAI?.(displayContent)}
                        className="p-2.5 rounded-xl bg-primary border border-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110 shadow-lg shadow-primary/20"
                        title="Preguntar a la IA"
                    >
                        <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2.5 rounded-xl border transition-all hover:scale-110 ${isEditing ? 'bg-orange-600 border-orange-500 text-white' : 'bg-background border-border text-muted-foreground hover:text-foreground'}`}
                        title="Editar"
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onDelete?.(displayContent.id!)}
                        className="p-2.5 rounded-xl bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-all hover:scale-110"
                        title="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="space-y-6">
                    <div>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="w-full text-3xl font-black leading-tight text-foreground bg-secondary rounded-2xl p-4 border-2 border-transparent outline-none focus:border-primary transition-all"
                            />
                        ) : (
                            <h3 className="text-3xl font-black leading-tight text-foreground group-hover:text-primary transition-colors font-display">
                                {displayContent.title}
                            </h3>
                        )}

                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-primary" />
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editedClassDate}
                                        onChange={(e) => setEditedClassDate(e.target.value)}
                                        className="text-xs font-bold uppercase tracking-wider bg-transparent outline-none text-foreground"
                                    />
                                ) : (
                                    <span className="text-[11px] font-bold uppercase tracking-widest">
                                        {formatUTC(displayContent.classDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/50 to-transparent" />
                        {isEditing ? (
                            <textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="w-full text-base leading-relaxed text-foreground bg-secondary rounded-2xl p-4 border-2 border-transparent outline-none min-h-[120px] focus:border-primary transition-all italic"
                                placeholder="Descripción del blogcito..."
                            />
                        ) : (
                            <p className="text-base leading-relaxed text-muted-foreground font-medium italic">
                                "{displayContent.description}"
                            </p>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="rounded-2xl bg-secondary/30 border border-border p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Mis Notas Personales</span>
                            {!isEditing && !isQuickEditingNotes && (
                                <button
                                    onClick={() => setIsQuickEditingNotes(true)}
                                    className="p-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                    title="Añadir/Editar Nota"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {isEditing || isQuickEditingNotes ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editedNotes}
                                    onChange={(e) => setEditedNotes(e.target.value)}
                                    onPaste={handlePaste}
                                    className="w-full text-sm text-foreground bg-background rounded-xl p-3 border border-border outline-none min-h-[80px] focus:border-primary/50"
                                    placeholder="Añade notas aquí (puedes pegar imágenes)..."
                                    autoFocus={isQuickEditingNotes}
                                />
                                {isQuickEditingNotes && (
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setIsQuickEditingNotes(false)}
                                            className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            CANCELAR
                                        </button>
                                        <button
                                            onClick={handleQuickSaveNotes}
                                            disabled={isSavingQuickNotes}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all disabled:opacity-50"
                                        >
                                            {isSavingQuickNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                            Guardar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                {displayContent.notes || 'No has añadido notas para este blogcito aún.'}
                            </p>
                        )}
                    </div>

                    {/* Attachments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Documentación & Recursos</span>
                            <button
                                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary border border-border text-muted-foreground text-[10px] font-black uppercase tracking-wider hover:bg-secondary/80 transition-all"
                            >
                                <Plus className="w-3 h-3" /> Añadir
                            </button>
                        </div>

                        {showAttachmentOptions && (
                            <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 duration-300">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-background border border-border hover:border-primary/50 group/btn transition-all"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ImageIcon className="w-4 h-4 text-primary" />}
                                    <span className="text-xs font-bold text-muted-foreground group-hover/btn:text-foreground">Subir Imagen</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-background border border-border hover:border-primary/50 group/btn transition-all"
                                >
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Upload className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary" />}
                                    <span className="text-xs font-bold text-muted-foreground group-hover/btn:text-foreground">Subir Archivo</span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    />
                                </button>
                                <button
                                    onClick={() => setShowLinkInput(true)}
                                    className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-background border border-border hover:border-primary/50 group/btn transition-all"
                                >
                                    <LinkIcon className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary" />
                                    <span className="text-xs font-bold text-muted-foreground group-hover/btn:text-foreground">Añadir Link Externo</span>
                                </button>
                            </div>
                        )}

                        {showLinkInput && (
                            <div className="p-4 rounded-2xl bg-secondary border border-border space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre del recurso..."
                                    value={newAttachmentName}
                                    onChange={e => setNewAttachmentName(e.target.value)}
                                    className="w-full text-xs p-3 rounded-xl bg-background border border-border outline-none font-bold text-foreground placeholder:text-muted-foreground"
                                />
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={newAttachmentUrl}
                                    onChange={e => setNewAttachmentUrl(e.target.value)}
                                    className="w-full text-xs p-3 rounded-xl bg-background border border-border outline-none font-bold text-foreground placeholder:text-muted-foreground"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddLink}
                                        disabled={isSaving}
                                        className="flex-1 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-primary/90 shadow-sm"
                                    >
                                        Guardar Enlace
                                    </button>
                                    <button
                                        onClick={() => setShowLinkInput(false)}
                                        className="px-4 py-2.5 bg-background text-muted-foreground rounded-xl text-[10px] font-black hover:bg-secondary"
                                    >
                                        CANCELAR
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {displayContent.attachments && displayContent.attachments.length > 0 ? (
                                displayContent.attachments.map((file, idx) => (
                                    <div key={idx} className="flex flex-col rounded-2xl bg-secondary/30 border border-border group/att overflow-hidden hover:bg-secondary/50 transition-all">
                                        {file.type.includes('image') && (
                                            <div className="relative aspect-video w-full overflow-hidden bg-black/5 border-b border-border">
                                                <img
                                                    src={file.url}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/att:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center">
                                                    <ExternalLink className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-xl bg-background text-primary shadow-sm border border-border">
                                                    {getFileIcon(file.type)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[120px]"
                                                    >
                                                        {file.name}
                                                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                                                    </a>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {file.type.split('/')[1] || 'Recurso'} • {file.size ? `${(file.size / 1024 / 1024).toFixed(1)}MB` : 'vínculo'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveAttachment(idx)}
                                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all md:opacity-0 md:group-hover/att:opacity-100"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-[10px] italic text-muted-foreground animate-pulse">Sin recursos vinculados.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Study Steps - Collapsible */}
                <div className="mt-8 border-t border-border pt-6">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex w-full items-center justify-between group/expander"
                    >
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">
                            Ruta de Aprendizaje
                        </span>
                        <div className={`p-1.5 rounded-lg bg-background border border-border transition-all duration-300 ${isExpanded ? 'rotate-180 border-primary/50 text-primary' : 'text-muted-foreground'}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    {isExpanded && displayContent.studySteps && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            {displayContent.studySteps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 items-center p-4 rounded-2xl bg-secondary/20 border border-border group/step hover:bg-secondary/40 transition-all">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-[12px] font-black text-primary-foreground shadow-lg shadow-primary/20 group-hover/step:scale-110 transition-transform">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm font-bold text-foreground leading-snug">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Buttons for Editing */}
                {isEditing && (
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isSaving ? 'Guardando...' : 'Aplicar Cambios'}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedTitle(content.title);
                                setEditedDescription(content.description);
                                setEditedNotes(content.notes || '');
                            }}
                            className="px-6 py-4 bg-secondary text-muted-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-secondary/80 transition-all active:scale-95"
                        >
                            X
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentCard;
