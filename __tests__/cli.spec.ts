import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'

const execAsync = promisify(exec)

describe('cli', () => {
  test('passthrough command and arguments', async () => {
    const { stdout } = await execAsync('node ./lib/cli.js cat package.json')

    const expected = await fs.readFile('package.json', 'utf-8')
    expect(stdout).toBe(expected)
  })

  test('inherit environment', async () => {
    const { stdout } = await execAsync('node ./lib/cli.js echo "$NODE_ENV"')

    expect(stdout).toBe('test\n')
  })

  test('passthrough stdio', async () => {
    const { stdout } = await execAsync('(node ./lib/cli.js cat) < package.json')

    const expected = await fs.readFile('package.json', 'utf-8')
    expect(stdout).toBe(expected)
  })
})
