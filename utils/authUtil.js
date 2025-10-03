function assessUserLoginability(user) {

    // Invalid user
    if (!user) {
        return { ok: false, reason: 'NOUSER', message: 'Invalid credentials.' };
    }

    // Brute-force lockout
    if (user.lockoutUntil && Date.now() < +user.lockoutUntil) {
        const minutesLeft = Math.ceil((+user.lockoutUntil - Date.now()) / 60000);
        return {
            ok: false,
            reason: 'LOCKED',
            message: `Account locked. Try again in ${minutesLeft} minute(s).`
        };
    }

    // Soft delete
    if (user.deletedAt) {
        return { 
            ok: false, 
            reason: 'DELETED', 
            message: 'Your account is not available at this time.' 
        };
    }

    // Suspension
    if (user.suspendUntil && Date.now() < +user.suspendUntil) {
        return { 
            ok: false, 
            reason: 'SUSPENDED', 
            message: 'Your account is not available at this time.' 
        };
    }

    // Email not verified
    if (!user.isVerified) {
        return { 
            ok: false, 
            reason: 'UNVERIFIED', 
            message: 'Please verify your email before signing in.' 
        };
    }

        return { ok: true, reason: null, message: '' };
    }

module.exports = { assessUserLoginability };
