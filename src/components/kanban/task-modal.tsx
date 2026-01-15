
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, Project, Version, Profile, TaskStatus, TaskPriority } from "@/types";
import { createTask, updateTask, getProjects, getVersions, getProfiles } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

interface TaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    onSuccess: () => void;
}

export function TaskModal({ open, onOpenChange, task, onSuccess }: TaskModalProps) {
    const { toast } = useToast();
    const { t } = useLanguage();
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [versions, setVersions] = useState<Version[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "ideas" as TaskStatus,
        priority: "medium" as TaskPriority,
        projectId: "",
        versionId: "",
        assigneeId: "none"
    });

    useEffect(() => {
        if (open) {
            Promise.all([getProjects(), getVersions(), getProfiles()]).then(([p, v, u]) => {
                setProjects(p);
                setVersions(v);
                setProfiles(u);
            });
            if (task) {
                setFormData({
                    title: task.title,
                    description: task.description || "",
                    status: task.status,
                    priority: task.priority,
                    projectId: task.projectId,
                    versionId: task.versionId || "",
                    assigneeId: task.assigneeId || "none"
                });
            } else {
                setFormData({
                    title: "",
                    description: "",
                    status: "ideas",
                    priority: "medium",
                    projectId: projects[0]?.id || "",
                    versionId: "",
                    assigneeId: "none"
                });
            }
        }
    }, [open, task]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data: any = {
                ...formData,
                assigneeId: formData.assigneeId === "none" ? null : formData.assigneeId,
                versionId: formData.versionId === "" ? null : formData.versionId
            };

            if (task) {
                await updateTask(task.id, data);
            } else {
                await createTask(data);
            }
            toast({ title: t('common.success'), description: "Task saved" });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({ title: t('common.error'), description: "Failed to save task", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{task ? t('board.edit_task') : t('board.create_task')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('common.title')}</Label>
                        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('common.project')}</Label>
                            <Select value={formData.projectId} onValueChange={v => setFormData({ ...formData, projectId: v })}>
                                <SelectTrigger><SelectValue placeholder={t('common.select_project')} /></SelectTrigger>
                                <SelectContent>
                                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('roadmap.title')}</Label>
                            <Select value={formData.versionId} onValueChange={v => setFormData({ ...formData, versionId: v })}>
                                <SelectTrigger><SelectValue placeholder={t('common.none')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">{t('common.none')}</SelectItem>
                                    {versions.filter(v => !formData.projectId || v.projectId === formData.projectId).map(v => (
                                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('common.status')}</Label>
                            <Select value={formData.status} onValueChange={(v: TaskStatus) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ideas">{t('board.ideas')}</SelectItem>
                                    <SelectItem value="backlog">{t('board.backlog')}</SelectItem>
                                    <SelectItem value="in_progress">{t('board.in_progress')}</SelectItem>
                                    <SelectItem value="code_review">{t('board.code_review')}</SelectItem>
                                    <SelectItem value="done">{t('board.done')}</SelectItem>
                                    <SelectItem value="deployed">{t('board.deployed')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('common.priority')}</Label>
                            <Select value={formData.priority} onValueChange={(v: TaskPriority) => setFormData({ ...formData, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">{t('board.low')}</SelectItem>
                                    <SelectItem value="medium">{t('board.medium')}</SelectItem>
                                    <SelectItem value="high">{t('board.high')}</SelectItem>
                                    <SelectItem value="critical">{t('board.critical')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('common.assignee')}</Label>
                        <Select value={formData.assigneeId} onValueChange={v => setFormData({ ...formData, assigneeId: v })}>
                            <SelectTrigger><SelectValue placeholder={t('common.unassigned')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('common.unassigned')}</SelectItem>
                                {profiles.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.full_name || p.email || t('common.unknown')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('common.save')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
