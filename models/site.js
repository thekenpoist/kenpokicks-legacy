const path = require('path');
const fs = require('fs');

exports.getFaqs = () => {
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

        if (catA === catB) {
            return a.id - b.id;
        }

        return catA - catB;
    });

    return faqs;       
};