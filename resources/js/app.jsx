import './bootstrap';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { ThemeProvider } from 'next-themes';

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="ht-theme"
        disableTransitionOnChange
      >
        <MotionConfig reducedMotion="user">
          <App {...props} />
        </MotionConfig>
      </ThemeProvider>
    )
  },
  progress: { color: '#1f6f55' },
})
