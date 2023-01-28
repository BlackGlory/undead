#!/usr/bin/env node
import { program } from 'commander'
import { retryUntil, anyOf, exponentialBackoff } from 'extra-retry'
import { version, description } from '@utils/package.js'
import { spawn } from 'child_process'

interface IOptions {
  baseTimeout: string
  maxTimeout: string
  factor: string
  jitter: boolean
}

const name = 'undead'
process.title = name

program
  .name(name)
  .version(version)
  .description(description)
  .option(
    '--base-timeout <milliseconds>'
  , 'the base timeout of exponential backoff'
  , '1000'
  )
  .option(
    '--max-timeout <milliseconds>'
  , 'the max timeout of exponential backoff'
  , 'Infinity'
  )
  .option('--factor <concurrency>', 'factor', '2')
  .option('--no-jitter', 'use no-jitter exponential backoff')
  .passThroughOptions() // 开启此选项以允许在没有`--`的情况下解析commands.
  .argument('<commands...>')
  .action(async (commands: string[]) => {
    const options = program.opts<IOptions>()
    const baseTimeout = getBaseTimeout(options)
    const maxTimeout = getMaxTimeout(options)
    const factor = getFactor(options)
    const jitter = getJitter(options)

    const shellCommand = commands.join(' ')
    process.title = `${name}: ${shellCommand}`

    await retryUntil(
      anyOf(
        exponentialBackoff({
          baseTimeout
        , maxTimeout
        , factor
        , jitter
        })
      )
    , () => {
        return new Promise<void>((resolve, reject) => {
          const subShell = spawn(shellCommand, [], {
            shell: true
          , stdio: 'inherit'
          })

          subShell.addListener('exit', code => {
            if (code === 0) {
              resolve()
            } else {
              reject(new Error(`Code: ${code}`))
            }
          })
        })
      }
    )
  })
  .parse()

function getBaseTimeout(options: IOptions): number {
  return Number.parseInt(options.baseTimeout, 10)
}

function getMaxTimeout(options: IOptions): number {
  return isInfinity(options.maxTimeout)
       ? Infinity
       : Number.parseInt(options.maxTimeout, 10)
}

function getFactor(options: IOptions): number {
  return Number.parseInt(options.factor, 10)
}

function getJitter(options: IOptions): boolean {
  return options.jitter
}

function isInfinity(text: string): boolean {
  return /^\s*Infinity\s*$/i.test(text)
}
