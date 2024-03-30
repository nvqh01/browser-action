export interface ScreenshotOptions {
  fileName: string
  path: string
}

export interface SleepOptions {
  seconds: number
  random?: {
    from: number
    to: number
  }
}

export type { Device } from 'puppeteer'
