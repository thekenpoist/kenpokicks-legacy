const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const tempDir = 'temp/uploads';
const finalDir = 'public/uploads/avatars';

// If the dir's don't exist then create them
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

// Use multer to config the temp upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `temp-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: {fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedExt = ['.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, allowedExt.includes(ext));
    }
}).single('avatar');

// Upload and conversion
const processAvatar = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Avatar upload failed.');
        }

        if (!req.file) return next();

        try {
            const username = req.body.username?.toLowerCase();
            const safeName = username.replace(/[^a-zA-Z0-9_-]/g, '');
            const finalPath = path.join(finalDir, `${safeName}.jpg`);

            // Convert size with sharp
            await sharp(req.file.path)
                .resize(256, 256)
                .jpeg({ quality: 80 })
                .toFile(finalPath);

            // Remove temp file
            fs.unlinkSync(req.file.path);

            // Set path to avatar for controller
            req.avatarPath = `/uploads/avatars/${safename}.jpg`;

            next();
        } catch (err) {
            logger.error(`Avatar processing error: ${err.message}`);
            if (err.stack) {
                logger.error(err.stack);
            }
            res.status(500).send('Error processing avatar');
        }
    });
};


module.exports = processAvatar;