import { Resend } from "resend"

const botToken = process.env.BOT_TOKEN

export async function POST(request: Request) {
  try {
    const { name, contact, email, issueType, caseType, consultationType, preferredDate, preferredTime, description } = await request.json()

    const message = [
      "*New Consultation Request*",
      "",
      `*Name:* ${name}`,
      `*Contact:* ${contact}`,
      `*Email:* ${email}`,
      issueType ? `*Issue Type:* ${issueType}` : "*Issue Type:*",
      caseType ? `*Case Type:* ${caseType}` : "*Case Type:*",
      consultationType ? `*Consultation Type:* ${consultationType === "online" ? "Online" : "Face to Face"}` : null,
      preferredDate ? `*Preferred Date:* ${preferredDate}` : null,
      preferredTime ? `*Preferred Time:* ${preferredTime}` : null,
      description ? `*Description:* ${description}` : "*Description:*",
    ].filter(Boolean).join("\n")


    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          chat_id: '-1003957107896',
          text: message,
          parse_mode: "Markdown"
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: "Telegram API error",
          telegram: data,
        },
        { status: response.status }
      );
    }

    return Response.json({ message: "Sent sucessfully" })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
