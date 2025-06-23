const { User } = require('../models');

async function generateUniqueUsername(email) {
    let username;
    let exists = true

    while (exists) { 
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        username = `${baseUsername}${randomSuffix}`;

        const existing = await User.findOne({ where: { username }});
        exists = !!existing;
    }

    return username;
}

module.exports = { generateUniqueUsername };