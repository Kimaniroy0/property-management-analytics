import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppErrorBoundary } from './components/system/StatusPages';

const root = createRoot(document.getElementById('root')!);

root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
