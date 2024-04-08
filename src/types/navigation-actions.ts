import type { WaitForOptions } from 'puppeteer'

export interface ActivateTabOptions {
  index: number
}

export interface SelectedTabOptions extends WaitForOptions {
  index?: number
  current: boolean
}

export interface OpenUrlOptions extends WaitForOptions {
  url: string
}

export type { WaitForOptions } from 'puppeteer'
