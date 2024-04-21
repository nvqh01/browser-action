import type { Selector } from '.'

export interface CheckElementExistsOptions {
  selector: Selector
  timeout?: number
}

export interface CookiesOptions {
  type: 'import' | 'export' | 'clear'
  filePath?: string
}

export interface GetAttributeOptions {
  attributeName: string
  selector: Selector
  selectedVariable: string
}

export interface GetTextOptions {
  selector: Selector
  selectedVariable: string
}

export interface GetUrlOptions {
  selectedVariable: string
}

export interface SaveAssetOptions {
  fileName?: string
  outputDir: string
  saveAssetBy: {
    selector?: Selector
    url?: string
  }
}

export interface SelectDropdownOptions {
  selector: Selector
  selectedValue: string
}

export interface SetVariableOptions {
  selectedVariable: string
  operator: '=' | '+' | '-' | '*' | '/' | 'Concatenate'
  value: any
}

export interface UploadFileOptions {
  clickToUpload?: boolean
  filePath: string
  fileType: 'file' | 'url_image' | 'base64_image'
  selector: Selector
}
