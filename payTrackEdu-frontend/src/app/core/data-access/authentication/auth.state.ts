

export class AuthModel {
    isAuthenticated: boolean=false
    lastTimeAuthenticated: Date | null=null

    constructor(auth: Partial<AuthModel>) {
        Object.assign(this, auth);
    }
}
