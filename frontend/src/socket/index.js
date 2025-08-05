import { io } from 'socket.io-client';

export const socketInit = () => {
    const option = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    
    const isProduction = process.env.NODE_ENV === 'production';

    const backendURL = isProduction
        ? 'https://coderhouse-psi.vercel.app'
        : 'http://localhost:5000';  // or whatever your local server port is

    return io(backendURL, option);
    // return io('https://coderhouse-psi.vercel.app', option);
}