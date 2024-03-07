import { ElectronAPI as BaseElectronAPI } from '@electron-toolkit/preload'

interface ExtendedElectronAPI extends BaseElectronAPI {
  getAppVersion: () => Promise<string>
  setDarkMode: (isDarkMode: boolean) => void
  getDarkMode: () => Promise<boolean>
  createNewTree: (callback: () => void) => void
  removeCreateNewTreeListener: () => void
  onLoadedContent: (callback: (data: string | null) => void) => void
  removeLoadedContentListener: () => void
  saveTree: (callback: () => void) => void
  removeSaveTreeListener: () => void
  toggleMenuItem: (menuItemId: string, enabled: boolean) => void
}

declare global {
  interface Window {
    electron: ExtendedElectronAPI
    api: unknown
  }
}
