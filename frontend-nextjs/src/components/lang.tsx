"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { COPY, type Lang, type CopyShape } from "@/lib/copy";

const STORAGE_KEY = "oktae-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: CopyShape };

const LangContext = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: COPY.es,
});

function isLang(value: string | null): value is Lang {
  return value === "es" || value === "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang, t: COPY[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
