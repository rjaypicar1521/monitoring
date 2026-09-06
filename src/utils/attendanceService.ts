import { AttendanceEvent } from '../types';
import { ChatMessageData } from '../components/ui/chat/types';
import { DEFAULT_MESSAGES, DEFAULT_INITIAL_MESSAGES } from '../components/ui/chat/chat-constants';

const ATTENDANCE_CHANNEL_NAME = 'cctv_attendance_channel';
const ATTENDANCE_STORAGE_KEY = 'cctv_attendance_event';
const ATTENDANCE_CUSTOM_EVENT = 'cctv_attendance_event';

// Module-level deduplication tracking for posted chat notices across listeners
const processedAttendanceNoticeKeys = new Set<string>();

/**
 * Automatically posts an automated system notice to chat message lists (e.g. in
 * FloatingMessenger, TechnicianChat, and localStorage).
 */
export function postAttendanceChatMessage(event: AttendanceEvent): ChatMessageData | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const timeFormatted = event.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const timeKeyPart = timeFormatted.replace(/[^a-zA-Z0-9]/g, '');
  const eventId = event.id || `att-${event.type}-${event.technicianId || 'tech'}-${timeKeyPart}`;
  const messageId = `msg-${eventId.startsWith('msg-') ? eventId : `att-${eventId}`}`;

  // Global deduplication check: avoid double-posting the same notice within 10 seconds
  const dedupeKey = `${eventId}_${event.type}_${event.projectId || ''}`;
  if (processedAttendanceNoticeKeys.has(dedupeKey)) {
    return null;
  }
  processedAttendanceNoticeKeys.add(dedupeKey);
  setTimeout(() => {
    processedAttendanceNoticeKeys.delete(dedupeKey);
  }, 10000);

  const targetProjectId = event.projectId || 'proj-cctv-upc';
  const messengerStorageKey = `cctv_messenger_chat_${targetProjectId}`;
  const techChatStorageKey = `cctv_chat_messages_v2_${targetProjectId}`;

  const rawName = (event.technicianName || 'Rjay Picar').trim();
  const titlePrefix = (event.technicianRole?.includes('Lead') || rawName.includes('Rjay') || !event.technicianRole)
    ? 'Lead Technician'
    : event.technicianRole;

  // Strip prefix from rawName if already present to avoid duplicate titles
  const escapedPrefix = titlePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const techName = rawName.replace(new RegExp(`^${escapedPrefix}\\s+`, 'i'), '').trim();
  const displayName = `${titlePrefix} ${techName}`.trim();

  const isTimeIn = event.type === 'TIME_IN';
  const messageText = isTimeIn
    ? `🕒 [System Notice]: ${displayName} has timed in (On Site) at ${timeFormatted}.`
    : `🕒 [System Notice]: ${displayName} has timed out (Off Duty) at ${timeFormatted}.`;

  const newMsg: ChatMessageData = {
    id: messageId,
    senderId: 'system',
    senderName: 'System Notice',
    senderRole: 'system',
    text: messageText,
    timestamp: timeFormatted,
    status: 'delivered',
    readBy: [],
  };

  const appendToStorage = (key: string, fallbackDefaults: ChatMessageData[]): boolean => {
    try {
      let currentList: ChatMessageData[] = fallbackDefaults;
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            currentList = parsed;
          }
        } catch {}
      }

      if (currentList.some((m) => m.id === messageId || (m.text === messageText && m.timestamp === timeFormatted))) {
        return false;
      }

      const updated = [...currentList, newMsg];
      localStorage.setItem(key, JSON.stringify(updated));
      return true;
    } catch (err) {
      console.warn(`Failed to append attendance message to ${key}:`, err);
      return false;
    }
  };

  const updatedMessenger = appendToStorage(messengerStorageKey, DEFAULT_MESSAGES);
  const updatedTechChat = appendToStorage(techChatStorageKey, DEFAULT_INITIAL_MESSAGES);

  if (updatedMessenger || updatedTechChat) {
    try {
      window.dispatchEvent(new CustomEvent('cctv_messenger_sync', { detail: { message: newMsg, projectId: targetProjectId } }));
      window.dispatchEvent(new CustomEvent('cctv_chat_sync', { detail: { message: newMsg, projectId: targetProjectId } }));
    } catch {}
  }

  return newMsg;
}

/**
 * Broadcasts an attendance event (TIME_IN or TIME_OUT) across all active tabs,
 * storing to localStorage and dispatching locally for single-tab reactive updates.
 */
export function broadcastAttendance(event: AttendanceEvent): void {
  // Ensure event has an ID
  if (!event.id) {
    event.id = `att-${event.type}-${event.technicianId || 'tech'}-${Date.now()}`;
  }

  // 1. Post automated system notice to chat messages list and localStorage
  postAttendanceChatMessage(event);

  // 2. BroadcastChannel for cross-tab communication
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(ATTENDANCE_CHANNEL_NAME);
      channel.postMessage(event);
      channel.close();
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // 3. localStorage for persistent cross-tab and history
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(event));
    }
  } catch (err) {
    console.warn('Failed to save attendance event to localStorage:', err);
  }

  // 4. Local CustomEvent for same-tab / same-window updates
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ATTENDANCE_CUSTOM_EVENT, { detail: event }));
    }
  } catch (err) {
    console.warn('Failed to dispatch custom attendance event:', err);
  }
}

