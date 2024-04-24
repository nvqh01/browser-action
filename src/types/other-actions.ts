import type { Device } from 'puppeteer'

export interface ConditionOptions {
  leftOperand: string
  operator: '<' | '>' | '=' | '!=' | '<=' | '>='
  rightOperand: string
}

export interface EmulateOptions {
  device: Device
}

export interface EvalOptions {
  script: string
  variable: string
}

export interface LoopOptions {
  actions?: { type: string; options: any }[]
  loopType: 'for' | 'while'

  // Use for loop type "For"
  forFromValue?: number | string
  forToValue?: number | string

  // Use for loop type "While"
  leftOperand?: string
  operator?: '<' | '>' | '=' | '!=' | '<=' | '>='
  rightOperand?: number | string
}

export interface ScreenshotOptions {
  fileName: string
  filePath: string
}

export interface SleepOptions {
  seconds: number
  random?: {
    from: number
    to: number
  }
}

export type { Device } from 'puppeteer'
