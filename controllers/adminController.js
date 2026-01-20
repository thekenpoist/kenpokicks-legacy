const { User, AdminLog } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../utils/loggerUtil');
const { renderServerError } = require('../utils/errorUtil');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { sendVerificationEmail } = require('../utils/sendVerificationEmailUtil');
const { sendInviteEmail } = require('../utils/sendInviteEmailUtil');
const { changedFieldNames, pick } = require('../utils/diffUtils');



exports.getAdminConsole = async (req, res, next) => {
    const students = await User.count({ where: { role: { [Op.in]: ['student', 'instructor', 'admin', 'superadmin'] } } });
    const instructors = await User.count({ where: { role: { [Op.in]: ['instructor', 'admin', 'superadmin'] } } });
    const admins = await User.count({ where: { role : { [Op.in]: ['admin', 'superadmin'] } } });

    
    res.render('admin/admin', {
        pageTitle: `Admin Console`,
        currentPage: 'admin',
        layout: 'layouts/admin-layout',
        errorMessage: null,
        stats: { studentCount: students, instructorCount: instructors, adminCount: admins }
    });
};

exports.getOneUser = async (req, res, next) => {
    try {
        const oneUser = await User.scope('forAdminShow').findByPk(req.params.uuid);

        if (!oneUser) {
            return res.status(404).render('404', {
                pageTitle: 'User not found',
                layout: 'layouts/admin-layout',
                currentPage: 'users'
            });
        }

        if (oneUser.role === 'superadmin' && res.locals.currentUser.role !== 'superadmin') {
            req.flash('error', 'This user profile is restricted');
            return res.redirect('/admin/all');
        }

        res.render('admin/users/show-user', {
            pageTitle: 'View User',
            currentPage: 'users',
            errorMessage: null,
            user: oneUser
        });
    } catch (err) {
        logger.error(`Error fetching user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'users');
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await User.findAll();
        const usersPlain = allUsers.map(u => u.get({ plain: true }));

        if (allUsers.length === 0) {
            return res.status(404).render('404', {
                pageTitle: 'No users found',
                currentPage: 'admin'
            });
        }

        res.render('admin/all-users', {
            pageTitle: 'All users',
            currentPage: 'users',
            layout: 'layouts/admin-layout',
            allUsers: usersPlain,
            messages: res.locals.messages
        });
    } catch (err) {
        logger.error(`Error fetching all users: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack)
        }
        return renderServerError(res, err, 'portal/dashboard');
    }
};

