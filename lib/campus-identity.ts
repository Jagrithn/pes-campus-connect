import {roomUser} from './roommate-server';
export async function getCampusUser(req:Request){
 const pesu=await roomUser(req);
 if(pesu)return {userId:pesu.id,email:'',fullName:pesu.name,displayName:pesu.name,pesu:true,isOwner:false,academic:pesu};
 return null;
}
