import type { Selector } from '.'
import type { KeyInput } from 'puppeteer'

export interface PressKeyOptions {
  delay?: number
  keys: KeyInput[]
}

export interface TypeTextOptions {
  selector: Selector
  speed: number
  text: string
  typeAsHuman: boolean
}

export type { KeyInput } from 'puppeteer'
