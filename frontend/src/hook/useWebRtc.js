import { useEffect, useState, useRef, useCallback,  } from 'react';
import { ACTIONS } from '../action';
import {socketInit} from '../socket';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';

export const useWebRtc = (roomId, user) => {
    const [clients, setClients] = useStateWithCallback([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const socket = useRef(null);
    const localMediaStream = useRef(null);
    const clientsRef = useRef(null);

    const addNewClient = useCallback(
        (newClient, cb) => {
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            }
        },
        [clients, setClients]
    );


    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);

    useEffect(() => {
        const initChat = async () => {
            socket.current = socketInit();
            if (!socket.current) {
                console.error("Socket initialization failed.");
                return;
            }
            try {
                await captureMedia(); // Wait until media is captured
                if (!localMediaStream.current) return; // Ensure it's available
    
                addNewClient({ ...user, muted: true }, () => {
                    const localElement = audioElements.current[user.id];
                    if (localElement) {
                        localElement.volume = 0;
                        localElement.srcObject = localMediaStream.current;
                    }
                });
            } catch (error) {
                console.error("Error capturing media:", error);
                return;
            }
            socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
                handleSetMute(isMute, userId);
            });

            socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
            socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
            socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
            socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
            socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
                handleSetMute(true, userId);
            });
            socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
                handleSetMute(false, userId);
            });
            socket.current.emit(ACTIONS.JOIN, {
                roomId,
                user,
            });

            async function captureMedia() {
                // Start capturing local audio stream.
                try {
                    localMediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (error) {
                    console.error("Media capture failed:", error);
                    localMediaStream.current = null; // Explicitly set to null on failure
                }
            };
            async function handleNewPeer({
                peerId,
                createOffer,
                user: remoteUser,
            }) {
                if (peerId in connections.current) {
                    return console.warn(
                        `You are already connected with ${peerId} (${user.name})`
                    );
                };

                // Store it to connections
                connections.current[peerId] = new RTCPeerConnection({
                    iceServers: freeice(),
                });

                // Handle new ice candidate on this peer connection
                connections.current[peerId].onicecandidate = (event) => {
                    socket.current.emit(ACTIONS.RELAY_ICE, {
                        peerId,
                        icecandidate: event.candidate,
                    });
                };

                // Handle on track event on this connection
                connections.current[peerId].ontrack = ({
                    streams: [remoteStream],
                }) => {
                    addNewClient({ ...remoteUser, muted: true }, () => {
                        // get current users mute info
                        const currentUser = clientsRef.current.find(
                            (client) => client.id === user.id
                        );
                        if (currentUser) {
                            socket.current.emit(ACTIONS.MUTE_INFO, {
                                userId: user.id,
                                roomId,
                                isMute: currentUser.muted,
                            });
                        }
                        if (audioElements.current[remoteUser.id]) {
                            audioElements.current[remoteUser.id].srcObject =
                                remoteStream;
                        } else {
                            let settled = false;
                            const interval = setInterval(() => {
                                if (audioElements.current[remoteUser.id]) {
                                    audioElements.current[
                                        remoteUser.id
                                    ].srcObject = remoteStream;
                                    settled = true;
                                }

                                if (settled) {
                                    clearInterval(interval);
                                }
                            }, 300);
                        }
                    });
                };

                // Add connection to peer connections track
                localMediaStream.current.getTracks().forEach((track) => {
                    connections.current[peerId].addTrack(
                        track,
                        localMediaStream.current
                    );
                });

                // Create an offer if required
                if (createOffer) {
                    const offer = await connections.current[
                        peerId
                    ].createOffer();

                    // Set as local description
                    await connections.current[peerId].setLocalDescription(
                        offer
                    );

                    // send offer to the server
                    socket.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: offer,
                    });
                }
            }
            async function handleRemovePeer({ peerId, userId }) {
                // Correction: peerID to peerId
                if (connections.current[peerId]) {
                    connections.current[peerId].close();
                }

                delete connections.current[peerId];
                delete audioElements.current[peerId];
                setClients((list) => list.filter((c) => c.id !== userId));
            }
            // async function handleIceCandidate({ peerId, icecandidate }) {
            //     if (icecandidate) {
            //         connections.current[peerId].addIceCandidate(icecandidate);
            //     }
            // }


            async function setRemoteMedia({ peerId, sessionDescription: remoteSessionDescription }) {
                const connection = connections.current[peerId];
            
                if (!connection) {
                    console.error(`Connection not found for peerId: ${peerId}`);
                    return;
                }
            
                // Prevent setting remote description when state is already "stable"
                if (connection.signalingState === "stable" && remoteSessionDescription.type === "answer") {
                    console.warn(`Ignoring remote answer SDP because state is already stable.`);
                    return;
                }
            
                try {
                    await connection.setRemoteDescription(new RTCSessionDescription(remoteSessionDescription));
            
                    // If received session is an offer, create and send an answer
                    if (remoteSessionDescription.type === 'offer') {
                        const answer = await connection.createAnswer();
                        await connection.setLocalDescription(answer);
            
                        socket.current.emit(ACTIONS.RELAY_SDP, {
                            peerId,
                            sessionDescription: answer,
                        });
                    }
                } catch (error) {
                    console.error(`Error in setting remote media for peerId: ${peerId}`, error);
                }
            }
            


            async function handleIceCandidate({ peerId, icecandidate }) {
                const connection = connections.current[peerId];
            
                if (!connection) {
                    console.error(`Connection not found for peerId: ${peerId}`);
                    return;
                }
            
                if (!connection.remoteDescription) {
                    console.warn(`Remote description is not set yet for peerId: ${peerId}. Storing candidate.`);
                    if (!connection.iceCandidatesQueue) {
                        connection.iceCandidatesQueue = [];
                    }
                    connection.iceCandidatesQueue.push(icecandidate);
                    return;
                }
            
                try {
                    await connection.addIceCandidate(icecandidate);
                } catch (error) {
                    console.error(`Error adding received ICE candidate for peerId: ${peerId}`, error);
                }
            }
            
           
            
            
            async function handleSetMute(mute, userId) {
                if (!clientsRef.current || !Array.isArray(clientsRef.current)) {
                    console.error("clientsRef.current is not initialized or is not an array");
                    return;
                }
            
                const clientIdx = clientsRef.current
                    .map((client) => client.id)
                    .indexOf(userId);
            
                if (clientIdx > -1) {
                    const allConnectedClients = [...clientsRef.current]; // Create a new array
                    allConnectedClients[clientIdx] = {
                        ...allConnectedClients[clientIdx],
                        muted: mute,
                    };
                    setClients(allConnectedClients);
                }
            }
            
        };

        initChat();
        return () => {
            if (localMediaStream.current) {
                localMediaStream.current.getTracks().forEach(track => track.stop());
            }
        
            if (socket.current) {
                socket.current.emit(ACTIONS.LEAVE, { roomId });
        
                socket.current.off(ACTIONS.ADD_PEER);
                socket.current.off(ACTIONS.REMOVE_PEER);
                socket.current.off(ACTIONS.ICE_CANDIDATE);
                socket.current.off(ACTIONS.SESSION_DESCRIPTION);
                socket.current.off(ACTIONS.MUTE);
                socket.current.off(ACTIONS.UNMUTE);
            }
        
            if (connections.current) {
                Object.keys(connections.current).forEach(peerId => {
                    if (connections.current[peerId]) {
                        connections.current[peerId].close();
                        delete connections.current[peerId];
                    }
                });
            }
        
            if (audioElements.current) {
                Object.keys(audioElements.current).forEach(peerId => {
                    delete audioElements.current[peerId];
                });
            }
        };
        
    }, []);

    const provideRef = (instance, userId) => {
        if (!audioElements.current[userId]) {
            audioElements.current[userId] = instance;
        }
    };

    const handleMute = (isMute, userId) => {
        let settled = false;

        if (userId === user.id) {
            let interval = setInterval(() => {
                if (localMediaStream.current) {
                    localMediaStream.current.getTracks()[0].enabled = !isMute;
                    if (isMute) {
                        socket.current.emit(ACTIONS.MUTE, {
                            roomId,
                            userId: user.id,
                        });
                    } else {
                        socket.current.emit(ACTIONS.UNMUTE, {
                            roomId,
                            userId: user.id,
                        });
                    }
                    settled = true;
                }
                if (settled) {
                    clearInterval(interval);
                }
            }, 200);
        }
    };

    return {
        clients,
        provideRef,
        handleMute,
    };
};




