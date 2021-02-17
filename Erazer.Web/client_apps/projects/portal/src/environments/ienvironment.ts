export interface IEnvironment {
    production: boolean,
    api: string,
    idsrv: string,
   
    // DEV only props
    username?: string,                
    password?: string,               
    client_id?: string,
    client_secret?: string,
}
