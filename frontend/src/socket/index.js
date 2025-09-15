import { io } from 'socket.io-client';

export const socketInit = () => {
    const option = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    
    return io('http://localhost:5500', option);
};
