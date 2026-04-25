export interface Message {
    role: 'user' | 'ai';
    content: string;
    createdAt?: Date;
}

export interface Conversation {
    id: string;
    title: string;
    preview: string;
    date: string;
    messages: Message[];
}

export type SettingsSection = 'profile' | 'notifications' | 'appearance' | 'password' | 'billing';
