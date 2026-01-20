const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInviteEmail(email) {
    try {
        const data = await resend.emails.send({
            from: 'amts@kenpokicks.com',
            to: email,
            subject: "Your AMTS invite is here!",
            html:`
                <p>You're invited to join American Martial Training Systems</p>
                <p>Click on the link below to create your account:</p>
                <p><a href="http://localhost:3000/auth/signup">Create Account</a></p>`
        });
    }catch (error) {
        throw error;
    }
}

module.exports = { sendInviteEmail };


// for future deployment, replace localhost with this:
// <p><a href="https://goaltracker.thekenpoist.net/verify-email?token=${token}">Verify Email</a></p>
// or possibly create a kenpokicks.com email token