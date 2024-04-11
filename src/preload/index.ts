import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      getAppVersion: () => ipcRenderer.invoke('get-app-version'),
      setDarkMode: (isDarkMode) => ipcRenderer.send('set-dark-mode', isDarkMode),
      createNewTree: (callback) => ipcRenderer.on('create-new-tree', callback),
      removeCreateNewTreeListener: () => ipcRenderer.removeAllListeners('create-new-tree'),
      onLoadedContent: (callback: (data: string | null) => void) => {
        ipcRenderer.on('loaded-content', (_, data) => callback(data));
      },
      removeLoadedContentListener: () => {
        ipcRenderer.removeAllListeners('loaded-content');
      },
      saveTree: (callback) => ipcRenderer.on('save-tree', callback),
      removeSaveTreeListener: () => ipcRenderer.removeAllListeners('save-tree'),
      saveAllTrees: (callback) => ipcRenderer.on('save-all-tree', callback),
      removeSaveAllTreesListener: () => ipcRenderer.removeAllListeners('save-all-tree'),
      toggleMenuItem: (menuItemId, enabled) => ipcRenderer.send('toggle-menu-item', { menuItemId, enabled }),
      saveLastTree: (callback) => ipcRenderer.on('save-last-tree', callback),
      removeSaveLastTreeListener: () => ipcRenderer.removeAllListeners('save-last-tree'),
      saveBackup: (data) => ipcRenderer.send('save-backup', { data }),
      closeWindow: () => ipcRenderer.send('close-window'),
      onBeforeClose: (callback) => ipcRenderer.on('before-close', callback),
      removeBeforeCloseListener: () => ipcRenderer.removeAllListeners('before-close'),
      sendCloseCompleted: (data) => ipcRenderer.send('close-completed', data),
      openGoogleAuthURL: () => ipcRenderer.send('open-google-auth-url'),
      onGoogleAuthToken: (callback: (token: string) => void) => ipcRenderer.on('google-auth-token', (_, data) => callback(data)),
      removeGoogleAuthTokenListener: () => ipcRenderer.removeAllListeners('google-auth-token'),
      openAppleAuthURL: () => ipcRenderer.send('open-apple-auth-url'),
      onAppleAuthToken: (callback: (token: string) => void) => ipcRenderer.on('apple-auth-token', (_, data) => callback(data)),
      removeAppleAuthTokenListener: () => ipcRenderer.removeAllListeners('apple-auth-token'),
    });
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
