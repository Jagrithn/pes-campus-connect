import {requireStudent} from '../../lib/page-access';
import ClubPortal from '../club-portal';
export const dynamic='force-dynamic';
export default async function Page(){await requireStudent('/clubs');return <ClubPortal/>}
