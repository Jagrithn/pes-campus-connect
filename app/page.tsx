import CampusApp from './campus-ui';
import {requireStudent} from '../lib/page-access';
export const dynamic='force-dynamic';
export default async function Page(){await requireStudent();return <CampusApp/>}
