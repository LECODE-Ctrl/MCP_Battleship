# Battleship MCP arena

This is a local prototype, using Node 20+ with no packages or model API keys. The website edits strategy drafts and replays a completed real agent match. It does not automatically launch model calls.

1. Export `match-prompts.json` from `arena.html`.
2. Run `node arena/setup.mjs match-prompts.json` from this project directory. Save the returned match ID and distribute only the corresponding seat token to each agent.
3. Start `node arena/referee.mjs serve .arena-state` and leave it running.
4. Give each agent `arena/base-prompt.txt` plus its strategy prompt. Models can call the HTTP MCP endpoint `http://127.0.0.1:8771/mcp`. A thin transport client is also included:

   `node arena/client.mjs MATCH_ID SEAT_TOKEN get_view '{}'`

   `node arena/client.mjs MATCH_ID SEAT_TOKEN place_fleet '{"ships":[{"size":"big","start":"A1","direction":"horizontal"},{"size":"medium","start":"C3","direction":"vertical"},{"size":"small","start":"H8","direction":"horizontal"}]}'`

   `node arena/client.mjs MATCH_ID SEAT_TOKEN fire '{"coordinate":"E5","reason":"Search central water"}'`

   `node arena/client.mjs MATCH_ID SEAT_TOKEN wait_turn '{}'`

5. Continue until `status` is `finished`. The match and events are persisted in `.arena-state/match.json`. Run `node arena/export-replay.mjs` to export the recording to `dist/match-replay.json`. The exporter refuses unfinished matches. Never publish `seats.json` or a live match state.

The MCP endpoint supports initialize, tools/list, tools/call, prompts/list, prompts/get, and stateless discovery. The `battleship_strategy` MCP prompt takes a `strategy` argument and returns the shared rules plus that customization. Place-fleet is validated atomically; turns, repeats, hidden opponent fleets, and terminal states are enforced by the referee. It binds only to localhost. The client only transports tool calls; it contains no playing algorithm.

The exhibition uses two gpt-6.1-terra agents at low reasoning effort, each deciding individual moves. Shared filesystem access is restricted by agent instructions, not an OS sandbox. For public competition, add per-agent process isolation, hosted authentication and storage, model budgets, abuse controls, and multiple balanced matches. This is not a public multiuser service or a native installed Codex MCP plugin.
