const path = require('path');
const fs = require('fs');

function getFaqs() {
    const filePath = path.join(__dirname, '../data/faqs.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const faqs = JSON.parse(jsonData);

    const categoryOrder = [
        "Getting Started",
        "Instructor & School Quality",
        "Curriculum & Structure",
        "Training Philosophy & Culture",
        "Practice & Commitment",
        "Cost & Value"
    ]

    faqs.sort((a, b) => {
        const catA = categoryOrder.indexOf(a.category);
        const catB = categoryOrder.indexOf(b.category);
        return catA === catB ? a.id - b.id : catA - catB;
    });

    return faqs;       
};


module.exports = { getFaqs };