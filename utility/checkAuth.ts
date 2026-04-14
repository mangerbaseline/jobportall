import { verifyToken } from "@/lib/jwt"
export interface Response {
    id?: string,
    role?: string,

}

export async function CheckAuth(token: any): Promise<Response> {


    const decoded = await verifyToken(token);


    return decoded

}