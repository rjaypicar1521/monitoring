import { ChatMessageData } from './types';

export const DEFAULT_MESSAGES: ChatMessageData[] = [
  {
    id: 'm-init-1',
    senderId: 'usr-installer',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Hello UPCHQ team! All preliminary cabling for Zones 1-3 is complete. CAM-01 (Main Gate) and CAM-02 (Perimeter West) are verified online in 1080p.',
    timestamp: '10:15 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer'],
    reactions: [{ emoji: '👍', count: 2, users: ['client', 'tech'] }],
  },
  {
    id: 'm-init-2',
    senderId: 'usr-installer',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Field update: Backdoor (CAM-04) cable is pulled at the doorway. Bracket mounting is temporarily deferred for occupant privacy clearance. Let me know when authorized to drill.',
    timestamp: '11:30 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer'],
  },
];

export const DEFAULT_INITIAL_MESSAGES: ChatMessageData[] = [
  {
    id: 'msg-init-1',
    senderId: 'tech-rjay',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Good day UPCHQ Team! All preliminary cabling for Zones 1-3 is complete. CAM-01 (Main Gate) and CAM-02 (Perimeter West) have been tested and verified online with 1080p stream.',
    timestamp: 'Today, 10:15 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer', 'client-current'],
    reactions: [{ emoji: '👍', count: 2, users: ['client', 'tech'] }],
  },
  {
    id: 'msg-init-2',
    senderId: 'tech-rjay',
    senderName: 'Rjay Picar - RMVN',
    senderRole: 'technician',
    text: 'Field update on Backdoor (CAM-04): Cable is pulled and ready at entrance. Physical bracket mounting is temporarily held for occupant privacy clearance. Let me know if we can proceed this afternoon.',
    timestamp: 'Today, 11:30 AM',
    status: 'read',
    readBy: ['usr-client', 'usr-installer', 'client-current'],
  },
];

/**
 * Checks whether a chat message is unread for a given user ID.
 * Returns false if the message was sent by the user, if readBy includes the user,
 * or if it is a legacy pre-read message with status 'read' and no readBy array.
 */
export function isMessageUnreadForUser(msg: ChatMessageData, userId: string): boolean {
  if (msg.senderId === userId) return false;
  if (msg.readBy && msg.readBy.includes(userId)) return false;
  if (msg.status === 'read' && (!msg.readBy || msg.readBy.length === 0)) return false;
  return true;
}

