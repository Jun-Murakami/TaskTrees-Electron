import { app, shell, BrowserWindow, ipcMain, nativeTheme, Menu, dialog } from 'electron';
import crypto from 'crypto';
import fs from 'fs';
import path, { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import contextMenu from 'electron-context-menu';
import icon from '../../resources/icon.png?asset';
import express from 'express';
import { Server } from 'http';

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

const expressApp = express();
// Expressサーバの設定
const PORT = 8080;
// Expressサーバの設定
expressApp.get('/', (_, res) => {
  res.send('Server is running.');
});

let server: Server | null = null; // サーバインスタンスを保持する変数

// サーバを起動する関数
function startServer() {
  if (!server) {
    // サーバが既に起動していない場合のみ起動
    server = expressApp.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  }
}

// サーバを停止する関数
function stopServer() {
  if (server) {
    // サーバが起動している場合のみ停止
    server.close(() => {
      console.log('Server is stopped.');
    });
    server = null; // サーバインスタンスをクリア
  }
}

const generateState = () => {
  return crypto.randomBytes(16).toString('hex');
};

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
const redirectUri = 'http://localhost:8080/__/auth/handler';
const scope = 'email profile';
const state = generateState();

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    state: state,
  }).toString();

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

  // バックアップを保存するフォルダを作成
  const backupsFolderPath = path.join(userDataPath, 'Backups');
  if (!fs.existsSync(backupsFolderPath)) {
    fs.mkdirSync(backupsFolderPath, { recursive: true });
  }

  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    minWidth: 770,
    minHeight: 400,
    ...windowState.bounds, // 保存されたウィンドウの位置とサイズを適用
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      spellcheck: false,
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

  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (e) => {
    // Mac以外でデフォルトの閉じる動作をキャンセル
    e.preventDefault();

    if (mainWindow && !mainWindow.isDestroyed()) {
      // 最後のツリー状態を保存
      mainWindow.webContents.send('save-last-tree');

      // 全ツリーをバックアップ
      mainWindow.webContents.send('before-close');

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

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // 2つ目のインスタンスが起動しようとしたときの処理
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron.tasktrees');

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
          {
            label: 'バックアップフォルダを表示',
            click: (): void => {
              const backupsFolderPath = path.join(app.getPath('userData'), 'Backups');
              shell.openPath(backupsFolderPath);
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

    // Google認証のためのURLをシェルで開く
    ipcMain.on('open-google-auth-url', () => {
      shell.openExternal(authUrl);
    });

    ipcMain.on('start-server', () => {
      startServer();
    });

    ipcMain.on('stop-server', () => {
      stopServer();
    });

    let isQuitting = false;

    app.on('before-quit', () => {
      isQuitting = true; // アプリケーションが終了しようとしていることを示すフラグを設定
    });

    // レンダラーからバックアップjsonを受け取り、ファイルとして保存
    function getCurrentDateTime() {
      const now = new Date();
      return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }

    function saveBackup(data: string) {
      const userDataPath = app.getPath('userData');
      const backupsFolderPath = path.join(userDataPath, 'Backups');
      if (!fs.existsSync(backupsFolderPath)) {
        fs.mkdirSync(backupsFolderPath, { recursive: true });
      }
      const filePath = join(backupsFolderPath, `TaskTrees_Backup_${getCurrentDateTime()}.json`);
      fs.writeFileSync(filePath, data, 'utf8');
      // バックアップファイルをリストアップし、50個以上あれば古いものから削除
      const files = fs
        .readdirSync(backupsFolderPath)
        .filter((file) => file.startsWith('TaskTrees_Backup_'))
        .sort((a, b) => a.localeCompare(b));
      if (files.length > 50) {
        files.slice(0, files.length - 50).forEach((file) => {
          fs.unlinkSync(join(backupsFolderPath, file));
        });
      }
    }

    // データをバックアップしてからウィンドウを閉じる
    ipcMain.on('close-completed', (_, data) => {
      if (data !== 'error') {
        saveBackup(data);
      }
      mainWindow?.destroy(); // ウィンドウを強制的に閉じる
      if (isQuitting) {
        app?.quit(); // アプリケーションを終了
      }
    });

    // データをバックアップ
    ipcMain.on('save-backup', (_, { data }) => {
      saveBackup(data);
    });

    // OAuth認証プロバイダからのリダイレクトを処理するエンドポイント
    expressApp.get('/__/auth/handler', async (req, res) => {
      // URLクエリから認証コードを取得し、デコードする
      const code = req.query.code;

      if (code && typeof code === 'string') {
        // Now that we have the code, use that to acquire tokens.
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('redirect_uri', redirectUri);
        params.append('grant_type', 'authorization_code');
        params.append('access_type', 'offline');

        fetch(tokenUrl, {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            mainWindow?.webContents.send('google-auth-token', data.id_token);
            res.send('認証が完了しました。このページを閉じてください。');
          })
          .catch((error) => console.error('Error:', error));
      } else {
        res.send('認証コードが見つかりませんでした。');
      }
    });

    createWindow();

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

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
