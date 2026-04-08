export type ToolType =
  | "survey"
  | "multiple_choice"
  | "media"
  | "report"
  | "plan"
export type ServiceType = "individual" | "institute" | "both"
export type ToolStatus = "draft" | "active" | "archived"

export interface BilingualString {
  en: string
  ar: string
}

export interface ToolOption {
  value: string
  label: BilingualString
}

// ============ SURVEY ============

export type SurveyAnswerType =
  | "text"
  | "number"
  | "single_choice"
  | "multiple_choice"
  | "rating"

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
  isVisibleToUser: boolean
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
  isVisibleToUser: boolean
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
  isVisibleToUser: boolean
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
  customFields: ReportCustomField[] // added after Suggestions
  isVisibleToUser: boolean
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
  isVisibleToUser: boolean
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
  isVisibleToUser: boolean
  status: ToolStatus
  config: ToolConfig
  createdAt: string
  updatedAt: string
}
