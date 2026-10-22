const allowedHosts = new Set(['huggingface.co', 'github.com', 'arxiv.org', 'www.nvidia.com', 'www.amd.com', 'ollama.com', 'www.buymeacoffee.com', 'buymeacoffee.com']);
function externalUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && allowedHosts.has(url.hostname) ? url.href : null;
  } catch { return null; }
}
module.exports = {externalUrl};
