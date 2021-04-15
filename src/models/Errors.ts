export class ServiceError extends Error {
    public code: string
    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ItemNotFoundError extends ServiceError {
    code: 'ItemNotFound'
    constructor() {
        super('item not found')
    }
}