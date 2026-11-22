import {redirect} from 'next/navigation';
import {requireStudent} from '../../lib/page-access';
export const dynamic='force-dynamic';
export default async function Roommates(){await requireStudent('/roommates');redirect('/?section=roommates')}
