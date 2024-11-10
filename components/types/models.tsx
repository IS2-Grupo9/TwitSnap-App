export interface Snap {
    ID: number;
    message: string;
    user: string;
    created_at: string;
    updated_at: string;
}

export interface ExtendedSnap extends Snap {
    liked: boolean;
    shared: boolean;
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
    private: boolean;
}

export interface Message {
    id: string;
    sender: string;
    text: string;
    createdAt: string;
}

export interface Chat {
    id: string;
    participants: string[];
    createdAt: string;
    updatedAt: string;
    lastMessage?: Message;
}

export interface Notification {
    title: string;
    body: string;
    data: any;
}