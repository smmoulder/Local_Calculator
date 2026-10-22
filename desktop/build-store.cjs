const {build, Platform, Arch} = require('electron-builder');
const identity = require('./store-identity.json');
process.env.STORE_IDENTITY_NAME ||= identity.identityName;
process.env.STORE_PUBLISHER ||= identity.publisher;
process.env.STORE_PUBLISHER_DISPLAY_NAME ||= identity.publisherDisplayName;
const required = ['STORE_IDENTITY_NAME', 'STORE_PUBLISHER', 'STORE_PUBLISHER_DISPLAY_NAME'];
const missing = required.filter(key => !process.env[key]?.trim());
if (missing.length) { console.error('Partner Center identity required: ' + missing.join(', ')); process.exit(1); }
if (process.env.STORE_IDENTITY_NAME === 'SMMOULDERPRODUCTIONS.TelemetryforChatGPT') {
  console.error('Use the calculator product identity from Partner Center; Telemetry has a separate listing.');
  process.exit(1);
}
build({targets: Platform.WINDOWS.createTarget(['appx'], Arch.x64),
  ...(process.env.STORE_PREPACKAGED ? {prepackaged: require('node:path').resolve(process.env.STORE_PREPACKAGED)} : {}),
  config: {
  appx: {
    identityName: process.env.STORE_IDENTITY_NAME,
    publisher: process.env.STORE_PUBLISHER,
    publisherDisplayName: process.env.STORE_PUBLISHER_DISPLAY_NAME,
    displayName: identity.displayName, applicationId: 'LocalModelCalculator',
    artifactName: 'Local-Model-Calculator-${version}-${arch}.appx',
    languages: ['en-US'], minVersion: '10.0.19041.0'
  }
}}).catch(error => { console.error(error); process.exitCode = 1; });
