import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Multi-AI OS | Your AI workspace', description: 'One workspace for your AI models. Phase 1 interactive interface.' };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>}
