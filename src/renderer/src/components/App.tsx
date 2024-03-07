import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import { theme, darkTheme } from '../theme/mui_theme'
import { CssBaseline, ThemeProvider, Divider } from '@mui/material'
import { useAppStateStore } from '../store/appStateStore'
import { HomePage } from './HomePage'
import { PrivacyPolicy } from './PrivacyPolicy'

export default function App() {
  const darkMode = useAppStateStore((state) => state.darkMode) // ダークモードの状態

  return (
    <ThemeProvider theme={darkMode ? darkTheme : theme}>
      <CssBaseline />
      <Divider sx={{ position: 'fixed', width: '100%', top: 0, zIndex: 10000 }} />
      <Router>
        <Routes>
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
