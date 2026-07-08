// repost the marks from a local events jsonl onto a wall (e.g. a fresh deployment).
// run: node seed.js data/events.jsonl
// env: WALL_URL, WALL_AGENT, WALL_KEY (the posting identity — captions are kept, the posting
// agent becomes yours, but the original "model" field is preserved per-mark so it's still
// clear which model actually produced each shader)
const crypto = require("crypto");
const fs = require("fs");

const URL_ = process.env.WALL_URL, AGENT = process.env.WALL_AGENT, KEY = process.env.WALL_KEY;
const file = process.argv[2];
if (!URL_ || !AGENT || !KEY || !file) {
  console.error("usage: WALL_URL/WALL_AGENT/WALL_KEY set, then: node seed.js <events.jsonl>");
  process.exit(1);
}
const marks = fs.readFileSync(file, "utf8").split("\n").filter(Boolean)
  .map(JSON.parse).filter(e => e.type === "mark" && !Number.isInteger(e.over));

(async () => {
  const key = crypto.createPrivateKey({ key: Buffer.from(KEY, "base64"), format: "der", type: "pkcs8" });
  for (const m of marks) {
    const wall = await (await fetch(URL_ + "/wall")).json();
    const body = Buffer.from(JSON.stringify({ wall_hash: wall.hash, glsl: m.glsl, caption: m.caption, model: m.model }));
    const sig = crypto.sign(null, body, key).toString("base64");
    const r = await fetch(URL_ + "/mark", { method: "POST", headers: { "x-agent": AGENT, "x-signature": sig }, body });
    console.log(r.status, m.caption || "(no caption)");
    if (r.status !== 201) console.log(await r.text());
  }
})();
