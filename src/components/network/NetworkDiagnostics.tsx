import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

type Status = 'idle' | 'checking' | 'ok' | 'error';

interface CheckResult {
  rest: Status;
  ws: Status;
  restError?: string;
  wsError?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const NetworkDiagnostics: React.FC = () => {
  const [result, setResult] = useState<CheckResult>({
    rest: 'idle',
    ws: 'idle',
  });
  const [dismissed, setDismissed] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setResult({ rest: 'checking', ws: 'checking' });
    setDismissed(false);

    // REST check — lightweight health endpoint
    let restStatus: Status = 'checking';
    let restError: string | undefined;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        },
      });
      clearTimeout(timeout);
      restStatus = res.ok || res.status === 400 ? 'ok' : 'error';
      if (restStatus === 'error') restError = `HTTP ${res.status}`;
    } catch (e: any) {
      restStatus = 'error';
      restError =
        e.name === 'AbortError'
          ? 'Request timed out (8s). Your network may be blocking *.supabase.co.'
          : e.message || 'Network error';
    }

    // WebSocket check
    let wsStatus: Status = 'checking';
    let wsError: string | undefined;
    try {
      const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      wsStatus = await new Promise<Status>((resolve) => {
        const ws = new WebSocket(
          `${wsUrl}/realtime/v1/websocket?apikey=${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}&vsn=1.0.0`
        );
        const timer = setTimeout(() => {
          ws.close();
          wsError = 'WebSocket timed out (8s).';
          resolve('error');
        }, 8000);
        ws.onopen = () => {
          clearTimeout(timer);
          ws.close();
          resolve('ok');
        };
        ws.onerror = () => {
          clearTimeout(timer);
          wsError = 'WebSocket connection failed.';
          resolve('error');
        };
      });
    } catch (e: any) {
      wsStatus = 'error';
      wsError = e.message || 'WebSocket error';
    }

    setResult({ rest: restStatus, ws: wsStatus, restError, wsError });
  }, []);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  const allOk = result.rest === 'ok' && result.ws === 'ok';
  const isChecking = result.rest === 'checking' || result.ws === 'checking';
  const hasError = result.rest === 'error' || result.ws === 'error';

  // Auto-dismiss after 4s if everything is fine
  useEffect(() => {
    if (allOk) {
      const t = setTimeout(() => setDismissed(true), 4000);
      return () => clearTimeout(t);
    }
  }, [allOk]);

  if (dismissed) return null;

  const StatusIcon = ({ status }: { status: Status }) => {
    if (status === 'checking') return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    if (status === 'ok') return <CheckCircle2 className="w-4 h-4 text-primary" />;
    if (status === 'error') return <XCircle className="w-4 h-4 text-destructive" />;
    return null;
  };

  return (
    <Alert
      variant={hasError ? 'destructive' : 'default'}
      className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      {hasError ? (
        <WifiOff className="h-5 w-5" />
      ) : (
        <Wifi className="h-5 w-5" />
      )}
      <AlertTitle className="flex items-center gap-2">
        {isChecking
          ? 'Checking connectivity…'
          : allOk
            ? 'Connection OK'
            : 'Connection Issue Detected'}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon status={result.rest} />
          <span>
            REST API{' '}
            {result.rest === 'error' && result.restError && (
              <span className="text-xs opacity-80">— {result.restError}</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon status={result.ws} />
          <span>
            WebSocket{' '}
            {result.ws === 'error' && result.wsError && (
              <span className="text-xs opacity-80">— {result.wsError}</span>
            )}
          </span>
        </div>

        {hasError && (
          <div className="mt-3 space-y-1 text-xs opacity-90">
            <p>💡 Try: disable VPN/ad-blocker, switch network (mobile hotspot), or allow <code>*.supabase.co</code> in your firewall.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-1.5"
              onClick={checkConnectivity}
              disabled={isChecking}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default NetworkDiagnostics;
