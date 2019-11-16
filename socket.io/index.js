'use strict';

/**
 * Module dependencies.
 */
import { debug } from './helpers';
import socket from 'socket.io';
import session from '../middleware/session';

// socket events
import { USER } from './events';
import connect from './connect';
import disconnect from './disconnect';
import messages from './messages';
import rooms from './rooms';
import user from './user';

/**
 * Socket.IO server middleware.
 *
 * @param {Object} server - The server.
 */
function io(server) {
    const io = socket(server);

    // use session middleware
    io.use((socket, next) => {
        session(socket.request, socket.request.res, next);
    });

    // client connected
    io.on('connection', (socket) => {
        const { request } = socket;
        debug('client connected', request.session);

        // force client to disconnect if unauthenticated
        if (!request.session.isAuthenticated) {
            return socket.emit(USER, {
                isAuthenticated: false
            });
        }

        // save user id on socket
        socket.userId = request.session._id;
        socket.username = request.session.username;

        // perform initial actions on connect
        connect(io, socket);

        // set up event listeners for user
        user(io, socket);

        // set up event listeners for messages
        messages(io, socket);

        // set up event listeners for rooms
        rooms(io, socket);

        // handle disconnect event
        disconnect(socket);
    });
}

export default io;
