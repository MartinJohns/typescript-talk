export function getObject(really) {
    if (really) {
        return { name: 'Bob', age: 56 };
    }

    return undefined;
}
