import { useEffect } from 'react'
import { useAppStateStore } from '../store/appStateStore'
import { useTreeStateStore } from '../store/treeStateStore'

interface NativeMenuProps {
  handleCreateNewTree: () => void
  handleLoadedContent: (data: string | null) => void
  handleDownloadAppState: () => void
}

export const useNativeMenu = ({
  handleCreateNewTree,
  handleLoadedContent,
  handleDownloadAppState
}: NativeMenuProps) => {
  const isLoggedIn = useAppStateStore((state) => state.isLoggedIn)
  const currentTree = useTreeStateStore((state) => state.currentTree)

  // 新規ツリー作成のイベントリスナーを登録
  useEffect(() => {
    window.electron.createNewTree(() => {
      handleCreateNewTree()
    })

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => {
      window.electron.removeCreateNewTreeListener()
    }
  }, [handleCreateNewTree])

  // ツリーのインポートのイベントリスナーを登録
  useEffect(() => {
    const handleAsyncLoadedContent = async (data: string | null) => {
      await handleLoadedContent(data)
    }
    window.electron.onLoadedContent(handleAsyncLoadedContent)

    return () => {
      window.electron.removeLoadedContentListener()
    }
  }, [handleLoadedContent])

  // ツリーの保存のイベントリスナーを登録
  useEffect(() => {
    window.electron.saveTree(() => {
      handleDownloadAppState()
    })

    return () => {
      window.electron.removeSaveTreeListener()
    }
  }, [])

  useEffect(() => {
    window.electron.toggleMenuItem('create-new-tree', isLoggedIn)
    window.electron.toggleMenuItem('import-tree', isLoggedIn)
    if (!currentTree) {
      window.electron.toggleMenuItem('save-tree', false)
    } else {
      window.electron.toggleMenuItem('save-tree', isLoggedIn)
    }
  }, [isLoggedIn, currentTree])
}
