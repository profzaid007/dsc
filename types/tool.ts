export type ToolType =
  | "survey"
  | "multiple_answer"
  | "media_question"
  | "report"
  | "plan"
export type ServiceType = "individual" | "institution" | "both"
export type ToolStatus = "active" | "inactive" | "archived"

export interface BilingualString {
  en: string
  ar: string
}

export interface ToolOption {
  value: string
  label: BilingualString
}

// ============ SURVEY ============

export type SurveyAnswerType = "single_choice" | "multiple_choice" | "rating"

export interface SurveyQuestion {
  id: string
  text: BilingualString
  answerType: SurveyAnswerType
  options: ToolOption[] // default 5, can add more
  required: boolean
  order: number
}

export interface SurveyConfig {
  title: BilingualString
  questions: SurveyQuestion[]
  media: string[]
}

// ============ MULTIPLE ANSWER BUILDER ============

export type MCAnswerType =
  | "text"
  | "number"
  | "single_choice"
  | "multiple_choice"

export interface MCQuestionOption extends ToolOption {
  isCorrect: boolean // admin marks correct answer
}

export interface MCQuestion {
  id: string
  text: BilingualString
  answerType: MCAnswerType
  options: MCQuestionOption[]
  required: boolean
  order: number
}

export interface MultipleChoiceConfig {
  title: BilingualString
  questions: MCQuestion[]
  media: string[]
}

// ============ MEDIA QUESTIONS ============

export type MediaType = "image" | "video" | "audio"
export type ResponseType = "text" | "video" | "audio"

export interface MediaItem {
  id: string
  question: BilingualString
  mediaType: MediaType
  mediaData: string // base64 encoded, max 20MB
  responseType: ResponseType
  order: number
}

export interface MediaConfig {
  title: BilingualString
  items: MediaItem[]
  media: string[]
}

// ============ REPORT ============

export interface ReportCustomField {
  id: string
  label: BilingualString
  type: "text" | "textarea" | "date"
}

export interface ReportConfig {
  title: BilingualString
  expertNameField: BilingualString // editable label, default "Expert Name"
  customFields: ReportCustomField[]
  media: string[]
}
// Fixed fields (always present): Title, Date, Assessment, Suggestions

// ============ PLAN ============

export interface PlanGoal {
  id: string
  title: BilingualString
  description?: BilingualString
  order: number
}

export interface PlanStep {
  id: string
  goalId?: string
  title: BilingualString
  description: BilingualString
  completed: boolean
  notes: BilingualString
  comments: BilingualString
  dateOfAchievement?: string
  evaluation?: BilingualString
}

export interface PlanConfig {
  childName: BilingualString
  expertName: BilingualString
  startDate: string
  endDate: string
  goals: PlanGoal[]
  steps: PlanStep[]
  media: string[]
}

// ============ TOOL ============

export type ToolConfig =
  | SurveyConfig
  | MultipleChoiceConfig
  | MediaConfig
  | ReportConfig
  | PlanConfig

export interface Tool {
  id: string
  name: BilingualString
  description?: BilingualString
  type: ToolType
  serviceType: ServiceType
  status: ToolStatus
  config: ToolConfig
  created: string
  updated: string
}
