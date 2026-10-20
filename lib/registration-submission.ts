import pb from "@/lib/pb"

/** Stage the complete account journey; the server commits all records together. */
export class RegistrationSubmission {
  private data: Record<string, unknown>
  constructor(key: string) {
    this.data = { submission_key: key, cases: [] }
  }
  user(value: {
    name: string
    email: string
    contact_number: string
    [key: string]: unknown
  }) {
    this.data.user = value
    return { ...value, id: "" }
  }
  profile(collection: string, value: Record<string, unknown>) {
    this.data.profile = { collection, ...value }
  }
  case(value: Record<string, unknown>) {
    ;(this.data.cases as unknown[]).push(value)
  }
  async submit() {
    return pb.send<{ id: string }>("/api/dsc/register", {
      method: "POST",
      body: this.data,
    })
  }
}
