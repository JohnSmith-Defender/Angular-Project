export interface User {
    id?: number;
    email?: string;
    role?: string;
    domain?: string;
    fk_company_id?: number;
    tiny_url?: string;
    image?: string;
    guid?: string;
    token?: string;
    refreshToken?: string;
    custom_member_type_id?: number;
    accept_conditions?: boolean;
    created?: string;
    accepted_conditions?: boolean;
    redirect_conditions?: boolean;
}
