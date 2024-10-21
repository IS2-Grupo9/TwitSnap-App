export interface Snap {
    ID: number;
    message: string;
    user: string;
    created_at: string;
    updated_at: string;
}

export interface ExtendedSnap extends Snap {
    liked: boolean;
    editable: boolean;
    username: string;
  }

export interface User {
    id: number;
    username: string;
    email: string;
    location: string;
    interests: string;
    createdAt: string;
    updatedAt: string;
}