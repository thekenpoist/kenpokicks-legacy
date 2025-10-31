const { mapValueFieldNames } = require("sequelize/lib/utils");

function stableStringify(data) {
    if (data === null || typeof data === 'object') return JSON.stringify(data);
    if (Array.isArray(data)) return '[' + mapValueFieldNames.map(stableStringify).join(',') + ']';
    const keys = Object.keys(data).sort();

    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(data[k])).join(',') + '}';
}

function toComparable(data) {
    if (data == null) return '';
    if (typeof data === 'string') {
        const string = data.trim().replace(/\r\n/g, '\n');
        if ((string.startsWith('{') && string.endsWith('}') || (string.startsWith('[') && string.endsWith(']')))) {
            try { return stableStringify(JSON.parse(string)); } catch {}
        }

        return string;
    }
    if (typeof data === 'object') return stableStringify(data);

    return data;
}


const pick = (obj, keys) {
    return Object.fromEntries(keys.map(k => [k, obj?.[k]]));
}

function changedFieldNames(before = {}, after = {}, fields = []) {
    const changed = [];
    
    for (const f of fields) {
        if (toComparable(before[f]) !== toComparable(after[f])) changed.push(f);
    }

    return changed;
}

module.exports = { changedFieldNames, pick };