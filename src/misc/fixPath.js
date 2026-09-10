export function fixPath(path) {
    return `${import.meta.env.BASE_URL}${path}`.replace(/\/\//g, '/')
}