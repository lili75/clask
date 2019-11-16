'use strict';

/**
 * Module dependencies.
 */
import { debug, delUser } from './helpers';
import { USERS } from './events';

/**
 * Actions when socket disconnects.
 *
 * @param {Object} socket - The socket.
 */
function disconnect(socket) {
    const { userId } = socket;

    socket.on('disconnect', () => {
        // broadcast to other clients that user has disconnected
        socket.broadcast.emit(USERS, {
            [userId]: {
                isConnected: false
            }
        });
        delUser(userId);

        // remove all socket event listeners
        Object.keys(socket._events).forEach((eventName) => {
            socket.removeAllListeners(eventName);
        });

        debug('client disconnected', socket.request.session);
    });
}

export default disconnect;
