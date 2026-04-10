/**
 * Login Page — Instrument Panel Industrial Design
 * 支持两种登录方式：API密钥 / 账号密码
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnection } from '@/contexts/ConnectionContext';
import { loginWithCredentials } from '@/lib/api';
import { KeyRound, User, Server, Eye, EyeOff, Loader2, AlertCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

const LOGIN_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663538217365/ZawzBHKHWB6NgRqDbWKRSj/login-bg-aCP6qH5f9vcHaNq56nFmp6.webp';

export default function Login() {
  const { connect, isLoading, error } = useConnection();
  const [tab, setTab] = useState<string>('token');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Token mode
  const [serverUrl, setServerUrl] = useState('');
  const [apiToken, setApiToken] = useState('');

  // Credentials mode
  const [credServerUrl, setCredServerUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl.trim() || !apiToken.trim()) {
      toast.error('请填写完整信息');
      return;
    }
    setSubmitting(true);
    const ok = await connect({ serverUrl: serverUrl.trim(), apiToken: apiToken.trim() });
    if (ok) {
      toast.success('连接成功');
    }
    setSubmitting(false);
  };

  const handleCredLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credServerUrl.trim() || !username.trim() || !password.trim()) {
      toast.error('请填写完整信息');
      return;
    }
    setSubmitting(true);
    try {
      const result = await loginWithCredentials({
        serverUrl: credServerUrl.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      if (result.success && result.token) {
        const ok = await connect({ serverUrl: credServerUrl.trim(), apiToken: result.token });
        if (ok) toast.success('登录成功');
      } else {
        toast.error(result.message || '登录失败');
      }
    } catch (err: any) {
      toast.error(err.message?.includes('Failed to fetch') ? '无法连接到服务器' : '登录失败');
    }
    setSubmitting(false);
  };

  const loading = isLoading || submitting;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-5">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${LOGIN_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">脚本面板</h1>
          <p className="text-muted-foreground text-sm mt-1">连接到您的脚本管理系统</p>
        </div>

        {/* Login Card */}
        <div className="panel-card glow-blue">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="token" className="text-xs gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                API 密钥
              </TabsTrigger>
              <TabsTrigger value="credentials" className="text-xs gap-1.5">
                <User className="w-3.5 h-3.5" />
                账号密码
              </TabsTrigger>
            </TabsList>

            {/* API Token Login */}
            <TabsContent value="token" className="mt-4">
              <form onSubmit={handleTokenLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    服务器地址
                  </Label>
                  <Input
                    placeholder="https://panel.example.com"
                    value={serverUrl}
                    onChange={e => setServerUrl(e.target.value)}
                    className="bg-secondary/50 border-border/50 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    API Token
                  </Label>
                  <Input
                    placeholder="sp_xxxxxxxxxxxxxxxx"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    className="bg-secondary/50 border-border/50 h-10 font-mono text-xs"
                  />
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  连接
                </Button>
              </form>
            </TabsContent>

            {/* Credentials Login */}
            <TabsContent value="credentials" className="mt-4">
              <form onSubmit={handleCredLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    服务器地址
                  </Label>
                  <Input
                    placeholder="https://panel.example.com"
                    value={credServerUrl}
                    onChange={e => setCredServerUrl(e.target.value)}
                    className="bg-secondary/50 border-border/50 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    用户名 / 邮箱
                  </Label>
                  <Input
                    placeholder="admin"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="bg-secondary/50 border-border/50 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    密码
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入密码"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="bg-secondary/50 border-border/50 h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-10" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  登录
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Error display */}
          {error && (
            <div className="mt-4 flex items-start gap-2 text-destructive text-xs bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <p className="text-center text-[11px] text-muted-foreground mt-6">
          API密钥可在面板「API管理」页面生成
        </p>
      </div>
    </div>
  );
}
