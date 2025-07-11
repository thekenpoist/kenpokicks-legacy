const path = require('path');
const fs = require('fs');
const logger = require('../utils/loggerUtil');

exports.getSection = async (req, res) => {
    const { beltColor, section } = req.params;
    const filePath = path.join(__dirname, '..', 'data', 'curriculum', beltColor, `${beltColor}_${section}.json`);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.render(`training/${section}-template`, {
            beltColor,
            content: data
        });
    } catch (err) {
        logger.error(`Error updating user: ${err.message}`);
        if (err.stack) {
            logger.error(err.stack);
        }
        res.status(404).render('404', { message: 'Section not found.'});
    }
};