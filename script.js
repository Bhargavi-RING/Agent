// let localStream;
// let peerConnection;
// let socket;
// let roomId = 'default-room';

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// socket = io();

async function startCall() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;

        // peerConnection = new RTCPeerConnection(configuration);

        // localStream.getTracks().forEach(track => {
        //     peerConnection.addTrack(track, localStream);
        // });

        // peerConnection.ontrack = event => {
        //     if (event.streams && event.streams[0]) {
        //         document.getElementById('remoteVideo').srcObject = event.streams[0];
        //     }
        // };

        // peerConnection.onicecandidate = event => {
        //     if (event.candidate) {
        //         socket.emit('ice-candidate', event.candidate, roomId);
        //     }
        // };

        // socket.emit('join-room', roomId);
    } catch (error) {
        console.error('Error starting call:', error);
    }
}

function endCall() {
    // if (peerConnection) {
    //     peerConnection.close();
    // }
    // if (localStream) {
    //     localStream.getTracks().forEach(track => track.stop());
    // }
    document.getElementById('localVideo').srcObject = null;
    document.getElementById('remoteVideo').srcObject = null;
}

// socket.on('user-connected', async () => {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     socket.emit('offer', offer, roomId);
// });

// socket.on('offer', async (offer) => {
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     socket.emit('answer', answer, roomId);
// });

// socket.on('answer', async (answer) => {
//     await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
// });

// socket.on('ice-candidate', async (candidate) => {
//     try {
//         await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//     } catch (error) {
//         console.error('Error adding ICE candidate:', error);
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startCall').addEventListener('click', startCall);
    document.getElementById('endCall').addEventListener('click', endCall);
});
