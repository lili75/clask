'use strict';

/**
 * Module dependencies.
 */
import { debug } from '../../db/helpers';
const router = require('express').Router();
import { defaultRoom } from '../../config/constants';

// models
import { findByIdAndUpdate } from '../../models/room';
import User, { find } from '../../models/user';

/**
 * GET: /api/users
 */
router.get('/', (req, res, next) => {
    const { _id, email, username } = req.query;
    const query = {};
    if (_id) query._id = _id;
    else if (email) query.email = email;
    else if (username) query.username = username;

    find(query, {
        name: 1,
        username: 1,
    }, (error, user) => {
        if (error) {
            debug('error find user', error)
            return res.status(500).json({});
        }
        res.json(user);
    });
});

/**
 * POST: /api/users
 */
router.post('/', (req, res, next) => {
    // try to save user
    new User(req.body).save((err, user) => {
        if (err) {
            // duplicate key error
            if (err.code === 11000) {

                // duplicate email
                if (/email/.test(err.errmsg)) {
                    return res.json({
                        success: false,
                        error: {
                            field: 'email',
                            text: 'Email already exists.'
                        }
                    });

                // duplicate username
                } else if (/username/.test(err.errmsg)) {
                    return res.json({
                        success: false,
                        error: {
                            field: 'username',
                            text: 'Username is taken.'
                        }
                    });
                }
            }

            // other error
            debug('error save user', err);
            return res.status(500).json({});
        }

        // add user to default room
        findByIdAndUpdate(defaultRoom, {
            $push: {
                _users: user._id
            }
        }, (err) => {
            if (err) debug(`unable to update room ${defaultRoom}`, err);
        });

        // user successfully saved
        res.json({
            success: true,
            message: 'Account created!'
        });
    });
});

/**
 * Export router.
 */
export default router;
