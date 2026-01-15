"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

export function PromptDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    placeholder,
    defaultValue = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
}: PromptDialogProps) {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-2">
                    <Input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && value.trim()) {
                                e.preventDefault();
                                onConfirm(value);
                            }
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" disabled={loading} onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => onConfirm(value)}
                        disabled={loading || !value.trim()}
                    >
                        {loading ? "..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
