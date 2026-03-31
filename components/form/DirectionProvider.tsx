"use client";

import { useEffect } from "react";
import { Direction } from "radix-ui";
import { dir } from "@/lib/i18n";
import type { Lang } from "@/types/form";

interface Props {
  lang: Lang;
  children: React.ReactNode;
}

export function DirectionProvider({ lang, children }: Props) {
  const direction = dir(lang);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = lang;
  }, [lang, direction]);

  return (
    <Direction.DirectionProvider dir={direction}>
      <div dir={direction} lang={lang} className="contents">
        {children}
      </div>
    </Direction.DirectionProvider>
  );
}
