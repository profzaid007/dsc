const botToken = process.env.BOT_TOKEN
const ADMIN_CHAT_ID = "-1003957107896"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return Response.json(
        { error: "Missing required field: text" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return Response.json(
        {
          error: "Telegram API error",
          telegram: data,
        },
        { status: response.status }
      )
    }

    return Response.json({ message: "Sent successfully" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
