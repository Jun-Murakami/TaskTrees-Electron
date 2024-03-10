import { ElectronAPI as BaseElectronAPI } from '@electron-toolkit/preload';

interface ExtendedElectronAPI extends BaseElectronAPI {
  getAppVersion: () => Promise<string>;
  setDarkMode: (isDarkMode: boolean) => void;
  createNewTree: (callback: () => void) => void;
  removeCreateNewTreeListener: () => void;
  onLoadedContent: (callback: (data: string | null) => void) => void;
  removeLoadedContentListener: () => void;
  saveTree: (callback: () => void) => void;
  removeSaveTreeListener: () => void;
  saveAllTrees: (callback: () => void) => void;
  removeSaveAllTreesListener: () => void;
  toggleMenuItem: (menuItemId: string, enabled: boolean) => void;
  saveLastTree: (callback: () => void) => void;
  removeSaveLastTreeListener: () => void;
  saveBackup: (data: string) => void;
}

declare global {
  interface Window {
    electron: ExtendedElectronAPI;
    api: unknown;
  }
}
