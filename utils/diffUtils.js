function normalize(data) {
    if (data == null) return '';
    if (typeof data === 'string') return data.replace(/\r\n/g, '\n').trim();
    if (typeof data === 'object') return JSON.stringify(data);
    return data;
}


function changedFieldNames(before, after, fields = TRACKED_FIELDS) {
    const changed = [];
    
    for (const f of fields) {
        if (normalize(before[f] !== after[f])) changed.push(f);
    }

    return changed;
}

const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj?.[k]]));

module.exports = { changedFieldNames, pick };