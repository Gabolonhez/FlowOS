
"use client";

import { useEffect, useState } from "react";
import { getVersions, getProjects, createVersion, updateVersion, deleteVersion } from "@/lib/api";
import { Version, Project, VersionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, MoreHorizontal, Trash, Calendar } from "lucide-react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/context/project-context";
import { useLanguage } from "@/context/language-context";

export default function RoadmapPage() {
    const [versions, setVersions] = useState<Version[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        projectId: "",
        status: "in_development" as VersionStatus,
        releaseDate: "",
        notes: ""
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [vData, pData] = await Promise.all([getVersions(), getProjects()]);
            setVersions(vData);
            setProjects(pData);
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: t('roadmap.load_error'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.projectId || !formData.name) return;

        setSubmitting(true);
        try {
            await createVersion({
                ...formData,
                projectId: formData.projectId,
            });
            toast({ title: t('common.success'), description: t('roadmap.version_created') });
            setIsDialogOpen(false);
            fetchData();
            setFormData({ name: "", projectId: "", status: "in_development", releaseDate: "", notes: "" });
        } catch (error) {
            console.error(error)
            toast({ title: t('common.error'), description: t('roadmap.create_error'), variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('common.are_you_sure'))) return;
        try {
            await deleteVersion(id);
            toast({ title: t('common.success'), description: t('roadmap.version_deleted') });
            fetchData();
        } catch (e) {
            toast({ title: t('common.error'), description: t('roadmap.delete_error'), variant: "destructive" });
        }
    }

    const getStatusColor = (status: VersionStatus) => {
        switch (status) {
            case "in_development": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "in_stores": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "deprecated": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            default: return "bg-slate-500/10 text-slate-500";
        }
    };

    const getStatusLabel = (status: VersionStatus) => {
        switch (status) {
            case "in_development": return t('roadmap.in_development');
            case "in_stores": return t('roadmap.in_stores');
            case "deprecated": return t('roadmap.deprecated');
            default: return status;
        }
    };

    const { selectedProjectId, selectedProject } = useProject();

    // Filter versions based on selected project
    const filteredVersions = versions.filter(v =>
        selectedProjectId ? v.projectId === selectedProjectId : true
    );

    // Initial project selection for new version dialog
    useEffect(() => {
        if (selectedProjectId) {
            setFormData(prev => ({ ...prev, projectId: selectedProjectId }));
        }
    }, [selectedProjectId]);

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    return (
        <div className="flex flex-col h-full bg-background text-foreground animate-in fade-in duration-500">
            <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/50 backdrop-blur">
                <div>
                    <h1 className="text-xl font-semibold">{t('roadmap.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('roadmap.subtitle')}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setFormData(prev => ({ ...prev, projectId: selectedProjectId || projects[0]?.id || "" }))}>
                            <Plus className="h-4 w-4" /> {t('common.new_version')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{t('roadmap.create_version')}</DialogTitle>
                            <DialogDescription>{t('roadmap.create_desc')}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="project">{t('common.project')}</Label>
                                <Select
                                    value={formData.projectId}
                                    onValueChange={(val) => setFormData({ ...formData, projectId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('common.select_project')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('roadmap.version_name')}</Label>
                                <Input id="name" placeholder="v1.0.0" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">{t('common.status')}</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: VersionStatus) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in_development">{t('roadmap.in_development')}</SelectItem>
                                        <SelectItem value="in_stores">{t('roadmap.in_stores')}</SelectItem>
                                        <SelectItem value="deprecated">{t('roadmap.deprecated')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">{t('roadmap.release_date')}</Label>
                                <Input id="date" type="date" value={formData.releaseDate} onChange={e => setFormData({ ...formData, releaseDate: e.target.value })} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <div className="flex-1 p-6 overflow-auto">
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('common.version_name')}</TableHead>
                                <TableHead>{t('common.project')}</TableHead>
                                <TableHead>{t('common.status')}</TableHead>
                                <TableHead>{t('roadmap.release_date')}</TableHead>
                                <TableHead className="text-right">{t('common.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVersions.map((version) => {
                                const project = projects.find(p => p.id === version.projectId);
                                return (
                                    <TableRow key={version.id}>
                                        <TableCell className="font-medium">{version.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" style={{ borderColor: project?.color, color: project?.color }}>
                                                {project?.name || t('common.unknown')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${getStatusColor(version.status)}`}>
                                                {getStatusLabel(version.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {version.releaseDate ? new Date(version.releaseDate).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(version.id)}>
                                                        <Trash className="mr-2 h-4 w-4" /> {t('common.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {versions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {t('roadmap.no_versions')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div >
    );
}
