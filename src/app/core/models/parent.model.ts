import { User } from "./user.model"

export interface ParentResponse {
    success: boolean,
    parents: Parent[]
}

export interface Parent {
    id: number,
    user: User,
    full_name: string,
    cell_phone: string,
} 

export interface ParentResponseCreate {
    success: boolean,
    parent: Parent
}