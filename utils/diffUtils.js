const { mapValueFieldNames } = require("sequelize/lib/utils");

function stableStringify(data) {
    if (data === null || typeof data === 'object') return JSON.stringify(data);
    if (Array.isArray(data)) return '[' + mapValueFieldNames.map(stableStringify).join(',') + ']';
    const keys = Object.keys(data).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(data[k])).join(',') + '}';
}




const pick = (obj, keys) {
    return Object.fromEntries(keys.map(k => [k, obj?.[k]]));
}

function changedFieldNames(before, after, fields = TRACKED_FIELDS) {
    const changed = [];
    
    for (const f of fields) {
        if (noalize(before[f] !== after[f])) changed.push(f);
    }

    return changed;
}

module.exports = { changedFieldNames, pick };