export interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: {
    label: string;
    url?: string;
    phone?: string;
    type: 'booking' | 'phone' | 'emergency' | 'directions' | 'email';
  }[];
  topicTag?: string;
  isEmergencyAlert?: boolean;
}

export type ChatCategory = 'all' | 'booking' | 'emergency' | 'services' | 'payment' | 'puppy-kitten';
