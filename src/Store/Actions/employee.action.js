export function setName(name) {
    return {
        type: 'set_name',
        payload: {
            name
        }
    }
}