import Link from "next/link"

interface InfoPageProps {
  params: Promise<{ id: string }>
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="mb-8 inline-block text-sm text-muted-foreground hover:underline">
        ← Back
      </Link>
      <h1 className="mb-6 text-3xl font-bold capitalize">
        {id.replace(/-/g, " ")}
      </h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
        </p>
      </div>
    </div>
  )
}
