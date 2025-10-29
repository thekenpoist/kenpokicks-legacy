function changedFieldNames(before, after, fields = TRACKED_FIELDS) {
    const changed = [];
    
    for (const f of fields) {
        if (before[f] !== after[f]) changed.push(f);
    }

    return changed;
}

const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj?.[k]]));

module.exports = { changedFieldNames, pick };