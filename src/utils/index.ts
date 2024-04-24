import axios from 'axios'
import fs from 'fs'
import path from 'path'

export function convertStringToRelativeType(str: string): boolean | number | string {
  if (str === 'true') return true
  if (str === 'false') return false
  if (/^([0-9]){1,}$/g.test(str)) return Number.parseInt(str)
  return str
}

export function convertSnakeToCamel(str: string): string {
  return str.toLowerCase().replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase())
}

export function getRandom(min: number, max: number): number {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

export async function saveImageFromURL(url: string, outputDir: string, fileName: string): Promise<string> {
  const response = await axios.get(url, { responseType: 'arraybuffer' })

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, fileName)
  fs.writeFileSync(outputPath, response.data)

  return outputPath
}
