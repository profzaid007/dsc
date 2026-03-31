"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/lang-context";
import { t, UI_STRINGS } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, toggleLang } = useLang();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLang}
      className="gap-1.5"
    >
      <Languages className="h-4 w-4" />
      {t(UI_STRINGS.language_label, lang)}
    </Button>
  );
}
