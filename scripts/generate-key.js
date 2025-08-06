#!/usr/bin/env node
/* eslint-disable */

const crypto = require("crypto");

// Helper functions
const generateBase64Key = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("base64");
const generateHexKey = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
const generateUuid = () => crypto.randomUUID();

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Error: KEY_NAME is required");
    console.error("Usage: node generate-key.js KEY_NAME [format] [bytes]");
    console.error("  format: base64 (default), hex, or uuid");
    console.error("  bytes: number of bytes for base64/hex keys (default: 32)");
    process.exit(1);
  }

  const keyName = args[0];
  const format = args[1] || "base64";
  const bytes = parseInt(args[2]) || 32;

  let generatedKey;

  switch (format.toLowerCase()) {
    case "base64":
      generatedKey = generateBase64Key(bytes);
      break;
    case "hex":
      generatedKey = generateHexKey(bytes);
      break;
    case "uuid":
      generatedKey = generateUuid();
      break;
    default:
      console.error(
        `Error: Invalid format "${format}". Use base64, hex, or uuid`
      );
      process.exit(1);
  }

  console.log("Key Generated. Add this to your environment variables:");
  console.log("");
  console.log(`${keyName}=${generatedKey}`);
}

if (require.main === module) {
  main();
}
