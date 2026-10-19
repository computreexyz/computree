export const API_BASE = 'https://api.computree.ai';

export const CURL_SNIPPET = `curl ${API_BASE}/v1/chat/completions \\
  -H "Authorization: Bearer ct_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`;

export const CURL_TYPED_LINES = [
  `$ curl ${API_BASE}/v1/chat/completions \\`,
  '  -H "Authorization: Bearer ct_live_YOUR_KEY" \\',
  '  -H "Content-Type: application/json" \\',
  '  -d \'{ "model": "qwen", "messages": [{ "role": "user", "content": "Hello" }] }\'',
  '',
  '{',
  '  "id": "chatcmpl_9f2ac1",',
  '  "model": "qwen",',
  '  "credits_used": 1.4,',
  '  "choices": [ { "message": { "role": "assistant", "content": "Hello!" } } ]',
  '}',
];

export const JS_SNIPPET = `import Computree from '@computree/sdk';

const client = new Computree({ apiKey: process.env.COMPUTREE_API_KEY });

const completion = await client.chat.completions.create({
  model: 'qwen',
  messages: [{ role: 'user', content: 'Hello' }],
});

console.log(completion.choices[0].message.content);`;

export const PYTHON_SNIPPET = `from computree import Computree

client = Computree(api_key=os.environ["COMPUTREE_API_KEY"])

completion = client.chat.completions.create(
    model="qwen",
    messages=[{"role": "user", "content": "Hello"}],
)

print(completion.choices[0].message.content)`;
