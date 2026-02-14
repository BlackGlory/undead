#!/usr/bin/env node
import { program } from 'commander'
import { retryUntil, anyOf, exponentialBackoff } from 'extra-retry'
import { version, description } from '@utils/package.js'
import { spawn } from 'child_process'
import { assert, isntNaN, isPositiveInfinity } from '@blackglory/prelude'

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
  .option('--factor <number>', 'factor', '2')
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
  const result = Number(options.baseTimeout)
  assert(isntNaN(result), 'The parameter baseTimeout must be a number')
  assert(Number.isFinite(result), 'The parameter baseTimeout must be finite')
  assert(Number.isInteger(result), 'The parameter baseTimeout must be an integer')
  assert(result > 0, 'The parameter baseTimeout must be greater than zero')

  return result
}

function getMaxTimeout(options: IOptions): number {
  const result = Number(options.maxTimeout)
  assert(isntNaN(result), 'The parameter maxTimeout must be a number')
  assert(
    Number.isInteger(result) ||
    isPositiveInfinity(result)
  , 'The parameter maxTimeout must be an integer or positive infinity'
  )
  assert(result > 0, 'The parameter maxTimeout must be greater than zero')

  return result
}

function getFactor(options: IOptions): number {
  const result = Number(options.factor)
  assert(isntNaN(result), 'The parameter factor must be a number')
  assert(Number.isFinite(result), 'The parameter factor must be finite')
  assert(result >= 1, 'The parameter factor must be greater than or equal to 1')

  return result
}

function getJitter(options: IOptions): boolean {
  return options.jitter
}
