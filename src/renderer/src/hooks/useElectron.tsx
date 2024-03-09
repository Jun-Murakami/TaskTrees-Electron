import { useEffect } from 'react';
import { useAppStateStore } from '../store/appStateStore';
import { useTreeStateStore } from '../store/treeStateStore';
import { useDatabase } from '../hooks/useDatabase';

interface ElectronProps {
  handleCreateNewTree: () => void;
  handleLoadedContent: (data: string | null) => void;
  handleDownloadTreeState: () => void;
  handleDownloadAllTrees: () => void;
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
    window.electron.saveTree(() => {
      handleDownloadTreeState();
    });
    return () => {
      window.electron.removeSaveTreeListener();
    };
  }, []);

  // 全ツリーの保存のイベントリスナーを登録
  useEffect(() => {
    window.electron.saveAllTrees(() => {
      handleDownloadAllTrees();
    });
    return () => {
      window.electron.removeSaveAllTreesListener();
    };
  }, []);

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
