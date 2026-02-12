import { describe, test, expect } from 'vitest'
import { Bash } from 'extra-exec'
import fs from 'fs/promises'

describe('cli', () => {
  test('passthrough command and arguments', async () => {
    const result = await Bash.evaluate('node ./lib/cli.js cat package.json')

    const expected = await fs.readFile('package.json', 'utf-8')
    expect(result).toBe(expected)
  })

  test('inherit environment', async () => {
    const result = await Bash.evaluate('node ./lib/cli.js echo "$NODE_ENV"')

    expect(result).toBe('test\n')
  })

  test('passthrough stdio', async () => {
    const result = await Bash.evaluate('(node ./lib/cli.js cat) < package.json')

    const expected = await fs.readFile('package.json', 'utf-8')
    expect(result).toBe(expected)
  })
})
