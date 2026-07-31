import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { from, to, cc, subject, html } = await request.json()

    if (!from || !to || !subject || !html) {
      return Response.json(
        { error: "Missing required fields: from, to, subject, html" },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
    })

    if (error) {
      return Response.json({ error }, { status: 500 })
    }

    return Response.json({ data })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
