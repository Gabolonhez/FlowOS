"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    iconColor = "text-primary",
    iconBgColor = "bg-primary/10",
}: StatCardProps) {
    return (
        <div className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                <div className={cn("p-2 rounded-lg", iconBgColor)}>
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">{value}</p>
        </div>
    );
}
