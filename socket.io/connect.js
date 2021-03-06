'use strict';

/**
 * Module dependencies.
 */
import { debug } from '../db/helpers';

// models
import { find } from '../models/room';
import { findById, find as _find } from '../models/user';

// helpers
import { docsToObj, getUsers, setUser, USER_KEY_SOCKET, USER_KEY_ROOM } from './helpers';
const usersRef = getUsers();

// constants
import { ROOMS, USER, USERS } from './events';

const userProjection = {
    name: 1,
    rooms: 1,
    username: 1
};
const roomsProjection = { _users: 1, name: 1 };
const emptyQuery = {};
const usersProjection = { username: 1 };

/**
 * Initial actions when client connects.
 *
 * @param {Object} io     - The io.
 * @param {Object} socket - The socket.
 */
function connect(io, socket) {
    const { userId } = socket;
    setUser(userId, {
        [USER_KEY_SOCKET]: socket.id
    });

    // broadcast to other clients that user has connected
    socket.broadcast.emit(USERS, {
        [userId]: {
            username: socket.username,
            isConnected: true
        }
    });

    /**
     * Find user.
     */
    findById(userId, userProjection, (err, user) => {
        if (err) return debug('unable to find user', err);

        // user not found
        if (!user) return socket.emit(USER, { isAuthenticated: false });

        // send client user data
        socket.emit(USER, Object.assign(user.toObject(), {
            isAuthenticated: true
        }));

        /**
         * Join room.
         */
        const userRooms = user.rooms;
        const activeRoomId = userRooms.active;
        const sidebarRooms = userRooms.sidebar;
        socket.join(activeRoomId);
        setUser(userId, {
            [USER_KEY_ROOM]: activeRoomId
        });

        /**
         * Find rooms (shown in sidebar).
         */
        find({
            _id: {
                $in: sidebarRooms.channels.concat(
                    sidebarRooms.directMessages
                )
            }
        }, roomsProjection, (err, rooms) => {
            if (err || !rooms) return debug('unable to find rooms', err);

            // send client sidebar rooms data
            socket.emit(ROOMS, docsToObj(rooms));
        });
    });

    /**
     * Find all users.
     */
    _find(emptyQuery, usersProjection, (err, users) => {
        if (err || !users) return debug('no users found', err);

        // mark connected user
        let usersData = docsToObj(users);
        Object.keys(usersRef).forEach((userId) => {
            usersData[userId].isConnected = true;
        });

        // send client data of all users
        socket.emit(USERS, usersData);
    });
}

export default connect;
