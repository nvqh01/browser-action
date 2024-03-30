import type { Browser, Device, Page } from 'puppeteer'
import type {
  Action as IBrowserAction,
  CheckElementExistsOptions,
  ClickOptions,
  CookiesOptions,
  Coordinates,
  InfiniteScrollOptions,
  PressKeyOptions,
  ScreenshotOptions,
  SelectDropdownOptions,
  SelectedTabOptions,
  SetVariableOptions,
  TypeTextOptions,
  WaitForOptions,
  SleepOptions
} from './types'
import { outputJSONSync, readJSONSync } from 'fs-extra'
import { puppeteerUtils } from '@crawlee/puppeteer'
import { getRandom } from './utils'

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

  public setGlobalVariables(key: string, value: any): void {
    this.globalVariables[key] = value
  }

  // Navigation Actions:
  async activateTab(index: number) {
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

  async newTab(url?: string, options: WaitForOptions = defautlWaitForOptions) {
    this.currentPage = await this.browser.newPage()
    if (url) await this.openUrl(url, options)
  }

  async openUrl(url: string, options: WaitForOptions = defautlWaitForOptions) {
    const currentPage = this.getCurrentPage()

    if (!currentPage) {
      await this.newTab(url, options)
    } else {
      await currentPage.goto(url, options)
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
    const { clickCount, delay, mouseButton, selectBy } = options

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

  async moveMouse(coordinates: Coordinates) {
    const currentPage = this.getCurrentPage()
    await currentPage.mouse.move(coordinates.x, coordinates.y)
  }

  async scroll(options: InfiniteScrollOptions) {
    const currentPage = this.getCurrentPage()
    await puppeteerUtils.infiniteScroll(currentPage, options)
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
    let { selector, speed, text, typeAsHuman } = options
    typeAsHuman && (speed = 0.5)
    await currentPage.type(selector.value, text, { delay: speed })
  }

  // Data Actions:
  async checkElementExists(options: CheckElementExistsOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, timeout } = options
    await currentPage.waitForSelector(selector.value, { timeout })
  }

  async cookies(options: CookiesOptions) {
    const currentPage = this.getCurrentPage()
    const { type, path } = options

    if (type === 'import' && path) {
      const cookies = readJSONSync(path)
      if (!Array.isArray(cookies)) throw new Error('Can not import cookies because of being invalid.')
      await currentPage.setCookie(...cookies)
    }

    if (type === 'export' && path) {
      const cookies = await currentPage.cookies()
      outputJSONSync(path, cookies)
    }

    if (type === 'clear') {
      const client = await currentPage.createCDPSession()
      await client.send('Network.clearBrowserCookies')
    }
  }

  async selectDropdown(options: SelectDropdownOptions) {
    const currentPage = this.getCurrentPage()
    const { selector, selectedValue } = options
    await currentPage.select(selector.value, selectedValue)
  }

  setVariable(options: SetVariableOptions) {
    const { selectedVariable, operator, value } = options

    switch (operator) {
      case '=':
        this.globalVariables[selectedVariable] = value
        break
      case '+':
        this.globalVariables[selectedVariable] += value
        break
      case '-':
        this.globalVariables[selectedVariable] -= value
        break
      case '*':
        this.globalVariables[selectedVariable] *= value
        break
      case '/':
        this.globalVariables[selectedVariable] /= value
        break
      case 'Concatenate':
        this.globalVariables[selectedVariable] += `${value}`
        break
    }
  }

  // Other Actions:
  async emulate(device: Device) {
    const currentPage = this.getCurrentPage()
    await currentPage.emulate(device)
  }

  async screenshot(options: ScreenshotOptions) {
    const currentPage = this.getCurrentPage()
    const { fileName, path } = options
    await currentPage.screenshot({ path: `${path}/${fileName}` })
  }

  async sleep(options: SleepOptions) {
    let { seconds, random } = options
    random && (seconds = getRandom(random.from, random.to))
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  }
}
