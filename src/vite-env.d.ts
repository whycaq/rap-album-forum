/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_PORT: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Axios类型扩展
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime?: number
    }
    retryCount?: number
  }
}

