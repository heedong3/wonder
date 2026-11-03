import { getStore } from '@netlify/blobs';
const roster = ['소연','은영','미강','영신','예진','지은','혜린','희원','순진','예림','석희','송지수','양지수','영인','하연','서라','김슬기','이슬기','영림','혜수','호정','미정','효선','한라봉','남희','진휘','Y','.'];
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const validId=x=>typeof x==='string'&&/^[0-9a-f-]{36}$/.test(x);
const validDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x+'T12:00:00Z'));
const validTime=x=>typeof x==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(x);
export default async function(req){
  if(!['GET','POST','PATCH','DELETE'].includes(req.method))return json({error:'지원하지 않는 요청'},405);
  try{
    const eventStore=getStore({name:'wonder-schedule-events',consistency:'strong'});
    const attendStore=getStore({name:'wonder-schedule-attendance',consistency:'strong'});
    if(req.method==='GET'){
      const [{blobs:entries},{blobs:answers}]=await Promise.all([eventStore.list(),attendStore.list()]);
      const records=(await Promise.all(entries.map(e=>eventStore.get(e.key,{type:'json'})))).filter(Boolean);
      const byId=new Map(records.map(e=>[e.id,{...e,attendance:{}}]));
      await Promise.all(answers.map(async entry=>{
        const slash=entry.key.indexOf('/');if(slash<0)return;
        const id=entry.key.slice(0,slash),name=decodeURIComponent(entry.key.slice(slash+1));
        const event=byId.get(id);if(!event||!roster.includes(name))return;
        const status=await attendStore.get(entry.key);
        if(['attend','maybe','absent'].includes(status))event.attendance[name]=status;
      }));
      return json({events:[...byId.values()]});
    }
    let body;try{body=await req.json()}catch{return json({error:'올바른 데이터가 아닙니다.'},400)}
    if(req.method==='POST'){
      if(!['practice','friendly','tournament'].includes(body.type)||!validDate(body.date)||!validTime(body.time)||typeof body.place!=='string'||!body.place.trim()||body.place.trim().length>100)return json({error:'일정 입력을 확인하세요.'},400);
      const record={id:crypto.randomUUID(),type:body.type,date:body.date,time:body.time,place:body.place.trim()};
      await eventStore.setJSON(record.id,record);return json({ok:true,id:record.id},201);
    }
    if(!validId(body.id))return json({error:'올바르지 않은 일정입니다.'},400);
    const existing=await eventStore.get(body.id,{type:'json'});
    if(!existing)return json({error:'이미 삭제된 일정입니다.'},404);
    if(req.method==='DELETE'){await eventStore.delete(body.id);return json({ok:true})}
    if(!roster.includes(body.name)||!['none','attend','maybe','absent'].includes(body.value))return json({error:'선수 또는 참석 상태가 잘못되었습니다.'},400);
    const key=body.id+'/'+encodeURIComponent(body.name);
    if(body.value==='none')await attendStore.delete(key);else await attendStore.set(key,body.value);
    return json({ok:true});
  }catch(err){console.error('schedule function error:',err);return json({error:'공동 저장 서버 오류가 발생했습니다.'},500)}
}
