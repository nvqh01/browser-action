import { launch, KnownDevices } from 'puppeteer'
import type { Browser } from 'puppeteer'
import { BrowserAction } from './browser-action'

let browser: Browser

const close = async () => {
  await browser.close()
}

const start = async () => {
  browser = await launch({ defaultViewport: { width: 1920, height: 1080 }, headless: false })
  const browserAction = await BrowserAction.createInstance(browser, {})

  // Set Variable:
  browserAction.setVariable({ variable: 'WHILE_INDEX', operator: '=', value: '0' })
  console.log('Set variable...')

  // Loop:
  const actions = [
    { type: 'EMULATE', options: { device: KnownDevices['iPhone 12'] } },
    { type: 'NEW_TAB', options: {} },
    { type: 'OPEN_URL', options: { url: 'https://facebook.com' } },
    { type: 'SET_VARIABLE', options: { variable: 'WHILE_INDEX', operator: '+', value: '1' } }
  ]
  await browserAction.loop({ actions, loopType: 'while', leftOperand: 'WHILE_INDEX', operator: '<', rightOperand: '3' })
  console.log('Loop...')

  // Open Url:
  await browserAction.openUrl({ url: 'https://google.com/' })
  console.log('Open url...')

  // Type Text:
  await browserAction.typeText({ selector: { type: 'css', value: '#APjFqb' }, text: 'Penguin', speed: 2 })
  console.log('Type text...')

  // Press Key:
  await browserAction.pressKey({ keys: ['Enter'] })
  console.log('Press key...')

  // Check Element Exists:
  await browserAction.checkElementExists({
    selector: { type: 'xpath', value: '//*[@id="hdtb-sc"]/div/div/div[1]/div[2]/a' }
  })
  console.log('Check element exists...')

  // Click:
  await browserAction.click({
    selectBy: {
      selector: {
        type: 'xpath',
        value: '//*[@id="hdtb-sc"]/div/div/div[1]/div[2]/a'
      }
    }
  })
  console.log('Click...')

  // Save Asset:
  await browserAction.saveAsset({
    outputDir: `${__dirname}/..`,
    saveAssetBy: {
      url: 'https://storage.googleapis.com/oceanwide_web/media-dynamic/cache/widen_1100_progressive/media/default/0001/01/0726f6455875202da6e60252717243e8edc36cc9.jpeg'
    }
  })
  console.log('Save asset...')

  // Export Cookies:
  await browserAction.cookies({ type: 'export', filePath: 'cookies.json' })
  console.log('Export cookies...')

  // Close Browser:
  await browserAction.sleep({ seconds: 300 })
  await browserAction.closeBrowser()
  console.log('Close browser...')
}

start().catch(async (error) => {
  console.log(error)
  await close()
})

process.on('SIGINT', async () => await close())
process.on('SIGTERM', async () => await close())
