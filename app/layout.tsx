import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de clases',
  description: 'Editor de clases Domingos IA'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
