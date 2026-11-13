const ships=[['Big ship',5],['Medium ship',3],['Small ship',2]];
const $=id=>document.getElementById(id);
let player,enemy,phase='setup',timer=null,targets=[],lastPlayer=-1,lastEnemy=-1,turn=0,selected=0,horizontal=true;
function makeFleet(){const occupied=new Set();return ships.map(([name,size])=>{let cells;do{const horizontal=Math.random()<.5,r=Math.floor(Math.random()*(horizontal?10:11-size)),c=Math.floor(Math.random()*(horizontal?11-size:10));cells=Array.from({length:size},(_,i)=>(r+(horizontal?0:i))*10+c+(horizontal?i:0));}while(cells.some(i=>occupied.has(i)));cells.forEach(i=>occupied.add(i));return {name,cells};});}
function newBoard(){return {fleet:makeFleet(),shots:new Set()};}
function sunk(board,ship){return ship.cells.length>0&&ship.cells.every(i=>board.shots.has(i));}
function afloat(board){return board.fleet.filter(s=>!sunk(board,s)).length;}
function coord(i){return String.fromCharCode(65+Math.floor(i/10))+(i%10+1);}
function shoot(board,i){if(board.shots.has(i))return null;board.shots.add(i);const ship=board.fleet.find(s=>s.cells.includes(i));return {hit:!!ship,sunk:ship&&sunk(board,ship),ship};}
function renderBoard(board,id,reveal){const el=$(id);el.replaceChildren();const corner=document.createElement('span');el.append(corner);for(let c=1;c<=10;c++){const label=document.createElement('span');label.className='coord';label.textContent=c;el.append(label);}for(let r=0;r<10;r++){const label=document.createElement('span');label.className='coord';label.textContent=String.fromCharCode(65+r);el.append(label);for(let c=0;c<10;c++){const i=r*10+c,ship=board.fleet.find(s=>s.cells.includes(i)),fired=board.shots.has(i),isSunk=ship&&sunk(board,ship),cell=document.createElement(id==='enemy'||phase==='setup'?'button':'div');cell.className='cell'+(id==='enemy'?' target':'')+(ship&&reveal?' ship':'')+(fired?(ship?' hit':' miss'):'')+(isSunk?' sunk':'')+((id==='enemy'?lastEnemy:lastPlayer)===i?' last':'');if(fired&&ship)cell.textContent='×';const state=fired?(ship?(isSunk?'sunk '+ship.name:'hit'):'miss'):(ship&&reveal?ship.name:'unexplored');cell.setAttribute('aria-label',coord(i)+', '+state);cell.title=coord(i)+' · '+state;if(id==='player'&&phase==='setup'){cell.onclick=()=>place(i);cell.onmouseenter=cell.onfocus=()=>preview(i);cell.onmouseleave=cell.onblur=clearPreview;}if(id==='enemy'){cell.disabled=phase!=='player'||fired;cell.onclick=()=>fire(i);}el.append(cell);}}const fleet=$(id+'Fleet');fleet.replaceChildren();board.fleet.forEach((s,index)=>{const item=document.createElement('span');item.className='fleet-item'+(sunk(board,s)?' lost':'');item.title=s.name+' · '+ships[index][1]+' squares'+(sunk(board,s)?' · sunk':'');item.setAttribute('aria-label',item.title);for(let j=0;j<ships[index][1];j++)item.append(document.createElement('i'));fleet.append(item);});$(id+'Left').textContent=id==='player'&&phase==='setup'?board.fleet.filter(s=>s.cells.length).length+' / 3 SHIPS PLACED':afloat(board)+' SHIPS AFLOAT';}
function render(){renderPlacement();renderBoard(player,'player',true);renderBoard(enemy,'enemy',phase==='over');$('shots').textContent=enemy.shots.size+' SHOTS FIRED';$('enemyTag').textContent=phase==='setup'?'Awaiting orders':phase==='player'?'Your turn':phase==='computer'?'Enemy turn':'Battle complete';$('shuffle').style.display=phase==='setup'?'':'none';$('start').style.display=phase==='setup'?'':'none';$('restart').style.display=phase==='setup'?'none':'inline-block';}
function status(title,hint){$('status').textContent=title;$('hint').textContent=hint;}
function message(who,i,result){return who+' → '+coord(i)+' · '+(result.sunk?result.ship.name+' sunk':result.hit?'Hit':'Miss');}
function end(won){phase='over';status(won?'Victory. Waters secured.':'Your fleet has been sunk.',won?'You sank all three enemy ships in '+enemy.shots.size+' shots.':'The enemy wins this battle. Try a new fleet.');render();}
function fire(i){if(phase!=='player'||enemy.shots.has(i))return;const result=shoot(enemy,i);lastEnemy=i;turn++;$('log').textContent=message('You',i,result);if(!afloat(enemy)){end(true);return;}phase='computer';status(result.sunk?'Enemy '+result.ship.name.toLowerCase()+' sunk.':result.hit?'Direct hit.':'Shot missed.','The computer is choosing a target…');render();timer=setTimeout(computerTurn,600);}
function computerTurn(){if(phase!=='computer')return;targets=targets.filter(i=>!player.shots.has(i));const available=Array.from({length:100},(_,i)=>i).filter(i=>!player.shots.has(i));const i=targets.length?targets.shift():available[Math.floor(Math.random()*available.length)];const result=shoot(player,i);lastPlayer=i;if(result.hit&&!result.sunk){const r=Math.floor(i/10),c=i%10;[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([r,c])=>r>=0&&r<10&&c>=0&&c<10).forEach(([r,c])=>{const n=r*10+c;if(!player.shots.has(n)&&!targets.includes(n))targets.push(n);});}$('log').textContent+=' / '+message('Enemy',i,result);if(!afloat(player)){end(false);return;}phase='player';status('Your move.',result.sunk?'Your '+result.ship.name.toLowerCase()+' was sunk. Select a square to return fire.':result.hit?'The enemy hit your fleet. Select a square to return fire.':'The enemy missed. Select a square in enemy waters.');render();}

