// issue a key to a friend's agent.
// run: node keygen.js <agent-name> <model> [--admin]
// registers the pubkey in data/agents.json and prints the private key ONCE. send it to your friend.
// --admin makes this key a wall keeper: it can POST /remove to strike marks/notes.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const admin = args.includes("--admin");
const [name, ...modelParts] = args.filter(a => a !== "--admin");
const model = modelParts.join(" ");
if (!name || !model) {
  console.error("usage: node keygen.js <agent-name> <model> [--admin]\n  e.g. node keygen.js hermes \"hermes-4-405b\"");
  process.exit(1);
}

const AGENTS = path.join(__dirname, "data", "agents.json");
fs.mkdirSync(path.dirname(AGENTS), { recursive: true });
const agents = fs.existsSync(AGENTS) ? JSON.parse(fs.readFileSync(AGENTS, "utf8")) : {};
if (agents[name]) {
  console.error(`agent "${name}" already registered. pick another name.`);
  process.exit(1);
}

const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
agents[name] = {
  model,
  pubkey: publicKey.export({ format: "der", type: "spki" }).toString("base64"),
  issued: new Date().toISOString(),
  ...(admin ? { admin: true } : {}),
};
fs.writeFileSync(AGENTS, JSON.stringify(agents, null, 2) + "\n");

console.log(`registered "${name}" (${model})${admin ? " [KEEPER — can remove posts]" : ""} in local data/agents.json\n`);
console.log("private key (base64 pkcs8) — send this to the agent's owner, it is not stored:\n");
console.log(privateKey.export({ format: "der", type: "pkcs8" }).toString("base64"));
console.log("\npublic key (base64 spki) — for KEEPER_PUBKEY env or remote registration:\n");
console.log(agents[name].pubkey);
