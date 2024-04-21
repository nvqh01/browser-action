import compileScript from 'eval'
import path from 'path'
import { faker } from '@faker-js/faker'
import { getRandom, saveImageFromURL } from './utils'
import { outputJSONSync, readJSONSync } from 'fs-extra'
import { puppeteerUtils } from '@crawlee/puppeteer'
import type { Browser, Page } from 'puppeteer'
import type {
  Action as IBrowserAction,
  ActivateTabOptions,
  CheckElementExistsOptions,
  ClickOptions,
  CookiesOptions,
  EmulateOptions,
  InfiniteScrollOptions,
  MoveMouseOptions,
  OpenUrlOptions,
  PressKeyOptions,
  ScreenshotOptions,
  SelectDropdownOptions,
  SelectedTabOptions,
  SetVariableOptions,
  TypeTextOptions,
  WaitForOptions,
  SleepOptions,
  GetUrlOptions,
  GetTextOptions,
  GetAttributeOptions,
  UploadFileOptions,
  ConditionOptions,
  EvalOptions,
  LoopOptions,
  SaveAssetOptions
} from './types'

const defautlWaitForOptions: WaitForOptions = {
  timeout: 30000,
  waitUntil: 'networkidle2'
}

export class BrowserAction implements IBrowserAction {
  static async createInstance(browser: Browser, globalVariables: any): Promise<BrowserAction> {
    const pageList = await browser.pages()
    const currentPage = pageList[0] as Page
    const browserAction = new BrowserAction(browser, globalVariables, currentPage)
    return browserAction
  }

  constructor(
    private browser: Browser,
    private globalVariables: any,
    private currentPage: Page
  ) {}

  private deleteVariable(key: string): void {
    delete this.globalVariables[key]
  }

  private getCurrentPage(): Page {
    return this.currentPage
  }

  private async getPageByIndex(index: number): Promise<Page> {
    const pages = await this.getPageList()
    return pages[index] as Page
  }

  private async getPageList(): Promise<Page[]> {
    return await this.browser.pages()
  }

  private getVariable(key: object | string | undefined, options: { checkFormat?: boolean } = {}): any {
    if (!key) return null
    if (typeof key === 'object') return key
    const { checkFormat } = options
    // Example: ${PROFILE_ID} => PROFILE_ID
    if (checkFormat && /^\$\{.+\}/.test(key)) key = key.substring(2, key.length - 1)
    return this.globalVariables[key]
  }

  public setGlobalVariables(key: string, value: any): void {
    this.globalVariables[key] = value
  }

  // Navigation Actions:
  async activateTab(options: ActivateTabOptions) {
    const { index } = options
    const _index = Number.parseInt(this.getVariable(`${index}`, { checkFormat: true }))
    const page = await this.getPageByIndex(_index)
    await page.bringToFront()
    this.currentPage = page
  }

  async closeBrowser() {
    await this.browser.close()
  }

  async closeTab(options: SelectedTabOptions) {
    if (options.current) {
      const currentPage = this.getCurrentPage()
      await currentPage.close()
    }

    if (options.index) {
      const page = await this.getPageByIndex(options.index)
      await page.close()
    }
  }

  async goBack(options: WaitForOptions = defautlWaitForOptions) {
    const currentPage = this.getCurrentPage()
    await currentPage.goBack(options)
  }

  async goForward(options: WaitForOptions = defautlWaitForOptions) {
    const currentPage = this.getCurrentPage()
    await currentPage.goForward(options)
  }

  async newTab(options?: OpenUrlOptions) {
    this.currentPage = await this.browser.newPage()
    if (options?.url) await this.openUrl(options)
  }

  async openUrl(options: OpenUrlOptions) {
    const currentPage = this.getCurrentPage()

    if (!currentPage) {
      await this.newTab(options)
    } else {
      const { url, ...waitForOptions } = options
      const _url = this.getVariable(url, { checkFormat: true })
      await currentPage.goto(_url, { ...defautlWaitForOptions, ...(waitForOptions || {}) })
    }
  }

  async reloadTab(options: SelectedTabOptions) {
    options.timeout = defautlWaitForOptions.timeout
    options.waitUntil = defautlWaitForOptions.waitUntil

    if (options.current) {
      const currentPage = this.getCurrentPage()
      await currentPage.reload({ timeout: options.timeout, waitUntil: options.waitUntil })
    }

    if (options.index) {
      const page = await this.getPageByIndex(options.index)
      await page.reload({ timeout: options.timeout, waitUntil: options.waitUntil })
    }
  }

