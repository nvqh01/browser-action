import type { WaitForOptions } from 'puppeteer'

export interface SelectedTabOptions extends WaitForOptions {
  index?: number
  current: boolean
}

export type { WaitForOptions } from 'puppeteer'