function placementCells(i,size){
  const row=Math.floor(i/10),col=i%10;
  if(i<0||i>=100||(horizontal?col+size>10:row+size>10))return null;
  return Array.from({length:size},(_,n)=>i+n*(horizontal?1:10));
}
function canPlace(cells){return cells&&!player.fleet.some((ship,index)=>index!==selected&&ship.cells.some(i=>cells.includes(i)));}
function clearPreview(){document.querySelectorAll('#player .cell').forEach(cell=>cell.classList.remove('placement-preview','placement-invalid'));}
function preview(i){
  clearPreview();if(phase!=='setup'||selected<0)return;
  const cells=placementCells(i,ships[selected][1]),valid=canPlace(cells);
  const grid=document.querySelectorAll('#player .cell');
  (cells||[i]).forEach(n=>grid[n].classList.add(valid?'placement-preview':'placement-invalid'));
}
function setupStatus(){
  const ready=player.fleet.every(s=>s.cells.length);
  status(ready?'Your fleet is ready.':'Place your fleet.',selected>=0?'Place your '+ships[selected][0].toLowerCase()+' ('+ships[selected][1]+' squares), extending '+(horizontal?'right':'down')+' from your chosen square.':'Select a ship to move it, or start the battle.');
}
function place(i){
  if(phase!=='setup')return;
  if(selected<0){const index=player.fleet.findIndex(s=>s.cells.includes(i));if(index>=0){selected=index;setupStatus();render();}return;}
  const cells=placementCells(i,ships[selected][1]);
  if(!canPlace(cells)){status('That ship won’t fit.','Keep ships inside the grid without overlapping. Try another square or rotate.');return;}
  player.fleet[selected].cells=cells;
  selected=player.fleet.findIndex(s=>!s.cells.length);
  setupStatus();render();
}
function renderPlacement(){
  $('placement').hidden=phase!=='setup';
  $('start').disabled=!player.fleet.every(s=>s.cells.length);
  $('rotate').textContent=horizontal?'↻ Rotate · Horizontal':'↻ Rotate · Vertical';
  $('rotate').disabled=selected<0;
  const choices=$('shipChoices');choices.replaceChildren();
  ships.forEach(([name,size],index)=>{const button=document.createElement('button');button.className='action ship-choice'+(selected===index?' selected':'');button.setAttribute('aria-pressed',String(selected===index));button.textContent=name+' · '+size+(player.fleet[index].cells.length?' ✓':'');button.onclick=()=>{selected=index;setupStatus();render();};choices.append(button);});
}
function reset(){
  clearTimeout(timer);player={fleet:ships.map(([name])=>({name,cells:[]})),shots:new Set()};enemy=newBoard();phase='setup';selected=0;horizontal=true;targets=[];lastPlayer=lastEnemy=-1;turn=0;
  setupStatus();$('log').textContent='Three ships. One objective. Sink the enemy fleet.';render();
}
$('shuffle').onclick=()=>{if(phase!=='setup')return;player=newBoard();selected=-1;setupStatus();render();};
$('rotate').onclick=()=>{horizontal=!horizontal;clearPreview();setupStatus();renderPlacement();};
$('clear').onclick=()=>{if(phase!=='setup')return;player.fleet.forEach(s=>s.cells=[]);selected=0;setupStatus();render();};
$('start').onclick=()=>{if(phase!=='setup'||!player.fleet.every(s=>s.cells.length))return;phase='player';status('Your move.','Select a square in enemy waters to fire your first shot.');render();};
$('restart').onclick=reset;reset();
