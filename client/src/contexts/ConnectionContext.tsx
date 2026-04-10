import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type ConnectionConfig, type UserProfile, loadConnection, saveConnection, clearConnection, getUserProfile, getSystemInfo } from '@/lib/api';

interface ConnectionState {
  config: ConnectionConfig | null;
  user: UserProfile | null;
  siteName: string;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ConnectionContextType extends ConnectionState {
  connect: (config: ConnectionConfig) => Promise<boolean>;
  disconnect: () => void;
  refreshUser: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConnectionState>({
    config: null,
    user: null,
    siteName: '脚本面板',
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const connect = useCallback(async (config: ConnectionConfig): Promise<boolean> => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      // Test connection
      const sysRes = await getSystemInfo(config);
      if (!sysRes.success) {
        setState(s => ({ ...s, isLoading: false, error: sysRes.message || '连接失败' }));
        return false;
      }

      // Get user profile
      const userRes = await getUserProfile(config);
      if (!userRes.success || !userRes.data) {
        setState(s => ({ ...s, isLoading: false, error: userRes.message || '获取用户信息失败' }));
        return false;
      }

      saveConnection(config);
      setState({
        config,
        user: userRes.data,
        siteName: sysRes.data?.site_name || '脚本面板',
        isConnected: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.message?.includes('Failed to fetch') ? '无法连接到服务器，请检查地址' : (err.message || '连接失败');
      setState(s => ({ ...s, isLoading: false, error: msg }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearConnection();
    setState({
      config: null,
      user: null,
      siteName: '脚本面板',
      isConnected: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.config) return;
    try {
      const res = await getUserProfile(state.config);
      if (res.success && res.data) {
        setState(s => ({ ...s, user: res.data! }));
      }
    } catch {}
  }, [state.config]);

  // Auto-reconnect on mount
  useEffect(() => {
    const saved = loadConnection();
    if (saved) {
      connect(saved).catch(() => {
        setState(s => ({ ...s, isLoading: false }));
      });
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [connect]);

  return (
    <ConnectionContext.Provider value={{ ...state, connect, disconnect, refreshUser }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
  return ctx;
}
