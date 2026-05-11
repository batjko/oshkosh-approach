import type { LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import './tailwind.css'
import { PHProvider } from './provider'

export const links: LinksFunction = () => [
  { rel: 'manifest', href: '/manifest.json' },
  {
    rel: 'icon',
    href: '/favicon.ico',
    type: 'image/x-icon',
    sizes: '16x16 32x32 48x48'
  },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  { rel: 'icon', href: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
  { rel: 'icon', href: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
  { rel: 'mask-icon', href: '/favicon.svg', color: '#1f4e8c' }
]

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="chart" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#1f4e8c" />
        <meta name="google" content="notranslate" />
        <meta name="msapplication-TileColor" content="#1f4e8c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="color-scheme" content="light dark" />
        <Meta />
        <Links />
      </head>
      <body className="h-full font-prose antialiased">
        <PHProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </PHProvider>
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
