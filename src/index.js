// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// 获取根元素
const container = document.getElementById('root');

// 使用 createRoot 方法
const root = createRoot(container);

// 渲染应用程序
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
