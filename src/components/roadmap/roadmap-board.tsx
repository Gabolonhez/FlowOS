"use client";

import { useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable
} from "@dnd-kit/core";
import { Version, Project, VersionStatus } from "@/types";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";
import { VersionCard } from "./version-card";

interface RoadmapBoardProps {
    versions: Version[];
    projects: Project[];
    onEdit: (version: Version) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: VersionStatus) => void;
}

const COLUMNS: { id: VersionStatus; titleKey: string }[] = [
    { id: "planned", titleKey: "roadmap.planned" },
    { id: "in_development", titleKey: "roadmap.in_development" },
    { id: "in_stores", titleKey: "roadmap.in_stores" },
    { id: "deprecated", titleKey: "roadmap.deprecated" },
];

function BoardColumn({
    id,
    title,
    versions,
    projects,
    onEdit,
    onDelete
}: {
    id: VersionStatus,
    title: string,
    versions: Version[],
    projects: Project[],
    onEdit: (v: Version) => void,
    onDelete: (id: string) => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div className="flex flex-col h-full min-w-[300px] w-1/3">
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">{title}</h3>
                <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
                    {versions.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 bg-muted/20 rounded-lg p-3 space-y-3 overflow-y-auto no-scrollbar",
                    isOver && "bg-primary/5 ring-1 ring-primary/20"
                )}
            >
                {versions.map(version => (
                    <VersionCard
                        key={version.id}
                        version={version}
                        project={projects.find(p => p.id === version.projectId)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
}

export function RoadmapBoard({ versions, projects, onEdit, onDelete, onStatusChange }: RoadmapBoardProps) {
    const { t } = useLanguage();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 }
    }));

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const versionId = active.id as string;
        const newStatus = over.id as VersionStatus;
        const currentVersion = versions.find(v => v.id === versionId);

        if (currentVersion && currentVersion.status !== newStatus) {
            onStatusChange(versionId, newStatus);
        }
    }

    const activeVersion = activeId ? versions.find(v => v.id === activeId) : null;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-full gap-6 overflow-x-auto pb-4">
                {COLUMNS.map(col => (
                    <BoardColumn
                        key={col.id}
                        id={col.id}
                        title={t(col.titleKey)}
                        versions={versions.filter(v => v.status === col.id)}
                        projects={projects}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeVersion ? (
                    <VersionCard
                        version={activeVersion}
                        project={projects.find(p => p.id === activeVersion.projectId)}
                        onEdit={() => { }}
                        onDelete={() => { }}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
