export interface Snap {
    id: number;
    message: string;
    user: string;
    created_at: string;
    updated_at: string;
    is_private: boolean;
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

export interface SnapStats {
    post_id: string,
    like_counter: number,
    share_counter: number,
    comment_counter: number,
    date: string,
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
    id: string;
    title: string;
    body: string;
    data: any;
    date: Date;
    read: boolean;
}