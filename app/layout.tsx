import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Campus Connect — Your people. Your campus.',description:'Find your kind of people in PES hostels. Personal priorities, shared interests and conversations before a decision.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><head><meta name="google-site-verification" content="mDhnSbjJKJYpy1K-efUTU0G_nvz-UZW_UT2C-eEpnf0" /></head><body>{children}</body></html>}
