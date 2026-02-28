export class ApiError extends Error {
    public statusCode: number;

    constructor(name: string, message: string, statusCode: number) {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
        if ('captureStackTrace' in Error) {
            (Error as any).captureStackTrace(this, this.constructor);
        }
    }
}
