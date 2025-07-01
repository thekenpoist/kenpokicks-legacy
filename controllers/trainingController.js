const path = require('path');
const fs = require('fs');
const { Belt } = require('../models');
const logger = require('../utils/loggerUtil');

exports.getSection = async (req, res) => {
    const belts = [
      { name: 'Yellow Belt', slug: 'yellow' },
      { name: 'Orange Belt', slug: 'orange' },
      { name: 'Purple Belt', slug: 'purple' },
      { name: 'Blue Belt', slug: 'blue' },
      { name: 'Green Belt', slug: 'green' },
      { name: 'Brown Belt', slug: 'brown' },
      { name: 'Red Belt', slug: 'red' },
      { name: 'Black/Red Belt', slug: 'blackred' },
      { name: 'Black Belt', slug: 'black' }
    ]

    const { beltColor, section } = req.params;
    const filePath = path.join(__dirname, '..', 'data', 'curriculum', beltColor, `${section}.json`);

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.render(`training/${section}-template`, {
            belts,
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