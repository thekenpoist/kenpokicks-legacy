function changedFieldNames(before, after, fields = TRACKED_FILEDS) {
    const changed = [];
    
    for (const f of fields) {
        if (before[f] !== after[f]) changed.push(f);
    }

    return changed;
}

module.exports = { changedFieldNames };