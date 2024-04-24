import compileScript from 'eval'
import path from 'path'
import { convertSnakeToCamel, convertStringToRelativeType, getRandom, saveImageFromURL } from './utils'
import { faker } from '@faker-js/faker'
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

  private getVariable(variable: string): any {
    if (!/^\$\{.+\}/.test(variable)) {
      return this.globalVariables[variable] ?? convertStringToRelativeType(variable)
    }

    // Example: ${PROFILE_ID} => PROFILE_ID
    variable = variable.substring(2, variable.length - 1)
    return this.globalVariables[variable]
  }

  // Navigation Actions:
  async activateTab(options: ActivateTabOptions) {
    let { index } = options
    index = this.getVariable(`${index}`)
    const page = await this.getPageByIndex(index)
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

  async newTab(options: Partial<OpenUrlOptions> = {}) {
    this.currentPage = await this.browser.newPage()
    if (options?.url) await this.openUrl(options as OpenUrlOptions)
  }

  async openUrl(options: OpenUrlOptions) {
    const currentPage = this.getCurrentPage()
    let { url, ...waitForOptions } = options
    url = this.getVariable(url)
    await currentPage.goto(url, { ...defautlWaitForOptions, ...(waitForOptions || {}) })
  }

  async reloadTab(options: SelectedTabOptions) {
    options.timeout = defautlWaitForOptions.timeout
    options.waitUntil = defautlWaitForOptions.waitUntil

    if (options.current) {
      const currentPage = this.getCurrentPage()
      await currentPage.reload({ timeout: options.timeout, waitUntil: options.waitUntil })
    }

    if (options?.index) {
      const page = await this.getPageByIndex(options.index)
      await page.reload({ timeout: options.timeout, waitUntil: options.waitUntil })
    }
  }

  // Mouse Actions:
  async click(options: ClickOptions) {
    const currentPage = this.getCurrentPage()
    const { clickCount = 1, delay = 0, mouseButton = 'left', selectBy } = options

    if (selectBy?.coordinates) {
      await currentPage.mouse.click(selectBy.coordinates.x, selectBy.coordinates.y, {
        button: mouseButton,
        count: clickCount,
        delay
      })
    }

    if (selectBy?.selector) {
      selectBy.selector.type === 'xpath' && (selectBy.selector.value = `xpath=${selectBy.selector.value}`)
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
    text = this.getVariable(text)
    typeAsHuman && (speed = 0.5)
    selector.type === 'xpath' && (selector.value = `xpath=${selector.value}`)
    await currentPage.type(selector.value, text, { delay: speed })
  }

  // Data Actions:
  async checkElementExists(options: CheckElementExistsOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, timeout = 30000 } = options
    selector.type === 'xpath' && (selector.value = `xpath=${selector.value}`)
    await currentPage.waitForSelector(selector.value, { timeout })
  }

  async cookies(options: CookiesOptions) {
    const currentPage = this.getCurrentPage()
    let { type, filePath } = options

    filePath && (filePath = this.getVariable(filePath))

    if (type === 'import' && filePath) {
      const cookies = readJSONSync(filePath)
      if (!Array.isArray(cookies)) throw new Error('Can not import cookies because of being invalid.')
      await currentPage.setCookie(...cookies)
    }

    if (type === 'export' && filePath) {
      const cookies = await currentPage.cookies()
      outputJSONSync(filePath, cookies, { spaces: 2 })
    }

    if (type === 'clear') {
      const client = await currentPage.createCDPSession()
      await client.send('Network.clearBrowserCookies')
    }
  }

  async getAttribute(options: GetAttributeOptions) {
    const currentPage = this.getCurrentPage()
    let { attributeName, selector, variable } = options
    attributeName = this.getVariable(attributeName)
    selector.type === 'xpath' && (selector.value = `xpath=${selector.value}`)
    const element = await currentPage.$(selector.value)
    const attributeValue =
      (await currentPage.evaluate((_element) => _element?.getAttribute(attributeName), element)) ?? 'Unknown'
    this.setVariable({ variable, operator: '=', value: attributeValue })
  }

  async getText(options: GetTextOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, variable } = options
    selector.type === 'xpath' && (selector.value = `xpath=${selector.value}`)
    const element = await currentPage.$(selector.value)
    const text = (await currentPage.evaluate((_element) => _element?.textContent, element)) || 'Unknown'
    this.setVariable({ variable, operator: '=', value: text })
  }

  getUrl(options: GetUrlOptions) {
    const currentPage = this.getCurrentPage()
    const { variable } = options
    const url = currentPage.url()
    this.setVariable({ variable, operator: '=', value: url })
  }

  async saveAsset(options: SaveAssetOptions) {
    let { fileName, outputDir, saveAssetBy } = options
    let { selector, url } = saveAssetBy

    if (fileName) {
      fileName = this.getVariable(fileName)
    } else {
      fileName = `${faker.string.uuid()}.jpg`
    }

    outputDir = this.getVariable(outputDir)

    if (!url && selector) {
      const tempVariable = faker.string.uuid()
      await this.getAttribute({ attributeName: 'href', selector, variable: tempVariable })
      url = this.getVariable(tempVariable)
      this.deleteVariable(tempVariable)
    }

    if (!url) throw new Error('Can not save asset because url is undefined.')

    const outputPath = await saveImageFromURL(url, outputDir, fileName as string)
    return outputPath
  }

  async selectDropdown(options: SelectDropdownOptions) {
    const currentPage = this.getCurrentPage()
    let { selector, selectedValue } = options
    selectedValue = this.getVariable(selectedValue)
    selector.type === 'xpath' && (selector.value = `xpath=${selector.value}`)
    await currentPage.select(selector.value, selectedValue)
  }

  setVariable(options: SetVariableOptions) {
    const { variable, operator, value } = options
    const _value = convertStringToRelativeType(value)

    switch (operator) {
      case '=':
        this.globalVariables[variable] = _value
        break
      case '+':
        this.globalVariables[variable] += _value
        break
      case '-':
        this.globalVariables[variable] -= _value as number
        break
      case '*':
        this.globalVariables[variable] *= _value as number
        break
      case '/':
        this.globalVariables[variable] /= _value as number
        break
      case 'Concatenate':
        this.globalVariables[variable] += `${_value}`
        break
    }
  }

  async uploadFile(options: UploadFileOptions) {
    const currentPage = this.getCurrentPage()
    let { clickToUpload = false, filePath, fileType, selector } = options
    filePath = this.getVariable(filePath)

    if (selector && clickToUpload) {
      await this.checkElementExists({ selector })
      await this.click({ selectBy: { selector } })
    }

    const inputUploadHandle = (await currentPage.$('input[type="file"]')) as any
    await inputUploadHandle.uploadFile(filePath)
  }

  // Other Actions:
  condition(options: ConditionOptions) {
    let { leftOperand, operator, rightOperand } = options

    const _leftOperand = this.getVariable(leftOperand)
    const _rightOperand = this.getVariable(rightOperand)

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
    const { script, variable } = options
    const value = ((await currentPage.evaluate(async () => compileScript(script, true))) as any) || 'Unknown'
    this.setVariable({ variable, operator: '=', value })
  }

  async loop(options: LoopOptions) {
    let { actions = [], loopType, forFromValue, forToValue, leftOperand, operator, rightOperand } = options

    const executeActions = async () => {
      for (const { type, options } of actions) {
        const methodName = convertSnakeToCamel(type)
        // @ts-ignore
        await this[`${methodName}`](options)
      }
    }

    if (loopType === 'for' && forFromValue && forToValue) {
      const _forFromValue = this.getVariable(`${forFromValue}`) as number
      const _forToValue = this.getVariable(`${forToValue}`) as number

      for (let i = _forFromValue; i < _forToValue; ++i) await executeActions()
    }
    if (loopType === 'while' && leftOperand && operator && rightOperand) {
      while (true) {
        await executeActions()

        let canContinueLoop = false
        const _leftOperand = this.getVariable(leftOperand) as number
        const _rightOperand = this.getVariable(`${rightOperand}`) as number

        switch (operator) {
          case '<':
            canContinueLoop = _leftOperand < _rightOperand
            break
          case '>':
            canContinueLoop = _leftOperand > _rightOperand
            break
          case '=':
            canContinueLoop = _leftOperand == _rightOperand
            break
          case '!=':
            canContinueLoop = _leftOperand != _rightOperand
            break
          case '<=':
            canContinueLoop = _leftOperand <= _rightOperand
            break
          case '>=':
            canContinueLoop = _leftOperand >= _rightOperand
            break
        }

        if (!canContinueLoop) break
      }
    }
  }

  async screenshot(options: ScreenshotOptions) {
    const currentPage = this.getCurrentPage()
    let { fileName, filePath } = options

    fileName = this.getVariable(fileName)
    filePath = this.getVariable(filePath)

    await currentPage.screenshot({ path: path.join(filePath, fileName) })
  }

  async sleep(options: SleepOptions) {
    let { seconds, random } = options
    random && (seconds = getRandom(random.from, random.to))
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }
}
