import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import clipWizTheme from './theme'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={clipWizTheme} locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)

