"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { TaskStatus, Task, Project } from "@/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { Input } from "@/components/ui/input";

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    tasks: Task[];
    projects: Project[];
    onTaskClick: (task: Task) => void;
    onDelete: (id: string) => void;
    selectedTaskIds?: string[];
    onToggleSelect?: (id: string) => void;
    onRename?: (newTitle: string) => void;
}

export function KanbanColumn({ id, title, tasks, projects, onTaskClick, onDelete, selectedTaskIds, onToggleSelect, onRename }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);

    const handleSave = () => {
        if (tempTitle.trim() && tempTitle !== title) {
            onRename?.(tempTitle.trim());
        } else {
            setTempTitle(title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setTempTitle(title);
            setIsEditing(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-w-[300px] w-[300px]">
            <div className="flex items-center justify-between mb-4 px-2 h-8">
                {isEditing ? (
                    <Input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="h-7 text-sm font-semibold uppercase"
                    />
                ) : (
                    <h3
                        className="font-semibold text-sm text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setIsEditing(true)}
                    >
                        {title}
                    </h3>
                )}
                <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full ml-2">
                    {tasks.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-muted/20 rounded-lg p-3 space-y-3 overflow-y-auto no-scrollbar",
                    isOver && "bg-primary/5 ring-1 ring-primary/20"
                )}
            >
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        project={projects.find(p => p.id === task.projectId)}
                        onClick={onTaskClick}
                        onDelete={onDelete}
                        selected={selectedTaskIds?.includes(task.id)}
                        onToggleSelect={onToggleSelect}
                    />
                ))}
            </div>
        </div>
    );
}