/**
 * Subscribes to attendance events from BroadcastChannel, localStorage StorageEvent,
 * and same-tab CustomEvents with automatic event deduplication.
 */
export function subscribeToAttendance(callback: (event: AttendanceEvent) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Deduplicate events to prevent double-firing across BroadcastChannel and StorageEvent
  const seenEventIds = new Set<string>();

  const notify = (event: AttendanceEvent) => {
    if (!event) return;
    const eventId = event.id || `att-${event.type}-${event.technicianId || 'tech'}-${event.time || Date.now()}`;
    if (seenEventIds.has(eventId)) return;
    seenEventIds.add(eventId);
    // Prune seen set after 30s
    setTimeout(() => {
      seenEventIds.delete(eventId);
    }, 30000);

    // Ensure attendance chat message is written and synced
    postAttendanceChatMessage(event);

    callback(event);
  };

  let channel: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(ATTENDANCE_CHANNEL_NAME);
      channel.onmessage = (e: MessageEvent) => {
        if (e.data && e.data.type) {
          notify(e.data as AttendanceEvent);
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel initialization error:', err);
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === ATTENDANCE_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && parsed.type) {
          notify(parsed as AttendanceEvent);
        }
      } catch {}
    }
  };

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<AttendanceEvent>;
    if (custom.detail && custom.detail.type) {
      notify(custom.detail);
    }
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(ATTENDANCE_CUSTOM_EVENT, handleCustomEvent);

  return () => {
    if (channel) {
      try {
        channel.close();
      } catch {}
    }
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(ATTENDANCE_CUSTOM_EVENT, handleCustomEvent);
  };
}

/**
 * Checks if browser Web Notification API is supported in current environment.
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets the current notification permission.
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Requests native desktop push notification permission from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  try {
    const requestPromise = Notification.requestPermission();
    if (requestPromise && typeof requestPromise.then === 'function') {
      return await requestPromise;
    }
    return await new Promise<NotificationPermission>((resolve) => {
      Notification.requestPermission(resolve);
    });
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return Notification.permission;
  }
}

/**
 * Triggers a native Windows OS desktop push notification via Web Notification API.
 */
export function showDesktopPushNotification(event: AttendanceEvent): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const isTimeIn = event.type === 'TIME_IN';
    const title = isTimeIn 
      ? `Technician On Site: ${event.technicianName}`
      : `Technician Timed Out: ${event.technicianName}`;

    const body = isTimeIn
      ? `${event.technicianName} timed in at ${event.time} for ${event.projectName}. Status updated to On Site.`
      : `${event.technicianName} clocked out at ${event.time}. Status updated to Off Duty.`;

    const iconUrl = typeof window !== 'undefined' && window.location?.origin
      ? new URL('/rmvn-logo.png', window.location.origin).href
      : '/rmvn-logo.png';

    const notification = new Notification(title, {
      body,
      icon: iconUrl,
      badge: iconUrl,
      tag: `attendance-${event.technicianId}-${event.id || event.timestamp}`,
      silent: false
    });

    notification.onclick = () => {
      try {
        window.focus();
        notification.close();
      } catch {}
    };

    return notification;
  } catch (err) {
    console.warn('Failed to display native Windows notification:', err);
    return null;
  }
}

// Reusable singleton AudioContext to prevent exceeding browser hardware limit (6 instances in Chrome)
let sharedAudioCtx: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return null;

    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtxClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.warn('Web Audio AudioContext error:', err);
    return null;
  }
}

/**
 * Plays a pleasant audio chime via Web Audio API.
 * Ascending melody (D5 -> A5) for TIME_IN, descending melody (A5 -> D5) for TIME_OUT.
 */
export function playAttendanceChime(type: 'TIME_IN' | 'TIME_OUT' = 'TIME_IN'): void {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const isTimeIn = type === 'TIME_IN';
    const note1Freq = isTimeIn ? 587.33 : 880.00; // D5 vs A5
    const note2Freq = isTimeIn ? 880.00 : 587.33; // A5 vs D5

    const now = ctx.currentTime;

    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(note1Freq, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.32);

    // Note 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(note2Freq, now + 0.14);

    gain2.gain.setValueAtTime(0.001, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.22, now + 0.19);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('Web Audio chime playback failed:', err);
  }
}

/**
 * Formats standard 12-hour attendance stamp e.g. "08:30 AM"
 */
export function formatAttendanceTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Retrieves the most recent attendance event stored in localStorage, if available.
 */
export function getLastAttendanceEvent(): AttendanceEvent | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as AttendanceEvent;
      }
    }
  } catch {}
  return null;
}
