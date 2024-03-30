import type { Selector } from '.'

export interface CheckElementExistsOptions {
  selector: Selector
  timeout: number
}

export interface CookiesOptions {
  type: 'import' | 'export' | 'clear'
  path?: string
}

export interface SelectDropdownOptions {
  selector: Selector
  selectedValue: string
}

export interface SetVariableOptions {
  selectedVariable: string
  operator: '=' | '+' | '-' | '*' | '/' | 'Concatenate'
  value: number
}
