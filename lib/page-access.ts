import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {roomUser} from './roommate-server';

// Protect server-rendered app pages before any campus content is rendered.
export async function requireStudent(next='/'){
 const h=await headers();
 const user=await roomUser(new Request('https://campus.internal/',{headers:{cookie:h.get('cookie')||''}}));
 if(!user)redirect(next==='/clubs'?'/clubs/login':'/login'+(next==='/'?'':'?next='+encodeURIComponent(next)));
 return user;
}
