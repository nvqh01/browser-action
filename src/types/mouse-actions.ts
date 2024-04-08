import { MouseButton } from 'puppeteer'
import type { Coordinates, SelectBy } from '.'

export interface ClickOptions {
  clickCount?: number
  delay?: number
  mouseButton?: MouseButton
  selectBy: SelectBy
}

export interface MoveMouseOptions {
  coordinates: Coordinates
}

export type { InfiniteScrollOptions } from '@crawlee/puppeteer'
