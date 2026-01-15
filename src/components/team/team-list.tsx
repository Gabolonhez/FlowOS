"use client";

import { useState } from "react";
import { TeamMember } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash, Search, Shield, Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useLanguage } from "@/context/language-context";
import { createMember, deleteMember } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface TeamListProps {
    initialMembers: TeamMember[];
}

export function TeamList({ initialMembers }: TeamListProps) {
    const [members, setMembers] = useState<TeamMember[]>(initialMembers);
    const [search, setSearch] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { t } = useLanguage();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form state
    const [newName, setNewName] = useState("");
    const [newNickname, setNewNickname] = useState("");
    const [newRole, setNewRole] = useState("");

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.nickname?.toLowerCase().includes(search.toLowerCase()) ||
        m.role?.toLowerCase().includes(search.toLowerCase())
    );

    async function handleAdd() {
        if (!newName) return;
        setLoading(true);
        try {
            const newMember = await createMember({
                name: newName,
                nickname: newNickname,
                role: newRole
            });
            setMembers([newMember, ...members]);
            setIsAddOpen(false);
            setNewName("");
            setNewNickname("");
            setNewRole("");
            toast({ title: t('common.success'), description: t('team.member_added') });
        } catch {
            toast({ title: t('common.error'), description: t('team.add_error'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!deleteId) return;
        try {
            await deleteMember(deleteId);
            setMembers(members.filter(m => m.id !== deleteId));
            toast({ title: t('common.success'), description: t('team.member_removed') });
        } catch {
            toast({ title: t('common.error'), description: t('team.remove_error'), variant: "destructive" });
        } finally {
            setDeleteId(null);
        }
    }

    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('team.title')}</h1>
                <p className="text-muted-foreground">
                    {t('team.subtitle')}
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('team.search_placeholder')}
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsAddOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> {t('team.add_member')}
                    </Button>
                </div>

                <div className="bg-card rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('team.member')}</TableHead>
                                <TableHead>{t('team.nickname')}</TableHead>
                                <TableHead>{t('team.role')}</TableHead>
                                <TableHead className="text-right">{t('team.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.avatarUrl} />
                                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{member.name}</span>
                                    </TableCell>
                                    <TableCell>{member.nickname || "-"}</TableCell>
                                    <TableCell>
                                        {member.role && (
                                            <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full w-fit">
                                                <Shield className="h-3 w-3" />
                                                {member.role}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteId(member.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        {t('team.no_members')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Custom Dialog for Adding Member */}
                {isAddOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">{t('team.add_dialog_title')}</h2>
                                <p className="text-sm text-muted-foreground">{t('team.add_dialog_desc')}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('team.full_name')}</label>
                                    <Input placeholder="John Doe" value={newName} onChange={(e) => setNewName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('team.nickname_optional')}</label>
                                    <Input placeholder="Johnny" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('team.role_optional')}</label>
                                    <Input placeholder="Developer" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
                                <Button onClick={handleAdd} disabled={!newName || loading}>
                                    {loading ? t('team.adding') : t('team.add_member')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <ConfirmDialog
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={handleDelete}
                    title={t('team.remove_dialog_title')}
                    description={t('team.remove_dialog_desc')}
                    confirmText={t('common.delete')}
                    cancelText={t('common.cancel')}
                    variant="destructive"
                />
            </div>
        </div>
    );
}
