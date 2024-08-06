/* eslint-disable import/no-default-export */
import * as icons from './components'
import type { App } from 'vue'

export interface InstallOptions {
  /** @default `JaIcon` */
  prefix?: string
}
export default (app: App, { prefix = 'JaIcon' }: InstallOptions = {}) => {
  for (const [key, component] of Object.entries(icons)) {
    app.component(prefix + key, component)
  }
}

export { icons }
export * from './components'
