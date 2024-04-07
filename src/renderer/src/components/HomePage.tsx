import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ModalDialog } from '../components/ModalDialog';
import { InputDialog } from '../components/InputDialog';
import { ResponsiveDrawer } from './ResponsiveDrawer';
import { MessagePaper } from './MessagePaper';
import { TaskTreesLogo } from './TaskTreesLogo';
import { Button, CircularProgress, Typography, TextField, Box, Stack, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { TreeSettingsAccordion } from './TreeSettingsAccordion';
import { SortableTree } from './SortableTree/SortableTree';
import { useDialogStore } from '../store/dialogStore';
import { useInputDialogStore } from '../store/dialogStore';
import { useAppStateStore } from '../store/appStateStore';
import { useTreeStateStore } from '../store/treeStateStore';
import { useElectron } from '@renderer/hooks/useElectron';

export function HomePage() {
  const [email, setEmail] = useState(''); // ログイン用メールアドレス
  const [password, setPassword] = useState(''); // ログイン用パスワード
  const isLoading = useAppStateStore((state) => state.isLoading); // ローディング中の状態
  const isLoggedIn = useAppStateStore((state) => state.isLoggedIn); // ログイン状態
  const systemMessage = useAppStateStore((state) => state.systemMessage); // システムメッセージ
  const isWaitingForDelete = useAppStateStore((state) => state.isWaitingForDelete); // アカウント削除の確認状態
  const setIsWaitingForDelete = useAppStateStore((state) => state.setIsWaitingForDelete); // アカウント削除の確認状態を変更
  const currentTree = useTreeStateStore((state) => state.currentTree);

  const isDialogVisible = useDialogStore((state: { isDialogVisible: boolean }) => state.isDialogVisible);
  const isInputDialogVisible = useInputDialogStore((state: { isDialogVisible: boolean }) => state.isDialogVisible);

  // 認証状態の監視とログイン、ログアウトを行うカスタムフック
  const { handleEmailLogin, handleSignup, handleResetPassword, handleLogout, handleDeleteAccount } = useAuth();
  // メニューのイベントリスナーを登録するカスタムフック
  useElectron();
  const theme = useTheme();
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const drawerWidth = 300;

  return (
    <>
      {isDialogVisible && <ModalDialog />}
      {isInputDialogVisible && <InputDialog />}
      {isLoggedIn ? (
        !isWaitingForDelete ? (
          // ログイン後のメイン画面
          <>
            <ResponsiveDrawer handleLogout={async () => await handleLogout()} />
            <Box
              sx={{
                flexGrow: 1,
                maxWidth: '930px',
                px: '15px',
                pt: 0,
                pb: '60px',
                mx: 'auto',
                minHeight: currentTree !== null ? '100vh' : 'auto',
                '@media (max-width: 1546px)': {
                  ml: { xs: 'auto', sm: `${drawerWidth}px` },
                },
              }}
            >
              {currentTree ? (
                <>
                  <TreeSettingsAccordion />
                  <Box sx={{ maxWidth: '900px', width: '100%', marginX: 'auto', mb: 6 }} id='tree-container'>
                    <SortableTree collapsible indicator removable />
                  </Box>
                </>
              ) : (
                <>
                  <TaskTreesLogo />
                  <MessagePaper />
                </>
              )}
              {isLoading && (
                <CircularProgress
                  sx={{
                    position: 'fixed',
                    display: 'block',
                    left: 'calc(50% - 20px)',
                    '@media (min-width: 1249px) and (max-width: 1546px)': {
                      left: { xs: 'calc(50% - 20px)', sm: '745px' },
                    },
                    '@media (max-width: 1249px)': {
                      left: { xs: 'calc(50% - 20px)', sm: 'calc((100vw - (100vw - 100%) - 300px) / 2 + 300px - 20px)' },
                    },
                    top: 'calc(50vh - 20px)',
                    zIndex: 1400,
                  }}
                />
              )}
            </Box>
          </>
        ) : (
          // アカウント削除の確認ダイアログ
          <Box sx={{ textAlign: 'center' }}>
            <TaskTreesLogo />
            <Typography variant='body2' sx={{ marginY: 4 }}>
              アプリケーションのすべてのデータとアカウント情報が削除されます。
              <br />
              （複数メンバーで共有しているツリーは自分が編集メンバーから削除されます。）
              <br />
              この操作は取り消せません。削除を実行しますか？
            </Typography>
            <Button
              onClick={async () => {
                await handleDeleteAccount();
              }}
              variant={'contained'}
              startIcon={<DeleteForeverIcon />}
              color='error'
              sx={{ marginRight: 4 }}
            >
              削除する
            </Button>
            <Button onClick={() => setIsWaitingForDelete(false)} variant={'outlined'}>
              キャンセル
            </Button>
          </Box>
        )
      ) : (
        // ログイン前の画面
        <Box sx={{ textAlign: 'center', width: 400, maxWidth: '90vw', marginX: 'auto', paddingY: 4 }}>
          <TaskTreesLogo />
          {isLoading ? (
            <CircularProgress sx={{ marginY: 4, display: 'block', marginX: 'auto' }} />
          ) : (
            <>
              <Stack spacing={2}>
                <TextField
                  label='メールアドレス'
                  variant='outlined'
                  margin='normal'
                  value={email}
                  size='small'
                  fullWidth
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loginButtonRef.current?.click();
                    }
                  }}
                />
                <TextField
                  label='パスワード'
                  variant='outlined'
                  margin='normal'
                  type='password'
                  value={password}
                  size='small'
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loginButtonRef.current?.click();
                    }
                  }}
                />
                <Box sx={{ mt: 4, width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    ref={loginButtonRef}
                    sx={{ width: '48%', left: 0 }}
                    variant='contained'
                    onClick={async () => await handleEmailLogin(email, password)}
                  >
                    ログイン
                  </Button>
                  <Button
                    sx={{
                      width: '48%',
                      right: 0,
                      backgroundColor: 'rgba(128, 128, 128, 0.1)',
                      color: theme.palette.primary.main,
                    }}
                    variant='outlined'
                    onClick={async () => await handleSignup(email, password)}
                  >
                    新規ユーザー登録
                  </Button>
                </Box>
                <Divider />
                <Button onClick={async () => await handleResetPassword(email)} variant='outlined' size='small'>
                  <Typography variant='caption'>パスワードをリセット</Typography>
                </Button>
                <Typography variant='caption' sx={{ marginY: 1 }}>
                  デスクトップ版ではGoogleアカウントでのログインはできません。
                  <br />
                  <a href='https://tasktree-s.web.app' target='_blank'>
                    Web版
                  </a>
                  をGoogleログインでご利用の方は、
                  <br />
                  最初にメールアドレスを入力してパスワードをリセットしてください。
                  <br />
                  ※ツリーデータはデスクトップ版とWebアプリ版で共有されます。
                </Typography>
              </Stack>
            </>
          )}
          {systemMessage && (
            <Box
              sx={{
                backgroundColor: theme.palette.action.hover,
                borderRadius: 4,
                py: '10px',
                mx: 'auto',
                mt: 2,
                mb: 0,
                width: '100%',
              }}
            >
              <Typography variant='body2' sx={{ mx: 2, color: theme.palette.primary.main }}>
                {systemMessage}
              </Typography>
            </Box>
          )}
          <MessagePaper />
        </Box>
      )}
    </>
  );
}
