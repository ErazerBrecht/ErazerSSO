export interface IEnvironment {
    production: boolean,
    bff: string,

    // DEV only props
    username?: string,
    password?: string,
}
