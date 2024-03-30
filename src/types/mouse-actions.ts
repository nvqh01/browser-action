import { MouseButton } from 'puppeteer'
import type { SelectBy } from '.'

export interface ClickOptions {
  clickCount: number
  delay: number
  mouseButton: MouseButton
  selectBy: SelectBy
}

export type { InfiniteScrollOptions } from '@crawlee/puppeteer'
