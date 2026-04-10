/**
 * API Service Layer
 * 封装与脚本管理面板系统的所有API通信
 * 支持两种认证方式：API Token 和 账号密码（通过Session获取Token）
 */

export interface ConnectionConfig {
  serverUrl: string;
  apiToken: string;
}

export interface LoginCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SystemInfo {
  site_name: string;
  site_description: string;
  version: string;
  api_version: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: number;
  max_processes: number;
  expires_at: string | null;
  last_login_at: string | null;
  created_at: string;
  level_name: string | null;
  user_level: number | null;
  subscribed_count: number;
  effective_max_subscriptions: number;
  effective_max_processes: number;
  effective_max_accounts_per_script: number;
}

export interface MarketScript {
  id: number;
  name: string;
  description: string;
  language: string;
  version: string;
  created_at: string;
  type_name: string;
  type_icon: string;
  subscriber_count: number;
  user_script_id: number | null;
}

export interface UserScript {
  id: number;
  script_id: number;
  is_active: number;
  cron_expression: string | null;
  cron_enabled: number;
  exec_mode: string;
  last_run_at: string | null;
  next_run_at: string | null;
  last_status: string | null;
  created_at: string;
  updated_at: string;
  script_name: string;
  language: string;
  version: string;
  timeout: number;
  type_name: string;
  type_icon: string;
  total_runs: number;
  success_runs: number;
  running_count: number;
}

export interface ScriptDetail {
  id: number;
  script_id: number;
  script_name: string;
  script_description: string;
  language: string;
  version: string;
  timeout: number;
  type_name: string;
  is_active: number;
  cron_expression: string | null;
  cron_enabled: number;
  exec_mode: string;
  last_run_at: string | null;
  next_run_at: string | null;
  last_status: string | null;
  accounts: Account[];
  required_env_vars: RequiredEnvVar[];
  max_accounts_per_script: number;
  created_at: string;
  updated_at: string;
}

export interface Account {
  name: string;
  enabled: boolean;
  vars: Record<string, string>;
}

export interface RequiredEnvVar {
  name: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  placeholder?: string;
}

export interface ExecutionLog {
  id: number;
  user_script_id: number;
  script_id: number;
  trigger_type: string;
  account_name: string;
  status: string;
  error_message: string | null;
  execution_time: number | null;
  started_at: string;
  finished_at: string | null;
  created_at: string;
  script_name: string;
}

export interface LogDetail extends ExecutionLog {
  output: string;
}

export interface Stats {
  subscribed_scripts: number;
  active_scripts: number;
  cron_enabled: number;
  executions_today: number;
  success_today: number;
  failed_today: number;
}

// Storage keys
const STORAGE_KEY = 'script_panel_connection';

export function saveConnection(config: ConnectionConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadConnection(): ConnectionConfig | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearConnection(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function normalizeUrl(url: string): string {
  let u = url.trim();
  if (!u.startsWith('http://') && !u.startsWith('https://')) {
    u = 'https://' + u;
  }
  return u.replace(/\/+$/, '');
}

async function apiRequest<T>(
  config: ConnectionConfig,
  method: string,
  path: string,
  body?: any,
): Promise<ApiResponse<T>> {
  const baseUrl = normalizeUrl(config.serverUrl);
  const url = `${baseUrl}/api/v1${path}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiToken}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  return json;
}

// ========== Auth ==========

export async function testConnection(config: ConnectionConfig): Promise<ApiResponse<SystemInfo>> {
  return apiRequest<SystemInfo>(config, 'GET', '/system/info');
}

export async function loginWithCredentials(creds: LoginCredentials): Promise<{ success: boolean; token?: string; message?: string }> {
  const baseUrl = normalizeUrl(creds.serverUrl);

  // Step 1: Login via session
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      username: creds.username,
      password: creds.password,
    }),
    credentials: 'include',
    redirect: 'manual',
  });

  // Check if login was successful (redirect to / means success)
  if (loginRes.status !== 302 && loginRes.status !== 200) {
    const text = await loginRes.text();
    if (text.includes('用户不存在')) return { success: false, message: '用户不存在' };
    if (text.includes('密码错误')) return { success: false, message: '密码错误' };
    if (text.includes('已被禁用')) return { success: false, message: '账户已被禁用' };
    if (text.includes('已到期')) return { success: false, message: '账户已到期' };
    return { success: false, message: '登录失败，请检查账号密码' };
  }

  // Step 2: Create API token
  const tokenRes = await fetch(`${baseUrl}/api-manage/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'App Client Token', expires_days: 365 }),
    credentials: 'include',
  });

  const tokenData = await tokenRes.json();
  if (tokenData.success && tokenData.token) {
    return { success: true, token: tokenData.token };
  }

  return { success: false, message: tokenData.message || '无法创建API Token' };
}

// ========== System ==========

export async function getSystemInfo(config: ConnectionConfig) {
  return apiRequest<SystemInfo>(config, 'GET', '/system/info');
}

// ========== User ==========

export async function getUserProfile(config: ConnectionConfig) {
  return apiRequest<UserProfile>(config, 'GET', '/user/profile');
}

// ========== Stats ==========

export async function getStats(config: ConnectionConfig) {
  return apiRequest<Stats>(config, 'GET', '/stats');
}

// ========== Scripts Market ==========

export async function getMarketScripts(config: ConnectionConfig, params?: { type?: string; page?: number; limit?: number }) {
  let path = '/scripts/market';
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  if (qs) path += '?' + qs;
  return apiRequest<MarketScript[]>(config, 'GET', path);
}

// ========== My Scripts ==========

export async function getMyScripts(config: ConnectionConfig) {
  return apiRequest<UserScript[]>(config, 'GET', '/scripts');
}

export async function getScriptDetail(config: ConnectionConfig, id: number) {
  return apiRequest<ScriptDetail>(config, 'GET', `/scripts/${id}`);
}

export async function runScript(config: ConnectionConfig, id: number) {
  return apiRequest(config, 'POST', `/scripts/${id}/run`);
}

export async function stopScript(config: ConnectionConfig, id: number, logId: number) {
  return apiRequest(config, 'POST', `/scripts/${id}/stop`, { log_id: logId });
}

export async function stopAllScript(config: ConnectionConfig, id: number) {
  return apiRequest(config, 'POST', `/scripts/${id}/stop-all`);
}

export async function toggleScript(config: ConnectionConfig, id: number) {
  return apiRequest(config, 'POST', `/scripts/${id}/toggle`);
}

export async function updateScriptEnv(config: ConnectionConfig, id: number, accounts: Account[]) {
  return apiRequest(config, 'PUT', `/scripts/${id}/env`, { accounts });
}

export async function updateScriptCron(config: ConnectionConfig, id: number, cronExpression: string, cronEnabled: boolean) {
  return apiRequest(config, 'PUT', `/scripts/${id}/cron`, { cron_expression: cronExpression, cron_enabled: cronEnabled });
}

// ========== Logs ==========

export async function getLogs(config: ConnectionConfig, params?: { script_id?: number; status?: string; page?: number; limit?: number }) {
  let path = '/logs';
  const query = new URLSearchParams();
  if (params?.script_id) query.set('script_id', String(params.script_id));
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  if (qs) path += '?' + qs;
  return apiRequest<ExecutionLog[]>(config, 'GET', path);
}

export async function getLogDetail(config: ConnectionConfig, id: number) {
  return apiRequest<LogDetail>(config, 'GET', `/logs/${id}`);
}

export async function stopLog(config: ConnectionConfig, id: number) {
  return apiRequest(config, 'POST', `/logs/${id}/stop`);
}
