
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "@/lib/i18n";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedLang = localStorage.getItem("flowos_language") as Language;
        if (savedLang && ["en", "pt", "es"].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("flowos_language", lang);
    };

    const t = (path: string) => {
        const keys = path.split(".");
        let current: any = translations[language];

        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path;
            }
            current = current[key];
        }

        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {mounted ? children : <div className="invisible">{children}</div>}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
