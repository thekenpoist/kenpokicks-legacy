const path = require('path');
const fs = require('fs');

exports.getFaqs = () => {
    const filePath = path.join(__dirname, '../data/faqs.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const faqs = JSON.parse(jsonData);

    faqs.sort((a,b) => {
        if (a.category === b.category) {
            return a.id - b.id;
        }
        return a.category.localeCompare(b.category);
    });

    return faqs;       
};