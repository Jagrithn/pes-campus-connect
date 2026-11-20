import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Campus Connect — Your people. Your campus.',description:'Discover campus events, form your team and make plans at PES.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