  // Mouse Actions:
  async click(options: ClickOptions) {
    const currentPage = this.getCurrentPage()
    const { clickCount = 1, delay = 0, mouseButton = 'left', selectBy } = options

    if (selectBy.coordinates) {
      await currentPage.mouse.click(selectBy.coordinates.x, selectBy.coordinates.y, {
        button: mouseButton,
        count: clickCount,
        delay
      })
    }

    if (selectBy.selector) {
      await currentPage.click(selectBy.selector.value, {
        button: mouseButton,
        count: clickCount,
        delay
      })
    }
  }

  async moveMouse(options: MoveMouseOptions) {
    const currentPage = this.getCurrentPage()
    const { coordinates } = options
    await currentPage.mouse.move(coordinates.x, coordinates.y)
  }

  async scroll(options?: InfiniteScrollOptions) {
    const currentPage = this.getCurrentPage()
    await puppeteerUtils.infiniteScroll(currentPage, options || {})
  }

  // Keyboard Actions:
  async pressKey(options: PressKeyOptions) {
    const currentPage = this.getCurrentPage()
    const { delay = 0, keys } = options
    for (const key of keys) {
      await currentPage.keyboard.press(key, { delay })
    }
  }

  async typeText(options: TypeTextOptions) {
    const currentPage = this.getCurrentPage()
    let { selector, speed = 1, text, typeAsHuman = false } = options
    const _text = this.getVariable(text, { checkFormat: true })
    typeAsHuman && (speed = 0.5)
    await currentPage.type(selector.value, _text, { delay: speed })
  }

