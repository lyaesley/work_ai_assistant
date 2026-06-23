export type Role = '팀장' | 'PM' | 'PL' | '부서장' | '팀원' | '구성원'

export type PriorityTask = {
  period: '지금 당장' | '이번 주'
  task: string
  reason: string
}

export type ChecklistItem = {
  item: string
  done: boolean
}

export type GuideResult = {
  summary: string
  priority_tasks: PriorityTask[]
  checklist: ChecklistItem[]
  watch_out: string[]
  questions_to_ask: string[]
  success_criteria: string[]
}

export type GuideRequest = {
  role: Role
  situation: string
  teamSize?: number
  domain?: string
  careerYears?: number
  mainConcern?: string
}
