
"use client";

import { useEffect, useState, useCallback } from "react";
import { getDocs, createDoc, updateDoc, deleteDoc } from "@/lib/api";
import { Doc, DocType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Workflow, Save, Trash, Loader2 } from "lucide-react";
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection
} from "reactflow";
import "reactflow/dist/style.css";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export default function ProcessesPage() {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [docs, setDocs] = useState<Doc[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor State
    const [content, setContent] = useState("");
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        fetchDocs();
    }, []);

    useEffect(() => {
        const doc = docs.find(d => d.id === selectedDocId);
        if (doc) {
            if (doc.type === 'document') {
                setContent(doc.content || "");
            } else {
                if (doc.flowDiagramJson) {
                    setNodes(doc.flowDiagramJson.nodes || []);
                    setEdges(doc.flowDiagramJson.edges || []);
                } else {
                    setNodes([]);
                    setEdges([]);
                }
            }
        }
    }, [selectedDocId, docs]);

    async function fetchDocs() {
        try {
            const data = await getDocs();
            setDocs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(type: DocType) {
        const title = prompt(t('processes.enter_title'));
        if (!title) return;

        try {
            const newDoc = await createDoc({
                title,
                type,
                content: "",
                flowDiagramJson: { nodes: [], edges: [] }
            });
            setDocs([newDoc, ...docs]);
            setSelectedDocId(newDoc.id);
            toast({ title: t('common.success'), description: t('processes.created') });
        } catch (e) {
            toast({ title: t('common.error'), description: t('processes.create_error'), variant: "destructive" });
        }
    }

    async function handleSave() {
        if (!selectedDocId) return;
        const doc = docs.find(d => d.id === selectedDocId);
        if (!doc) return;

        setSaving(true);
        try {
            if (doc.type === 'document') {
                await updateDoc(doc.id, { content });
                // Update local state
                setDocs(docs.map(d => d.id === doc.id ? { ...d, content } : d));
            } else {
                const flowData = { nodes, edges };
                await updateDoc(doc.id, { flowDiagramJson: flowData });
                setDocs(docs.map(d => d.id === doc.id ? { ...d, flowDiagramJson: flowData } : d));
            }
            toast({ title: t('common.success'), description: t('processes.saved') });
        } catch (e) {
            toast({ title: t('common.error'), description: t('processes.save_error'), variant: "destructive" });
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('common.are_you_sure'))) return;
        try {
            await deleteDoc(id);
            setDocs(docs.filter(d => d.id !== id));
            if (selectedDocId === id) setSelectedDocId(null);
            toast({ title: t('common.success'), description: t('processes.deleted') });
        } catch (e) {
            toast({ title: t('common.error'), description: t('processes.delete_error'), variant: "destructive" });
        }
    }

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const selectedDoc = docs.find(d => d.id === selectedDocId);

    return (
        <div className="flex h-full bg-background overflow-hidden relative">
            {/* Sidebar */}
            <div className="w-64 border-r bg-card flex flex-col">
                <div className="p-4 border-b space-y-2">
                    <h2 className="font-semibold">{t('processes.title_main')}</h2>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCreate('document')}>
                            <FileText className="h-4 w-4 mr-1" /> {t('processes.doc_btn')}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleCreate('process')}>
                            <Workflow className="h-4 w-4 mr-1" /> {t('processes.flow_btn')}
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {docs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={cn(
                                "group flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-muted transition-colors",
                                selectedDocId === doc.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center gap-2 truncate">
                                {doc.type === 'process' ? <Workflow className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                <span className="truncate">{doc.title}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                            >
                                <Trash className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-background relative">
                {selectedDoc ? (
                    <>
                        <header className="h-14 border-b flex items-center justify-between px-6 bg-card/50">
                            <div className="flex items-center gap-2">
                                {selectedDoc.type === 'process' ? <Workflow className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                                <span className="font-medium">{selectedDoc.title}</span>
                            </div>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                {t('common.save')}
                            </Button>
                        </header>
                        <div className="flex-1 overflow-hidden relative">
                            {selectedDoc.type === 'document' ? (
                                <textarea
                                    className="w-full h-full p-8 resize-none bg-background focus:outline-none"
                                    placeholder={t('processes.placeholder')}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            ) : (
                                <div className="h-full w-full">
                                    <ReactFlow
                                        nodes={nodes}
                                        edges={edges}
                                        onNodesChange={onNodesChange}
                                        onEdgesChange={onEdgesChange}
                                        onConnect={onConnect}
                                        fitView
                                    >
                                        <Background />
                                        <Controls />
                                        <MiniMap />
                                    </ReactFlow>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4 opacity-20" />
                        <p>{t('processes.select_doc_desc')}</p> {/* Reusing select_doc_desc or no_docs_desc, 'Select a document from the sidebar to view or edit its contents' fits but the short one is 'Select a document or create a new one' -> no_docs_desc. The English in code was 'Select a document or create a new one' so I will use no_docs_desc */}
                    </div>
                )}
            </div>
        </div>
    );
}
