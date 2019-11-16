'use strict';

/**
 * Module dependencies.
 */
import { debug } from '../db/helpers';
import { setUser, USER_KEY_ROOM } from './helpers';

// models
import { findByIdAndUpdate } from '../models/user';

// constants
import { UPDATE_USER } from './events';

/**
 * Event listeners for user.
 *
 * @param {Object} io     - The io.
 * @param {Object} socket - The socket.
 */
function user(io, socket) {
    /**
     * Update user.
     */
    socket.on(UPDATE_USER, (userId, data = {}) => {
        if (!userId || !data || data.constructor !== Object) return;

        // change active room
        const activeRoomId = data['rooms.active'];
        if (activeRoomId) {
            socket.join(activeRoomId);
            setUser(userId, {
                [USER_KEY_ROOM]: activeRoomId
            });
        }

        // update user
        findByIdAndUpdate(userId, { $set: data }, (err) => {
            if (err) debug('failed to update user', err);
        });
    });
}

export default user;
