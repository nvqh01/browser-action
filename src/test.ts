import { launch, Browser, KnownDevices } from 'puppeteer'
import { BrowserAction } from './browser-action'

let browser: Browser

const close = async () => {
  await browser.close()
}

const start = async () => {
  browser = await launch({ defaultViewport: { width: 1920, height: 1080 }, headless: false })
  const browserAction = await BrowserAction.createInstance(browser, {})

  await browserAction.emulate(KnownDevices['iPhone 12'])
  await browserAction.openUrl('https://google.com')
  await browserAction.sleep({ seconds: 2 })

  await browserAction.openUrl('https://facebook.com')
  await browserAction.sleep({ seconds: 2 })

  await browserAction.newTab('https://thanhnien.vn')
  await browserAction.scroll({ scrollDownAndUp: true, timeoutSecs: 2 })
  await browserAction.sleep({ seconds: 2 })

  await browserAction.activateTab(0)
  await browserAction.sleep({ seconds: 2 })

  await browserAction.goBack()
  await browserAction.sleep({ seconds: 2 })

  await browserAction.reloadTab({ current: true })
  await browserAction.sleep({ seconds: 2 })

  await browserAction.goForward()
  await browserAction.sleep({ seconds: 2 })

  await browserAction.sleep({ seconds: 300 })
  await browserAction.closeBrowser()
}

start().catch(async (error) => {
  console.log(error)
  await close()
})

process.on('SIGINT', async () => await close())
process.on('SIGTERM', async () => await close())
