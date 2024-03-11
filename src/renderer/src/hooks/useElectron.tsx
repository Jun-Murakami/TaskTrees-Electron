import { useEffect } from 'react';
import { useAppStateStore } from '../store/appStateStore';
import { useTreeStateStore } from '../store/treeStateStore';
import { useDatabase } from '../hooks/useDatabase';

interface ElectronProps {
  handleCreateNewTree: () => void;
  handleLoadedContent: (data: string | null) => void;
  handleDownloadTreeState: () => void;
  handleDownloadAllTrees: (isSilent?: boolean) => Promise<string>;
}

export const useElectron = ({
  handleCreateNewTree,
  handleLoadedContent,
  handleDownloadTreeState,
  handleDownloadAllTrees,
}: ElectronProps) => {
  const isLoggedIn = useAppStateStore((state) => state.isLoggedIn);
  const currentTree = useTreeStateStore((state) => state.currentTree);

  const items = useTreeStateStore((state) => state.items);

  const { saveItemsDb } = useDatabase();

  // 新規ツリー作成のイベントリスナーを登録
  useEffect(() => {
    window.electron.createNewTree(() => {
      handleCreateNewTree();
    });
    return () => {
      window.electron.removeCreateNewTreeListener(); // コンポーネントのアンマウント時にイベントリスナーを削除
    };
  }, [handleCreateNewTree]);

  // ツリーのインポートのイベントリスナーを登録
  useEffect(() => {
    const handleAsyncLoadedContent = async (data: string | null) => {
      await handleLoadedContent(data);
    };
    window.electron.onLoadedContent(handleAsyncLoadedContent);
    return () => {
      window.electron.removeLoadedContentListener();
    };
  }, [handleLoadedContent]);

  // ツリーの保存のイベントリスナーを登録
  useEffect(() => {
    window.electron.saveTree(async () => {
      await handleDownloadTreeState();
    });
    return () => {
      window.electron.removeSaveTreeListener();
    };
  }, [handleDownloadTreeState]);

  // 全ツリーの保存のイベントリスナーを登録
  useEffect(() => {
    window.electron.saveAllTrees(async () => {
      await handleDownloadAllTrees();
    });
    return () => {
      window.electron.removeSaveAllTreesListener();
    };
  }, [handleDownloadAllTrees]);

  // ログイン状態によってメニューの有効無効を切り替える
  useEffect(() => {
    window.electron.toggleMenuItem('create-new-tree', isLoggedIn);
    window.electron.toggleMenuItem('import-tree', isLoggedIn);
    if (!currentTree) {
      window.electron.toggleMenuItem('save-tree', false);
    } else {
      window.electron.toggleMenuItem('save-tree', isLoggedIn);
    }
    window.electron.toggleMenuItem('save-all-tree', isLoggedIn);
  }, [isLoggedIn, currentTree]);

  // アプリ終了時に全ツリーを保存
  useEffect(() => {
    window.electron.onBeforeClose(async () => {
      const data = await handleDownloadAllTrees(true);
      if (data && typeof data === 'string') {
        window.electron.sendCloseCompleted(data);
      }
    });

    return () => {
      window.electron.removeBeforeCloseListener();
    };
  }, [handleDownloadAllTrees]);

  // ログインしたらタイマーをセットしてデータをバックアップ
  useEffect(() => {
    if (isLoggedIn) {
      const asyncRun = async () => {
        const data = await handleDownloadAllTrees(true);
        if (data && typeof data === 'string') {
          window.electron.saveBackup(data);
        }
      };
      // ログインしてから10秒後にバックアップを作成
      const timer = setTimeout(asyncRun, 1000 * 10);

      // タイマーをセットして8時間ごとにバックアップを作成
      const timer2 = setInterval(
        async () => {
          const data = await handleDownloadAllTrees(true);
          if (data && typeof data === 'string') {
            window.electron.saveBackup(data);
          }
        },
        1000 * 60 * 60 * 8
      );
      return () => {
        clearTimeout(timer);
        clearInterval(timer2);
      };
    }
    return () => {};
  }, [isLoggedIn, handleDownloadAllTrees]);

  // アプリ終了時に現在のツリーを保存
  useEffect(() => {
    window.electron.saveLastTree(() => {
      if (currentTree) {
        saveItemsDb(items, currentTree);
      }
    });

    return () => {
      window.electron.removeSaveLastTreeListener();
    };
  }, [currentTree, saveItemsDb]);
};
