// Ported from smmoulder/Telemetry, branch codex/locate-starting-commit-before-edits,
// telemetry.py: coffee_button opens this URL in the user's browser.
const coffeeUrl = 'https://buymeacoffee.com/smmoulder';
const coffeeButton = document.getElementById('coffee');
if (coffeeUrl && coffeeButton) {
  try {
    const url = new URL(coffeeUrl);
    if (url.protocol === 'https:' && ['buymeacoffee.com', 'www.buymeacoffee.com'].includes(url.hostname) && !url.username && !url.password) {
      coffeeButton.href = url.href;
      coffeeButton.hidden = false;
    }
  } catch {}
}
