'use strict';

/**
 * Module dependencies.
 */
import { debug } from './helpers';
import { defaultRoom } from '../config/constants';
import Room, { findById } from '../models/room';

/**
 * Create default channel (if applicable).
 */
findById(defaultRoom, (err, room) => {
    if (err) return debug(err);
    if (!room) {
        new Room({
            _id: defaultRoom,
            name: defaultRoom,
            isPublic: true
        }).save();
    }
});
