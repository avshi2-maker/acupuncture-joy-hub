import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Push notifications enabled');
        return true;
      } else if (result === 'denied') {
        toast.error('Push notifications were denied');
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (options: NotificationOptions) => {
    if (!isSupported) {
      console.log('Notifications not supported');
      return null;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/pwa-icons/icon-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction ?? true,
        badge: '/pwa-icons/icon-192x192.png',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission, requestPermission]);

  const showAppointmentReminder = useCallback((
    patientName: string,
    minutesUntil: number,
    appointmentId: string
  ) => {
    const urgency = minutesUntil <= 5 ? '⚠️ ' : '';
    const timeText = minutesUntil === 1 ? '1 minute' : `${minutesUntil} minutes`;
    
    return showNotification({
      title: `${urgency}Appointment Reminder`,
      body: `${patientName} - starts in ${timeText}`,
      tag: `appt-${appointmentId}-${minutesUntil}`,
      requireInteraction: minutesUntil <= 5,
    });
  }, [showNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showAppointmentReminder,
  };
};
