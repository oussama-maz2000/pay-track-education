

export class StringUtils {
    static getRoleName(role: string | null | undefined): string {
        if (!role) return '';
        return role.startsWith('ROLE_')
            ? role.replace('ROLE_', '')
            : role;
    }
}