// import { useEffect, useState, useRef, useCallback } from 'react';
// import { ACTIONS } from '../action';
// import {socketInit} from '../socket';
// import freeice from 'freeice';

// export const useWebRtc = (roomId, user) => {
//     const [clients, setClients] = useState([]);
//     const audioElements = useRef({});
//     const connections = useRef({});
//     const socket = useRef(null);
//     const localMediaStream = useRef(null);
//     const clientsRef = useRef([]);

//     useEffect(() => {
//         socket.current = socketInit();
//     }, []);

//     const addNewClient = useCallback((newClient, cb) => {
//         setClients((existingClients) => {
//             if (!existingClients.some(client => client.id === newClient.id)) {
//                 return [...existingClients, newClient];
//             }
//             return existingClients;
//         }, cb);
//     }, []);

//     useEffect(() => {
//         clientsRef.current = clients;
//     }, [clients]);

//     useEffect(() => {
//         const startCapture = async () => {
//             try {
//                 localMediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
//                 addNewClient({ ...user, muted: true }, () => {
//                     const localElement = audioElements.current[user.id];
//                     if (localElement) {
//                         localElement.volume = 0;
//                         localElement.srcObject = localMediaStream.current;
//                     }
//                 });
//                 socket.current.emit(ACTIONS.JOIN, { roomId, user });
//             } catch (error) {
//                 console.error("Error accessing media devices:", error);
//             }
//         };
        
