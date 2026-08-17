import '../styles/globals.css';
export const metadata = { title: 'NusaSec CMS', description: 'NusaSec content platform' };
export default function RootLayout({children}:{children:React.ReactNode}){ return <html lang="id"><body>{children}</body></html>; }
