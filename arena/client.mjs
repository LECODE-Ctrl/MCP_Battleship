// Thin MCP transport: sends the tool call unchanged; contains no playing strategy.
const [match_id,seat_token,name,json='{}']=process.argv.slice(2);
if(!match_id||!seat_token||!name)throw Error('Usage: node client.mjs MATCH SEAT_TOKEN TOOL JSON_ARGUMENTS');
const response=await fetch('http://127.0.0.1:8771/mcp',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method:'tools/call',params:{name,arguments:{...JSON.parse(json),match_id,seat_token}}}),signal:AbortSignal.timeout(30000)});
const body=await response.json();console.log(JSON.stringify(body.result||body.error));if(body.result?.isError)process.exitCode=1;