//         startCapture();

//         return () => {
//             localMediaStream.current?.getTracks().forEach(track => track.stop());
//             socket.current.emit(ACTIONS.LEAVE, { roomId });
//         };
//     }, [roomId, user]);

//     useEffect(() => {
//         const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
//             if (connections.current[peerId]) return;

//             const peerConnection = new RTCPeerConnection({ iceServers: freeice() });
//             connections.current[peerId] = peerConnection;

//             peerConnection.onicecandidate = event => {
//                 if (event.candidate) {
//                     socket.current.emit(ACTIONS.RELAY_ICE, { peerId, icecandidate: event.candidate });
//                 }
//             };

//             peerConnection.ontrack = ({ streams: [remoteStream] }) => {
//                 addNewClient({ ...remoteUser, muted: true }, () => {
//                     if (audioElements.current[remoteUser.id]) {
//                         audioElements.current[remoteUser.id].srcObject = remoteStream;
//                     }
//                 });
//             };

//             localMediaStream.current?.getTracks().forEach(track => {
//                 peerConnection.addTrack(track, localMediaStream.current);
//             });

//             if (createOffer) {
//                 const offer = await peerConnection.createOffer();
//                 await peerConnection.setLocalDescription(offer);
//                 socket.current.emit(ACTIONS.RELAY_SDP, { peerId, sessionDescription: offer });
//             }
//         };

//         socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
//         return () => socket.current.off(ACTIONS.ADD_PEER);
//     }, []);

//     useEffect(() => {
//         socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
//             if (icecandidate) connections.current[peerId]?.addIceCandidate(icecandidate);
//         });
//         return () => socket.current.off(ACTIONS.ICE_CANDIDATE);
//     }, []);

//     useEffect(() => {
//         const setRemoteMedia = async ({ peerId, sessionDescription }) => {
//             await connections.current[peerId]?.setRemoteDescription(new RTCSessionDescription(sessionDescription));
//             if (sessionDescription.type === 'offer') {
//                 const answer = await connections.current[peerId].createAnswer();
//                 await connections.current[peerId].setLocalDescription(answer);
//                 socket.current.emit(ACTIONS.RELAY_SDP, { peerId, sessionDescription: answer });
//             }
//         };

//         socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
//         return () => socket.current.off(ACTIONS.SESSION_DESCRIPTION);
//     }, []);

//     useEffect(() => {
//         const handleRemovePeer = ({ peerId, userId }) => {
//             if (connections.current[peerId]) {
//                 connections.current[peerId].close();
//                 delete connections.current[peerId];
//                 delete audioElements.current[peerId];
//                 setClients((list) => list.filter(client => client.id !== userId));
//             }
//         };

//         socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
//         return () => socket.current.off(ACTIONS.REMOVE_PEER);
//     }, []);

//     useEffect(() => {
//         const setMute = (mute, userId) => {
//             setClients(clients => clients.map(client => client.id === userId ? { ...client, muted: mute } : client));
//         };

//         socket.current.on(ACTIONS.MUTE, ({ userId }) => setMute(true, userId));
//         socket.current.on(ACTIONS.UNMUTE, ({ userId }) => setMute(false, userId));

//         return () => {
//             socket.current.off(ACTIONS.MUTE);
//             socket.current.off(ACTIONS.UNMUTE);
//         };
//     }, []);

//     const provideRef = (instance, userId) => {
//         audioElements.current[userId] = instance;
//     };

//     const handleMute = (isMute, userId) => {
//         if (userId === user.id) {
//             const tracks = localMediaStream.current?.getTracks();
//             if (tracks && tracks.length > 0) {
//                 tracks[0].enabled = !isMute;
//                 socket.current.emit(isMute ? ACTIONS.MUTE : ACTIONS.UNMUTE, { roomId, userId });
//             }
//         }
//     };
    

//     return { clients, provideRef, handleMute };
// };
