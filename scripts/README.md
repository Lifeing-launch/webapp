# Scripts

This directory contains utility scripts for the webapp project.

## Key Generator (`generate-key.js`)

A simple tool for generating secure keys, secrets, and identifiers for environment variables.

### Usage

```bash
node scripts/generate-key.js KEY_NAME [format] [bytes]
```

**Parameters:**

- `KEY_NAME` (required) - The name of the environment variable
- `format` (optional) - Key format: `base64` (default), `hex`, or `uuid`
- `bytes` (optional) - Number of bytes for base64/hex keys (default: 32)

### Examples

**Generate EDGE_FUNCTION_API_KEY (base64, 32 bytes):**

```bash
node scripts/generate-key.js EDGE_FUNCTION_API_KEY
```

Output:

```
Key Generated. Add this to your environment variables:

EDGE_FUNCTION_API_KEY=kSxwnngAjRpOkllCk2457K9q2mLY7i4sGdbF97Kv6u0=
```

**Generate a hex key with 16 bytes:**

```bash
node scripts/generate-key.js MY_SECRET_KEY hex 16
```

Output:

```
Key Generated. Add this to your environment variables:

MY_SECRET_KEY=85353975cb59c4f7f4101e72e9b2b07f
```

**Generate a UUID:**

```bash
node scripts/generate-key.js SESSION_ID uuid
```

Output:

```
Key Generated. Add this to your environment variables:

SESSION_ID=d2706623-f35b-4b58-95a8-88a640d18d2a
```

### Current Usage

- `EDGE_FUNCTION_API_KEY`: is used to authenticate Supabase cron jobs calling Next.js API endpoints.
