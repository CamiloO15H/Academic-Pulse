import '@/index.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Academic Pulse | Automation Platform',
    description: 'Autonomous academic automation for smart students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (<html lang='en'><body className='dark bg-background text-foreground'>{children}</body></html>);
}