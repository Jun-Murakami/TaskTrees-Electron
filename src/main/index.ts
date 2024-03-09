import { app, shell, BrowserWindow, ipcMain, nativeTheme, Menu, dialog } from 'electron';
import fs from 'fs';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import contextMenu from 'electron-context-menu';
import icon from '../../resources/icon.png?asset';

let mainWindow: BrowserWindow | null = null; // mainWindowをグローバル変数として宣言

interface WindowState {
  bounds?: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };
  isMaximized?: boolean;
}

contextMenu({
  showInspectElement: is.dev,
});

function createWindow(): void {
  // 保存されたウィンドウの状態を読み込む
  const fs = require('fs');
  const path = require('path');
  const userDataPath = app.getPath('userData');
  const windowStatePath = path.join(userDataPath, 'windowState.json');
  let windowState: WindowState = {};
  if (fs.existsSync(windowStatePath)) {
    try {
      windowState = JSON.parse(fs.readFileSync(windowStatePath, 'utf8'));
    } catch (error) {
      console.error('ウィンドウの状態の読み込みに失敗しました:', error);
    }
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 700,
    minHeight: 400,
    ...windowState.bounds, // 保存されたウィンドウの位置とサイズを適用
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize(); // 保存された状態が最大化なら最大化する
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      // 最後のツリー状態を保存
      mainWindow!.webContents.send('save-last-tree');

      // ウィンドウの状態を取得
      const isMaximized = mainWindow.isMaximized();
      mainWindow.unmaximize(); // 最大化状態を解除
      const bounds = mainWindow.getBounds();

      // JSON形式で保存するデータ
      const windowState = {
        bounds: bounds,
        isMaximized: isMaximized,
      };

      // ファイルに保存（fsモジュールを使用）
      const fs = require('fs');
      const path = require('path');
      const userDataPath = app.getPath('userData');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      fs.writeFileSync(path.join(userDataPath, 'windowState.json'), JSON.stringify(windowState));
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // IPC ------------------------------------------------------------------------------------

  // アプリのバージョンを取得
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // ダークモードの設定
  ipcMain.on('set-dark-mode', (_, isDarkMode) => {
    nativeTheme.themeSource = isDarkMode ? 'dark' : 'light';
  });

  // メニュー項目の定義
  const template: (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] = [
    {
      label: 'ファイル',
      submenu: [
        {
          label: '新しいツリーを作成',
          id: 'create-new-tree',
          enabled: false,
          click: (): void => {
            mainWindow!.webContents.send('create-new-tree');
          },
        },
        { type: 'separator' },
        {
          label: 'ツリーを読み込み',
          id: 'import-tree',
          enabled: false,
          click: async (): Promise<void> => {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (!canceled && filePaths.length === 1) {
              try {
                const data = fs.readFileSync(filePaths[0], 'utf8');
                mainWindow!.webContents.send('loaded-content', data);
              } catch (error) {
                console.error('ファイルの読み込みに失敗しました:', error);
                mainWindow!.webContents.send('loaded-content', null);
              }
            }
            return Promise.resolve();
          },
        },
        {
          label: '現在のツリーを保存',
          id: 'save-tree',
          enabled: false,
          click: (): void => {
            mainWindow!.webContents.send('save-tree');
          },
        },
        {
          label: 'すべてのツリーを保存',
          id: 'save-all-tree',
          enabled: false,
          click: (): void => {
            mainWindow!.webContents.send('save-all-tree');
          },
        },
        { type: 'separator' },
        { label: '終了', role: 'quit' as const }, // 'as const'を使用してroleの値がリテラル型であることを明示
      ],
    },
    {
      label: '編集',
      submenu: [
        { label: '元に戻す', role: 'undo' as const },
        { label: 'やり直し', role: 'redo' as const },
        { type: 'separator' },
        { label: '切り取り', role: 'cut' as const },
        { label: 'コピー', role: 'copy' as const },
        { label: '貼り付け', role: 'paste' as const },
      ],
    },
  ];

  // メニューの作成
  const menu = Menu.buildFromTemplate(template);

  // アプリケーションのメニューとして設定
  Menu.setApplicationMenu(menu);

  // メニュー項目の有効・無効を切り替える
  ipcMain.on('toggle-menu-item', (_, { menuItemId, enabled }) => {
    const menuItem = Menu.getApplicationMenu()!.getMenuItemById(menuItemId);
    if (menuItem) {
      menuItem.enabled = enabled;
    }
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
