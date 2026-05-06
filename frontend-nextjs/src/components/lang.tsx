"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { COPY, Lang, CopyShape } from "@/lib/copy";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: CopyShape };

const LangContext = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: COPY.es,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es");
  return (
    <LangContext.Provider value={{ lang, setLang, t: COPY[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
