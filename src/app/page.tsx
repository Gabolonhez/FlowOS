
"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import { Task, Version } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, CheckCircle2, Clock, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

export default function Dashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ tasks: Task[], versions: Version[] } | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">{t('common.loading')}</div>;
  if (!stats) return <div className="p-8">{t('common.error')}</div>;

  const totalTasks = stats.tasks.length;
  const completedTasks = stats.tasks.filter(t => t.status === 'done' || t.status === 'deployed').length;
  const activeVersions = stats.versions.filter(v => v.status === 'in_development').length;

  const recentTasks = [...stats.tasks].sort((a, b) =>
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  ).slice(0, 5);

  return (
    <div className="p-8 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('common.dashboard')}</h1>
        <div className="flex items-center gap-2">
          {/* Add user menu or sync status here if needed */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.total_tasks')}</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.quick_stats')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completed_tasks')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">{t('common.status')}: {t('board.done')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.active_versions')}</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVersions}</div>
            <p className="text-xs text-muted-foreground">{t('roadmap.in_development')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{task.code} • {task.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(task.createdAt)}
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && <p className="text-muted-foreground text-sm">{t('board.no_tasks')}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.quick_actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/board">
              <div className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center justify-between">
                <span className="text-sm font-medium">{t('common.new_task')}</span>
                <LayoutDashboard className="h-4 w-4 opacity-50" />
              </div>
            </Link>
            <Link href="/roadmap">
              <div className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.plan_version')}</span>
                <Map className="h-4 w-4 opacity-50" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
