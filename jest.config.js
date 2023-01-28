import pkg from 'ts-jest'
import { readJSONFileSync } from 'extra-filesystem'

const { pathsToModuleNameMapper } = pkg
const { compilerOptions } = readJSONFileSync('./tsconfig.base.json')

export default {
  preset: 'ts-jest/presets/default-esm'
, resolver: '@blackglory/jest-resolver'
, testEnvironment: 'node'
, testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)']
, moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  })
}
