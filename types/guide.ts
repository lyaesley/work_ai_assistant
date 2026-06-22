export type Role = '팀장' | 'PM' | 'PL' | '부서장' | '팀원' | '구성원'

export type PriorityTask = {
  period: '오늘' | '이번 주' | '이번 달'
  task: string
  reason: string
}

export type ChecklistItem = {
  item: string
  done: boolean
}

export type WeekPlan = {
  week1: string
  week2: string
  week3: string
  week4: string
}

export type GuideResult = {
  summary: string
  priority_tasks: PriorityTask[]
  checklist: ChecklistItem[]
  watch_out: string[]
  questions_to_ask: string[]
  week_plan: WeekPlan
}

export type GuideRequest = {
  role: Role
  situation: string
  teamSize?: number
  domain?: string
  careerYears?: number
  mainConcern?: string
}
