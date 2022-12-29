function randomSelection(obj) {
    return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

function randomIndex(length, current) {
    current=Number(current);
    if (length == 1) return 0;
    if (length == 2) return nextIndex(length, current);
    let index = Math.floor(Math.random() * length);
    return index == current ? randomIndex(length, current) : index;
}

function nextIndex(length, current) {
    current=Number(current);
    return current + 1 < length ? current + 1 : 0;
}

export { randomSelection, randomIndex, nextIndex }