exports.getEditUser = async (req, res, next) => {
    const userUuid = req.params.uuid;

    try {
        const userProfile = await User.findByPk(userUuid, {
            attributes: ['uuid', 'username', 'firstName', 'lastName', 'email', 'style', 'rank', 'rankDetails', 'timezone', 'fullName', 'role']
        });

        if (!userProfile) {
            return res.status(404).render('404', {
                pageTitle: 'User profile not found',
                layout: 'layouts/admin-layout',
                currentPage: 'users'
            });
        }

        if (userProfile.role === 'superadmin' && res.locals.currentUser.role !== 'superadmin') {
            req.flash('error', 'This user profile is restricted');
            return res.redirect('/admin/all');
        }

        const isSelfEdit = res.locals.currentUser.uuid === userProfile.uuid;
        const canChangeRole = res.locals.currentUser.role === 'superadmin' && !isSelfEdit;

        const attributes = User.getAttributes();
        const roleAttribute = attributes.role;
        const roles = 
            roleAttribute?.values ??
            roleAttribute?.type?.values ??
            roleAttribute?.type?.options?.values ?? [];

        return res.render('admin/edit-user-profile', {
                pageTitle: "Edit User Profile",
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: null,
                formData: {
                    username: userProfile.username,
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName,
                    email: userProfile.email,
                    confirmEmail: userProfile.email,
                    style: userProfile.style || '',
                    rank: userProfile.rank || '',
                    rankDetails: userProfile.rankDetails || '',
                    role: userProfile.role || '',
                    timezone: userProfile.timezone || ''
                },
                roles,
                canChangeRole,
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${userUuid}/update`
            });
        } catch (err) {
            logger.error(`Error fetching user profile: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
            return renderServerError(res, err, 'users');
    }
};

exports.postEditUser = async (req, res, next) => {
    const admin = res.locals.currentUser;

    if (!admin) {
        return res.redirect('/auth/login');
    }

    const { uuid } = req.params;

    const TRACKED_FIELDS = ['username', 'firstName', 'lastName', 'email', 'confirmEmail',
                            'style', 'rank', 'rankDetails', 'role', 'timezone'
                            ]

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn(`[admin.postEditUser] validation failed for uuid=${uuid}`);
        errors.array().forEach(err => logger.warn(`• ${err.param || 'field'} ${err.msg}`));

        return res.status(422).render('admin/edit-user-profile', {
            pageTitle: 'Edit User Profile',
            currentPage: 'users',
            layout: 'layouts/admin-layout',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body,
            submitLabel: 'Update Profile',
            formMode: 'edit',
            formAction: `/admin/users/${uuid}/update`
        });
    }

    try { 

        const targetUser = await User.findByPk(uuid, {
            attributes: [
                'uuid', 'email', 'username', 'firstName', 'lastName', 'role', 'style',
                'rank', 'rankDetails', 'avatar', 'timezone', 'isVerified', 'verificationToken'
            ]
        });
        if (!targetUser) {
            return res.status(404).render('404', {
                pageTitle: 'User profile not found',
                currentPage: 'users',
                layout: 'layouts/admin-layout'
            });
        }

        let newRole;

        if (targetUser.role === 'superadmin' && admin.role !== 'superadmin') {
            req.flash('error', 'This user profile is restricted');
            return res.redirect('/admin/all');
        }

        const isSelfEdit = admin.uuid === targetUser.uuid;
        const canChangeRole = admin.role === 'superadmin' && !isSelfEdit;

        const before = pick(targetUser.get({ plain: true }), TRACKED_FIELDS);

        const {
            email = '',
            confirmEmail = '',
            firstName = '',
            lastName = '',
            username = '',
            rank = '',
            rankDetails = '',
            style = '',
            role = '',
            timezone = ''
        } = req.body;

        const normalizedInput = {
            email: email.trim().toLowerCase(),
            confirmEmail: confirmEmail.trim().toLowerCase(),
            username: username.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            rank: rank.trim(),
            rankDetails: rankDetails.trim(),
            style: style.trim(),
            role: role.trim(),
            timezone: timezone.trim()
        };

        if (!normalizedInput.email || normalizedInput.email !== normalizedInput.confirmEmail) {
            return res.status(422).render('admin/edit-user-profile', {
                pageTitle: 'Edit User Profile',
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: 'Emails must match',
                formData: {
                    username: normalizedInput.username,
                    firstName: normalizedInput.firstName,
                    lastName: normalizedInput.lastName,
                    email: normalizedInput.email,
                    confirmEmail: normalizedInput.confirmEmail,
                    style: normalizedInput.style,
                    rank: normalizedInput.rank,
                    rankDetails: normalizedInput.rankDetails,
                    role: normalizedInput.role,
                    timezone: normalizedInput.timezone
                },
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${uuid}/update`
        });
        }

        const requestedRole = role;
        if (requestedRole && requestedRole !== targetUser.role) {
            if (canChangeRole) {
                newRole = requestedRole;
            } else {
                req.flash('error', 'You are not authorized to change roles');
                return res.redirect(`/admin/users/${uuid}/edit`);
            }
        }

        const conflict = await User.findOne({
            where: {
                [Op.and]: [
                    { uuid: { [Op.ne]: uuid } },
                    { [Op.or]: [{ email: normalizedInput.email }, { username: normalizedInput.username }] },
                ]
            },
            attributes: ['uuid', 'email', 'username']
        }); 

        if (conflict) {
            const errorMsg = 
                conflict.email === normalizedInput.email
                    ? 'Email is already registered'
                    : 'Username is already taken';

            return res.status(400).render('admin/edit-user-profile', {
                pageTitle: 'Edit User Profile',
                currentPage: 'users',
                layout: 'layouts/admin-layout',
                errorMessage: errorMsg,
                formData: {
                    username: normalizedInput.username,
                    firstName: normalizedInput.firstName,
                    lastName: normalizedInput.lastName,
                    email: normalizedInput.email,
                    confirmEmail: normalizedInput.confirmEmail,
                    style: normalizedInput.style,
                    rank: normalizedInput.rank,
                    rankDetails: normalizedInput.rankDetails,
                    role: normalizedInput.role,
                    timezone: normalizedInput.timezone
                },
                submitLabel: 'Update Profile',
                formMode: 'edit',
                formAction: `/admin/users/${uuid}/update`
            });
        }

        const emailChanged = normalizedInput.email !== targetUser.email.toLowerCase();
        const updatedFields = {
            username: normalizedInput.username || targetUser.username,
            email: targetUser.email,
            firstName: normalizedInput.firstName || targetUser.firstName,
            lastName: normalizedInput.lastName || targetUser.lastName,
            style: normalizedInput.style || targetUser.style,
            rank: normalizedInput.rank || targetUser.rank,
            rankDetails: normalizedInput.rankDetails || targetUser.rankDetails,
            role: newRole || targetUser.role,
            avatar: req.avatarPath || targetUser.avatar,
            timezone: normalizedInput.timezone || targetUser.timezone
        };

        // Handle email update and re-verification
        if (emailChanged) {
            const verificationToken = uuidv4();
            updatedFields.email = normalizedInput.email;
            updatedFields.isVerified = false;
            updatedFields.verificationToken = verificationToken;

            try {
                await sendVerificationEmail(normalizedInput.email, verificationToken);
            } catch (mailErr) {
                logger.error(`sendVerificationEmail failed for uuid=${uuid}: ${mailErr.message}`);
            }
        }

        await targetUser.update(updatedFields);

        await targetUser.reload();

        const after = pick(targetUser.get({ plain: true}), TRACKED_FIELDS);
        const fieldsChanged = changedFieldNames(before, after, TRACKED_FIELDS);
        const names = Array.isArray(fieldsChanged) ? fieldsChanged : Object.keys(fieldsChanged);
        const summary = names.length ? `Summary of changed fields: ${names.join(', ')}` : 'No field changes detected';

        await AdminLog.create({
            actor: admin.username,
            actorUuid: admin.uuid,
            action: 'Edit User',
            entityAffected: 'User',
            entityLabel: targetUser.username,
            summary
        })

        return res.redirect(`/admin/users/${uuid}/show`);

    } catch (err) {
        logger.error(`Error updating user ${uuid}: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        return renderServerError(res, err, 'users');
    }
};

exports.getRecentAdminLogs = async (req, res, next) => {
  try {
    const { fmt } = res.locals;

    const adminLogs = await AdminLog.findAll({
        attributes: ['id', 'action', 'entityLabel', 'actor', 'actionDate'],
        order: [['actionDate', 'DESC']],
        limit: 10
    });

    const esc = (v) =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    if (!adminLogs.length) {
        return res.send(`<div class="p-4 text-sm text-gray-500">No recent admin activity yet.</div>`);
    }

    const rows = adminLogs.map((log) => {
      const dateStr = fmt
        ? fmt(log.actionDate, 'MMM d, yyyy, h:mm a')
        : new Date(log.actionDate).toLocaleString();

    const href = `/logs/${encodeURIComponent(log.id)}`;

    return `
        <a href="${href}" id="log-${esc(log.id)}"
            class="block grid grid-cols-4 gap-3 text-sm text-gray-800 border-b border-gray-100 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">
            <div class="whitespace-nowrap">${esc(dateStr)}</div>
            <div class="whitespace-nowrap">${esc(log.action)}</div>
            <div class="whitespace-nowrap">${esc(log.entityLabel)}</div>
            <div class="whitespace-nowrap">${esc(log.actor)}</div>
        </a>`;
        }).join('');

    res.send(rows);
  } catch (err) {
    logger.error(`Error fetching recent admin log: ${err.message}`);
    if (err.stack) logger.error(err.stack);
    res.status(500).send('<div class="p-4 text-sm text-red-600">Failed to fetch recent admin logs.</div>');
  }
};

exports.getAllAdminLogs = async (req, res, next) => {
    try {
        const allAdminLogs = await AdminLog.findAll({
            attributes: ['id', 'action', 'entityLabel', 'actor', 'actionDate'],
            order: [['actionDate', 'DESC']],
        });
        
        res.render('admin/admin-logs/all-admin-logs', {
            pageTitle: 'View admin logs',
            currentPage: 'logs',
            errorMessage: null,
            allAdminLogs
        });
    } catch (err) {
        logger.error(`Error fetching admin logs: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }

        return renderServerError(res, err, 'admin');
    }
};

exports.getInviteUser = (req, res, next) => {
    res.render('admin/invite', {
        pageTitle: 'Invite User',
        currentPage: 'invite',
        errorMessage: null,
        formData: {},
        submitLabel: 'Send Invitation',
        formAction: '/admin/invite',
        formMode: 'invite'
    });
};

exports.postInviteUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/invite', {
            pageTitle: 'Invite User',
            currentPage: 'invite',
            errorMessage: errors.array().map(e => e.msg).join(', '),
            formData: req.body
        });
    }



    
}