import fs from 'node:fs';import path from 'node:path';
const source=process.argv[2]||'.arena-state/match.json',destination=process.argv[3]||'dist/match-replay.json';
const match=JSON.parse(fs.readFileSync(source,'utf8'));
if(match.status!=='finished'||!['A','B'].includes(match.winner))throw Error('Only finished matches may be exported: live fleets stay private.');
const {id,status,winner,createdAt,finishedAt,players,events}=match;
const replay={id,status,winner,createdAt,finishedAt,players:Object.fromEntries(['A','B'].map(seat=>[seat,{name:players[seat].name,strategy:players[seat].strategy,fleet:players[seat].fleet,shots:players[seat].shots}])),events};
fs.mkdirSync(path.dirname(path.resolve(destination)),{recursive:true});fs.writeFileSync(destination,JSON.stringify(replay,null,2));
console.log(JSON.stringify({winner,shots:events.filter(e=>e.type==='shot').length,replay:destination}));
