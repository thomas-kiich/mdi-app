import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ path: '.env' });

const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

const baseUrl = forgeApiUrl.endsWith('/') ? forgeApiUrl : forgeApiUrl + '/';
const uploadUrl = new URL('v1/storage/upload', baseUrl);
uploadUrl.searchParams.set('path', 'test/audio-test.webm');

console.log('Upload URL:', uploadUrl.toString());

// Minimales WebM-Audio (echte Bytes)
const testAudio = Buffer.from('GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH', 'base64');
const blob = new Blob([testAudio], { type: 'audio/webm;codecs=opus' });
const form = new FormData();
form.append('file', blob, 'audio-test.webm');

const res = await fetch(uploadUrl, {
  method: 'POST',
  headers: { Authorization: `Bearer ${forgeApiKey}` },
  body: form,
});
console.log('Upload status:', res.status);
const text = await res.text();
console.log('Upload response:', text.substring(0, 300));

// Wenn Upload erfolgreich: Whisper testen
if (res.status === 200) {
  const data = JSON.parse(text);
  const audioUrl = data.url;
  console.log('S3 URL:', audioUrl);
  
  // Whisper testen
  const whisperUrl = new URL('v1/audio/transcriptions', baseUrl).toString();
  const audioRes = await fetch(audioUrl);
  const audioBuf = Buffer.from(await audioRes.arrayBuffer());
  console.log('Audio downloaded:', audioBuf.length, 'bytes');
  
  const whisperForm = new FormData();
  const whisperBlob = new Blob([audioBuf], { type: 'audio/webm' });
  whisperForm.append('file', whisperBlob, 'audio.webm');
  whisperForm.append('model', 'whisper-1');
  whisperForm.append('response_format', 'verbose_json');
  
  const whisperRes = await fetch(whisperUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${forgeApiKey}` },
    body: whisperForm,
  });
  console.log('Whisper status:', whisperRes.status);
  const whisperText = await whisperRes.text();
  console.log('Whisper response:', whisperText.substring(0, 300));
}
