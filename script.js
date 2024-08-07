
let localStream;
let peerConnection;
let socket;
let roomId = 'default-room';

let combinedMediaRecorder;
let recordedChunks = [];

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' },
                
    {urls: 'turn:vcip-poc.test.paywithring.com:80',
      username: 'VcipPOC',
      credential: 'TrY123'
    }]
};

socket = io('https://vcip-poc.test.paywithring.com');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');


async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;

        peerConnection = new RTCPeerConnection(configuration);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = event => {
            if (event.streams && event.streams[0]) {
               document.getElementById('remoteVideo').srcObject = event.streams[0];
                startCombinedRecording();
            }
        };

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate, roomId);
            }
        };

        socket.emit('join-room', roomId);
    } catch (error) {
        console.error('Error starting call:', error);
    }
}
function startCombinedRecording() {
    // localVideo=document.getElementById('localVideo')
    canvas.width = localVideo.videoWidth * 2;
    canvas.height = localVideo.videoHeight;

    combinedMediaRecorder = new MediaRecorder(canvas.captureStream(), { mimeType: 'video/webm; codecs=vp9' });

    combinedMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    combinedMediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    combinedMediaRecorder.start();
    console.log('Combined recording started');

    requestAnimationFrame(drawVideosToCanvas);
}

function drawVideosToCanvas() {
     // localVideo=document.getElementById('localVideo')
     // remoteVideo=document.getElementById('remoteVideo')
    if (localVideo.readyState >= 2 && remoteVideo.readyState >= 2) {
        context.drawImage(localVideo, 0, 0, canvas.width / 2, canvas.height);
        context.drawImage(remoteVideo, canvas.width / 2, 0, canvas.width / 2, canvas.height);
    }
    requestAnimationFrame(drawVideosToCanvas);
}

async function capture_pan(flag) {
    const canvas = document.createElement('canvas');
    const video = document.getElementById('remoteVideo');
    if (video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        let endpoint="";
        if (flag==="pan"){
            endpoint="process_pan";
        }
        if(flag==="selfie"){
            endpoint="face_match";
        }

        canvas.toBlob(async (blob) => {

            if (!blob) {
                console.error('Failed to create blob from canvas.');
                return;
            }

            const formData = new FormData();
            formData.append('image', blob, 'image.jpg');
        
            
            try {
                const response = await fetch(`https://vpn.paywithring.com/${endpoint}`, {
                    method: 'POST',
                    body: formData,
                    mode:'cors'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('API Response:', result);
                displayResult(result);
            } catch (error) {
                console.error('Error sending image to API:', error);
            }
        }, 'image/jpeg');
    } else {
        console.warn('Remote video element not found. Cannot capture selfie.');
    }
}

function endCall() {
    
    if (combinedMediaRecorder && combinedMediaRecorder.state !== 'inactive') {
            combinedMediaRecorder.stop();
        }

    if (peerConnection) {
        peerConnection.close();
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
}




socket.on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer, roomId);
});


socket.on('ice-candidate', async (candidate) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const start = document.getElementById('startCall');
    const end = document.getElementById('endCall') ;
    const capture = document.getElementById('capture');
    const selfieCapture=document.getElementById('captureSelfie')
    
    if (start) {
        start.addEventListener('click', startCall);
    } else {
        console.warn('Join call button not found. Call cannot be joined manually.');
    }
    
    if (end) {
        end.addEventListener('click', endCall);
    } else {
        console.warn('End call button not found. Call cannot be ended manually.');
    }
    
    if (capture) {
        capture.addEventListener('click', () => capture_pan("pan"));
    } else {
        console.warn('Capture selfie button not found. Selfie cannot be captured manually.');
    }

    if (selfieCapture) {
        selfieCapture.addEventListener('click', () => capture_pan("selfie"));
    } else {
        console.warn('End call button not found. Call cannot be ended manually.');
    }
    
});
