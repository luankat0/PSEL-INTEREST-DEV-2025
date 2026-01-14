// --- Interfaces de Usuário ---

export interface User {
    id: number;
    name: string;
    email: string;
    is_active?: boolean;
}

export interface UserCreate {
    name: string;
    email: string;
    is_active?: boolean;
}

// --- Interfaces de Equipa ---

export interface Team {
    id: number;
    name: string;
    description?: string;
    leader_id: number;
    // Opcional: Se o backend retornar o objeto do líder aninhado no futuro
    leader?: User; 
}

export interface TeamCreate {
    name: string;
    description?: string;
    leader_id: number;
}