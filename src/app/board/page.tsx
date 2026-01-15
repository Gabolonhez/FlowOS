
"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { KanbanColumn } from "@/components/kanban/column";
import { TaskModal } from "@/components/kanban/task-modal";
import { Task, Project, TaskStatus } from "@/types";
import { getTasks, getProjects, updateTaskStatus, deleteTask } from "@/lib/api";
import { useProject } from "@/context/project-context";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import { Plus } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";



export default function BoardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

    const [activeId, setActiveId] = useState<string | null>(null);
    const { t } = useLanguage();
    const { toast } = useToast();

    const COLUMNS: { id: TaskStatus; title: string }[] = [
        { id: "ideas", title: t('board.ideas') },
        { id: "backlog", title: t('board.backlog') },
        { id: "in_progress", title: t('board.in_progress') },
        { id: "code_review", title: t('board.code_review') },
        { id: "done", title: t('board.done') },
        { id: "deployed", title: t('board.deployed') },
    ];

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }
    }));

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [t, p] = await Promise.all([getTasks(), getProjects()]);
            setTasks(t);
            setProjects(p);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function handleDeleteTask(taskId: string) {
        setDeleteTaskId(taskId);
    }

    async function confirmDelete() {
        if (!deleteTaskId) return;
        try {
            await deleteTask(deleteTaskId);
            setTasks(tasks.filter(t => t.id !== deleteTaskId));
            toast({ title: t('common.success'), description: "Task deleted successfully" });
        } catch (e) {
            console.error(e);
            toast({ title: t('common.error'), description: "Failed to delete task", variant: "destructive" });
        } finally {
            setDeleteTaskId(null);
        }
    }

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const taskId = active.id as string;
        const newStatus = over.id as TaskStatus;

        if (newStatus === tasks.find(t => t.id === taskId)?.status) return;

        // Optimistic Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ));

        try {
            await updateTaskStatus(taskId, newStatus);
        } catch (e) {
            console.error("Failed to update status", e);
            fetchData(); // Revert on error
        }
    }

    function handleTaskClick(task: Task) {
        setSelectedTask(task);
        setIsModalOpen(true);
    }

    function handleNewTask() {
        setSelectedTask(null);
        setIsModalOpen(true);
    }

    const { selectedProjectId } = useProject();

    // Filter tasks based on selected project
    const filteredTasks = tasks.filter(t =>
        selectedProjectId ? t.projectId === selectedProjectId : true
    );

    // Filter columns if needed? No, just tasks.

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <header className="flex items-center justify-between h-16 px-6 border-b shrink-0">
                <h1 className="text-lg font-semibold">{t('board.title')}</h1>
                <Button onClick={handleNewTask} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> {t('common.new_task')}
                </Button>
            </header>

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex h-full p-6 gap-6 min-w-max">
                        {COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                tasks={filteredTasks.filter(t => t.status === col.id)}
                                projects={projects}
                                onTaskClick={handleTaskClick}
                                onDelete={handleDeleteTask}
                            />
                        ))}
                    </div>
                </div>
            </DndContext>

            <TaskModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                task={selectedTask}
                onSuccess={fetchData}
            />

            <ConfirmDialog
                isOpen={!!deleteTaskId}
                onClose={() => setDeleteTaskId(null)}
                onConfirm={confirmDelete}
                title={t('common.delete_title')}
                description={t('common.delete_desc')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                variant="destructive"
            />
        </div>
    );
}
