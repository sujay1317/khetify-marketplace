import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationsApi, type NotificationDto } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/hooks/useSound';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, role } = useAuth();
  const { playNotification } = useSound();
  const navigate = useNavigate();

  const isSellerOrAdmin = role === 'seller' || role === 'admin';

  useEffect(() => {
    if (!user || !isSellerOrAdmin) return;
    fetchNotifications();
    // Poll every 30 seconds (replaces Supabase realtime)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, isSellerOrAdmin]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      const prevUnread = unreadCount;
      setNotifications(data.slice(0, 10));
      const newUnread = data.filter(n => !n.isRead).length;
      setUnreadCount(newUnread);
      if (newUnread > prevUnread && prevUnread > 0) playNotification();
    } catch { /* ignore */ }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    markAsRead(notification.id);
    if (notification.orderId) {
      if (role === 'admin') navigate('/admin/orders');
      else if (role === 'seller') navigate('/seller/orders');
      else navigate('/orders');
    }
  };

  const markAsRead = async (id: string) => {
    try { await notificationsApi.markAsRead(id); } catch { /* ignore */ }
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    try { await notificationsApi.markAllAsRead(); } catch { /* ignore */ }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) { case 'order': return '📦'; case 'success': return '✅'; case 'warning': return '⚠️'; default: return '🔔'; }
  };

  if (!user || !isSellerOrAdmin) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (<span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (<button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-xs text-primary hover:underline">Mark all read</button>)}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No notifications yet</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-accent ${!notification.isRead ? 'bg-primary/5' : ''}`} onSelect={() => handleNotificationClick(notification)}>
              <span className="text-lg">{getTypeIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</p>
              </div>
              {!notification.isRead && (<div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />)}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
