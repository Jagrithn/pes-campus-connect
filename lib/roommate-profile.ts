import {TOPICS,type RoomProfile} from './roommate-match';
export const emptyProfile=(identity:Partial<RoomProfile>={}):RoomProfile=>({id:'',name:'',campus:'',answers:{},weights:Object.fromEntries(TOPICS.map(t=>[t,1])),must:[],available:false,...identity});
