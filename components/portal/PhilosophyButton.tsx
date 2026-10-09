"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { useLang } from "@/lib/lang-context"
import type { BilingualString } from "@/types/form"

interface PhilosophyButtonProps {
  philosophy: BilingualString
}

export function PhilosophyButton({ philosophy }: PhilosophyButtonProps) {
  const { lang } = useLang()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-fit h-11 px-4 text-sm lg:px-8 lg:py-6 lg:text-base font-semibold shadow-lg"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            borderColor: "rgba(255,255,255,0.7)",
          }}
        >
          {t({ en: "Portal Philosophy", ar: "فلسفة البوابة" }, lang)}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t({ en: "Portal Philosophy", ar: "فلسفة البوابة" }, lang)}</DialogTitle>
          <DialogDescription className="whitespace-pre-line leading-relaxed">
            {t(philosophy, lang)}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
