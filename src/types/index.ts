import type { ClickOptions, InfiniteScrollOptions } from './mouse-actions'
import type { Offset } from 'puppeteer'
import type { SelectedTabOptions, WaitForOptions } from './navigation-actions'
import type { PressKeyOptions, TypeTextOptions } from './keyboard-actions'
import type {
  CheckElementExistsOptions,
  CookiesOptions,
  SelectDropdownOptions,
  SetVariableOptions
} from './data-action'
import type { Device, ScreenshotOptions, SleepOptions } from './other-actions'

export interface Coordinates extends Offset {}

export interface Selector {
  type: 'xpath' | 'css' | 'text'
  value: string
}

export interface SelectBy {
  coordinates?: Coordinates
  selector?: Selector
}

export interface Action {
  // Navigation Actions:
  activateTab: (index: number) => Promise<void>
  closeTab: (options: SelectedTabOptions) => Promise<void>
  closeBrowser: () => Promise<void>
  goBack: (options: WaitForOptions) => Promise<void>
  goForward: (options: WaitForOptions) => Promise<void>
  newTab: (url?: string, options?: WaitForOptions) => Promise<void>
  openUrl: (url: string, options: WaitForOptions) => Promise<void>
  reloadTab: (options: SelectedTabOptions) => Promise<void>

  // Mouse Actions:
  click: (options: ClickOptions) => Promise<void>
  moveMouse: (coordinates: Coordinates) => Promise<void>
  scroll: (options: InfiniteScrollOptions) => Promise<void>

  // Keyboard Actions:
  pressKey: (options: PressKeyOptions) => Promise<void>
  typeText: (options: TypeTextOptions) => Promise<void>

  // Data Actions:
  checkElementExists: (options: CheckElementExistsOptions) => Promise<void>
  cookies: (options: CookiesOptions) => Promise<void>
  selectDropdown: (options: SelectDropdownOptions) => Promise<void>
  setVariable: (options: SetVariableOptions) => void

  // Other Actions:
  emulate: (device: Device) => Promise<void>
  screenshot: (options: ScreenshotOptions) => Promise<void>
  sleep: (options: SleepOptions) => Promise<unknown>
}

export * from './data-action'
export * from './keyboard-actions'
export * from './mouse-actions'
export * from './navigation-actions'
export * from './other-actions'
