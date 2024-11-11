export interface Snap {
    id: number;
    message: string;
    user: string;
    created_at: string;
    updated_at: string;
    is_share?: boolean;
    user_share?: string;
}

export interface ExtendedSnap extends Snap {
    liked: boolean;
    shared: boolean;
    editable: boolean;
    username: string;
    shared_username?: string;
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
    createdAt: any;
}

export interface Chat {
    id: string;
    participants: string[];
    createdAt: string;
    updatedAt: string;
    unreadCount: number;
    lastMessage?: Message;
}

export interface Notification {
    title: string;
    body: string;
    data: any;
}