  // Data Actions:
  async checkElementExists(options: CheckElementExistsOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, timeout = 30000 } = options
    await currentPage.waitForSelector(selector.value, { timeout })
  }

  async cookies(options: CookiesOptions) {
    const currentPage = this.getCurrentPage()
    const { type, filePath } = options

    const _filePath = this.getVariable(filePath, { checkFormat: true }) as string

    if (type === 'import' && _filePath) {
      const cookies = readJSONSync(_filePath)
      if (!Array.isArray(cookies)) throw new Error('Can not import cookies because of being invalid.')
      await currentPage.setCookie(...cookies)
    }

    if (type === 'export' && _filePath) {
      const cookies = await currentPage.cookies()
      outputJSONSync(_filePath, cookies)
    }

    if (type === 'clear') {
      const client = await currentPage.createCDPSession()
      await client.send('Network.clearBrowserCookies')
    }
  }

  async getAttribute(options: GetAttributeOptions) {
    const currentPage = this.getCurrentPage()
    const { attributeName, selector, selectedVariable } = options
    const _attributeName = this.getVariable(attributeName) as string
    const element = await currentPage.$(selector.value)
    const attributeValue = await currentPage.evaluate((_element) => _element?.getAttribute(_attributeName), element)
    this.setVariable({ selectedVariable, operator: '=', value: attributeValue })
  }

  async getText(options: GetTextOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, selectedVariable } = options
    const element = await currentPage.$(selector.value)
    const text = await currentPage.evaluate((_element) => _element?.textContent, element)
    this.setVariable({ selectedVariable, operator: '=', value: text })
  }

  getUrl(options: GetUrlOptions) {
    const currentPage = this.getCurrentPage()
    const { selectedVariable } = options
    const value = currentPage.url()
    this.setVariable({ selectedVariable, operator: '=', value })
  }

  async saveAsset(options: SaveAssetOptions) {
    let { fileName, outputDir, saveAssetBy } = options
    let { selector, url } = saveAssetBy

    !fileName && (fileName = `${faker.string.uuid}.jpg`)

    if (!url && selector) {
      const selectedVariable = faker.string.uuid()
      await this.getAttribute({ attributeName: 'href', selector, selectedVariable })
      url = this.getVariable(selectedVariable)
      this.deleteVariable(selectedVariable)
    }

    if (!url) throw new Error('Can not save asset because url is undefined.')

    const outputPath = await saveImageFromURL(url, outputDir, fileName)
  }

  async selectDropdown(options: SelectDropdownOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, selectedValue } = options
    const _selectedValue = this.getVariable(selectedValue, { checkFormat: true }) as string
    await currentPage.select(selector.value, _selectedValue)
  }

  setVariable(options: SetVariableOptions) {
    const { selectedVariable, operator, value } = options

    const _value = this.getVariable(value, { checkFormat: true })

    switch (operator) {
      case '=':
        this.globalVariables[selectedVariable] = _value
        break
      case '+':
        this.globalVariables[selectedVariable] += Number.parseInt(_value)
        break
      case '-':
        this.globalVariables[selectedVariable] -= Number.parseInt(_value)
        break
      case '*':
        this.globalVariables[selectedVariable] *= Number.parseInt(_value)
        break
      case '/':
        this.globalVariables[selectedVariable] /= Number.parseInt(_value)
        break
      case 'Concatenate':
        this.globalVariables[selectedVariable] += `${_value}`
        break
    }
  }

  async uploadFile(options: UploadFileOptions) {
    const currentPage = this.getCurrentPage()
    const { clickToUpload = false, filePath, fileType, selector } = options

    const _filePath = this.getVariable(filePath, { checkFormat: true }) as string

    if (selector && clickToUpload) {
      await this.checkElementExists({ selector })
      await this.click({ selectBy: { selector } })
    }

    const inputUploadHandle = (await currentPage.$('input[type="file"]')) as any
    await inputUploadHandle.uploadFile(_filePath)
  }

  // Other Actions:
  condition(options: ConditionOptions) {
    let { leftOperand, operator, rightOperand } = options

    const _leftOperand = Number.parseInt(this.getVariable(leftOperand, { checkFormat: true }))
    const _rightOperand = Number.parseInt(this.getVariable(rightOperand, { checkFormat: true }))

    switch (operator) {
      case '<':
        return _leftOperand < _rightOperand
      case '>':
        return _leftOperand > _rightOperand
      case '=':
        return _leftOperand == _rightOperand
      case '!=':
        return _leftOperand != _rightOperand
      case '<=':
        return _leftOperand <= _rightOperand
      case '>=':
        return _leftOperand >= _rightOperand
    }
  }

  async emulate(options: EmulateOptions) {
    const currentPage = this.getCurrentPage()
    const { device } = options
    await currentPage.emulate(device)
  }

  async eval(options: EvalOptions) {
    const currentPage = this.getCurrentPage()
    const { script, selectedVariable } = options
    const value = (await currentPage.evaluate(async () => compileScript(script, true))) as any
    this.setVariable({ selectedVariable, operator: '=', value })
  }

  async loop(options: LoopOptions) {
    let { actions, loopType, forFromValue, forToValue, leftOperand, operator, rightOperand } = options

    const executeActions = async () => {
      for (const { name, options } of actions) {
        // @ts-ignore
        await this[`${name}`](options)
      }
    }

    if (loopType === 'for' && forFromValue && forToValue) {
      const _forFromValue = Number.parseInt(this.getVariable(`${forFromValue}`, { checkFormat: true }))
      const _forToValue = Number.parseInt(this.getVariable(`${forFromValue}`, { checkFormat: true }))

      for (let i = _forFromValue; i < _forToValue; ++i) await executeActions()
    }

    if (loopType === 'while' && leftOperand && operator && rightOperand)
      while (true) {
        let canBreakLoop = false

        const _leftOperand = Number.parseInt(this.getVariable(leftOperand, { checkFormat: true }))
        const _rightOperand = Number.parseInt(this.getVariable(rightOperand, { checkFormat: true }))

        switch (operator) {
          case '<':
            canBreakLoop = _leftOperand < _rightOperand
            break
          case '>':
            canBreakLoop = _leftOperand > _rightOperand
            break
          case '=':
            canBreakLoop = _leftOperand == _rightOperand
            break
          case '!=':
            canBreakLoop = _leftOperand != _rightOperand
            break
          case '<=':
            canBreakLoop = _leftOperand <= _rightOperand
            break
          case '>=':
            canBreakLoop = _leftOperand >= _rightOperand
            break
        }

        if (canBreakLoop) break
        await executeActions()
      }
  }

  async screenshot(options: ScreenshotOptions) {
    const currentPage = this.getCurrentPage()
    const { fileName, filePath } = options

    const _fileName = this.getVariable(fileName, { checkFormat: true }) as string
    const _filePath = this.getVariable(filePath, { checkFormat: true }) as string

    await currentPage.screenshot({ path: path.join(_filePath, _fileName) })
  }

  async sleep(options: SleepOptions) {
    let { seconds, random } = options
    random && (seconds = getRandom(random.from, random.to))
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }
}
