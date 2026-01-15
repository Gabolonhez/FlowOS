"use client";

import { Activity } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "@/lib/utils";

interface ActivityFeedProps {
    activities: Activity[];
}

const ACTION_COLORS: Record<Activity["action"], string> = {
    completed: "#10b981",
    moved: "#3b82f6",
    started: "#f59e0b",
    created: "#8b5cf6",
    commented: "#6b7280",
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const getActionText = (activity: Activity): string => {
        switch (activity.action) {
            case "completed":
                return "completed";
            case "moved":
                return `moved ${activity.details ? activity.details : ""}`;
            case "started":
                return "started working on";
            case "created":
                return "created";
            case "commented":
                return "commented on";
            default:
                return activity.action;
        }
    };

    return (
        <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                        <div className="relative">
                            <span
                                className="absolute -left-0.5 top-0 w-2 h-2 rounded-full"
                                style={{ backgroundColor: ACTION_COLORS[activity.action] }}
                            />
                            <Avatar className="h-6 w-6 ml-3">
                                <AvatarImage src={activity.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                    {activity.user?.full_name?.charAt(0) || '?'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">
                                <span className="font-medium">{activity.user?.full_name || 'Unknown User'}</span>{" "}
                                <span className="text-muted-foreground">{getActionText(activity)}</span>{" "}
                                <span className="text-primary font-mono">{activity.taskCode}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {activity.timestamp ? formatDistanceToNow(activity.timestamp) : 'Just now'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
