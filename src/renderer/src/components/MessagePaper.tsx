import { useEffect, useState } from 'react';
import { Paper, Typography, Divider, Box } from '@mui/material';
import { useAppStateStore } from '../store/appStateStore';

export const MessagePaper = () => {
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  const isLoggedIn = useAppStateStore((state) => state.isLoggedIn); // ログイン状態

  // アプリバージョン情報の取得
  useEffect(() => {
    // 現在のアプリバージョンを取得
    const fetchCurrentVersion = async () => {
      const version = await window.electron.getAppVersion();
      setCurrentVersion(version);
    };

    // 最新バージョン情報を取得
    const fetchLatestVersion = async () => {
      try {
        const response = await fetch('https://tasktree-s.web.app/version.json');
        const data = await response.json();
        setLatestVersion(data.version);
        setUpdateMessage(data.message);
      } catch (error) {
        setLatestVersion('※バージョン情報の取得に失敗しました。' + error);
      }
    };

    fetchCurrentVersion();
    fetchLatestVersion();
  }, [isLoggedIn]);

  // 新しいバージョンがあるかどうかを判定
  useEffect(() => {
    if (currentVersion && latestVersion) {
      const currentVersionArray = currentVersion.split('.').map((v) => parseInt(v));
      const latestVersionArray = latestVersion.split('.').map((v) => parseInt(v));
      if (currentVersionArray[0] < latestVersionArray[0]) {
        setIsNewVersionAvailable(true);
      } else if (currentVersionArray[0] === latestVersionArray[0]) {
        if (currentVersionArray[1] < latestVersionArray[1]) {
          setIsNewVersionAvailable(true);
        } else if (currentVersionArray[1] === latestVersionArray[1]) {
          if (currentVersionArray[2] < latestVersionArray[2]) {
            setIsNewVersionAvailable(true);
          }
        }
      }
    }
  }, [currentVersion, latestVersion]);

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Paper sx={{ maxWidth: 400, margin: 'auto', marginTop: 4 }}>
        <Typography variant='body2' sx={{ textAlign: 'left', p: 2 }} gutterBottom>
          ver{currentVersion}
        </Typography>
        {isNewVersionAvailable ? (
          <>
            <Divider />
            <Typography variant='body2' sx={{ textAlign: 'left', p: 2 }} gutterBottom>
              {`最新バージョン: ${latestVersion} が利用可能です。`}
              <br />
              <a href='https://tasktree-s.web.app/download' target='_blank' rel='noreferrer'>
                ダウンロード
              </a>
              <br />
              <br />＞ {updateMessage}
            </Typography>
          </>
        ) : (
          <>
            <Divider />
            <Typography variant='body2' sx={{ textAlign: 'left', p: 2 }} gutterBottom>
              最新バージョン: {latestVersion}
              <br />
              {!latestVersion.includes('※バージョン情報の取得に失敗しました。') && 'お使いのバージョンは最新です。'}
            </Typography>
          </>
        )}
      </Paper>
      <Typography variant='caption' sx={{ width: '100%', minWidth: '100%', textAlign: 'center' }}>
        <a href='mailto:app@bucketrelay.com' target='_blank' rel='noreferrer'>
          ©{new Date().getFullYear()} Jun Murakami
        </a>{' '}
        |{' '}
        <a href='https://github.com/Jun-Murakami/TaskTrees-Electron' target='_blank' rel='noreferrer'>
          GitHub
        </a>{' '}
        |{' '}
        <a href='https://tasktree-s.web.app/privacy-policy' target='_blank' rel='noreferrer'>
          Privacy policy
        </a>
      </Typography>
      <Typography variant='caption' sx={{ width: '100%' }}></Typography>
    </Box>
  );
};
