export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4 pt-10">
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  )
}
