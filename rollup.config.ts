import { defineConfig, Plugin } from 'rollup'
import del from 'rollup-plugin-delete'
import ts from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'
import dts from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import filesize from 'rollup-plugin-filesize'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }))

// const upCaseFirst = (str: string) => (str[0] ? str[0].toUpperCase() + str.slice(1) : '')

const input = 'src/index.ts'
const pluginGlobelName = 'julian'
const rollupConfig = [
  defineConfig({
    input,
    output: [
      {
        format: 'iife',
        name: pluginGlobelName,
        file: 'dist/index.iife.js'
      },
      {
        format: 'cjs',
        file: pkg.main,
        exports: 'named',
        footer: 'module.exports = Object.assign(exports?.default ?? {}, exports);',
        sourcemap: true
      },
      {
        format: 'es',
        file: pkg.module,
        sourcemap: true
      }
    ],
    plugins: [
      del({ targets: ['dist/*'] }),
      peerDepsExternal() as Plugin,
      nodeResolve(),
      ts(),
      terser(),
      filesize()
    ]
  }),
  defineConfig({
    input,
    output: [
      {
        format: 'es',
        file: pkg.types
      }
    ],
    plugins: [dts()]
  })
]

export default rollupConfig
