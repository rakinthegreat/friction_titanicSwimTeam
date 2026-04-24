'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ArrowLeft, ShieldCheck, Bell, Battery, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { WaitLessDigitalWellbeing } from '@/lib/native-bridge';

export default function PermissionsPage() {
  const router = useRouter();
  const [usageStatsGranted, setUsageStatsGranted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [batteryGranted, setBatteryGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkPermissions = async () => {
    try {
      const [usage, notify, battery] = await Promise.all([
        WaitLessDigitalWellbeing.hasUsageStatsPermission(),
        WaitLessDigitalWellbeing.hasNotificationPermission(),
        WaitLessDigitalWellbeing.hasBatteryOptimizationPermission()
      ]);
      
      setUsageStatsGranted(usage.granted);
      setNotificationGranted(notify.granted);
      setBatteryGranted(battery.granted);
    } catch (e) {
      console.error('Failed to check permissions', e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkPermissions();
    // Check again when window regains focus (user returns from settings)
    window.addEventListener('focus', checkPermissions);
    return () => window.removeEventListener('focus', checkPermissions);
  }, []);

  const handleOpenUsageSettings = async () => {
    try {
      await WaitLessDigitalWellbeing.openUsageSettings();
    } catch (e) {
      console.error('Failed to open usage settings', e);
    }
  };

  const handleRequestNotifications = async () => {
    try {
      const { granted } = await WaitLessDigitalWellbeing.requestNotificationPermission();
      setNotificationGranted(granted);
    } catch (e) {
      console.error('Failed to request notifications', e);
    }
  };

  const handleRequestBatteryOptimization = async () => {
    try {
      await WaitLessDigitalWellbeing.requestBatteryOptimizationPermission();
    } catch (e) {
      console.error('Failed to request battery optimization', e);
    }
  };

  const PermissionItem = ({ 
    title, 
    description, 
    icon: Icon, 
    status, 
    action 
  }: { 
    title: string, 
    description: string, 
    icon: any, 
    status: 'granted' | 'missing' | 'checking',
    action?: () => void
  }) => (
    <Card className="p-6 flex items-start gap-4 shadow-neo-out">
      <div className={`p-3 rounded-2xl bg-card shadow-neo-in ${status === 'granted' ? 'text-accent' : 'text-foreground/40'}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-foreground/60 font-medium leading-relaxed">{description}</p>
        <div className="pt-3">
          {status === 'granted' ? (
            <div className="flex items-center text-accent font-bold text-sm">
              <CheckCircle2 size={16} className="mr-2" />
              Permission Granted
            </div>
          ) : status === 'checking' ? (
            <div className="text-foreground/20 text-sm animate-pulse">Checking...</div>
          ) : (
            <Button 
              onClick={action}
              variant="outline" 
              className="py-2 px-4 text-xs shadow-neo-out active:shadow-neo-in"
            >
              Grant Access
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <main className="min-h-screen p-6 sm:p-8 max-w-2xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => router.push('/')}
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors mr-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black tracking-tight">Permissions</h1>
        </div>
        <ThemeToggle />
      </header>

      <section className="space-y-6">
        <div className="bg-accent/10 border border-accent/20 p-6 rounded-[2rem] flex items-start gap-4">
          <ShieldCheck className="text-accent shrink-0" size={28} />
          <div className="space-y-1">
            <h2 className="font-bold text-accent">Privacy Matters</h2>
            <p className="text-sm text-foreground/70 font-medium">
              WaitLess uses these permissions locally on your device to detect waiting periods. Your data never leaves your phone.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <PermissionItem 
            title="Notifications"
            description="Allows us to ping you when a waiting period is detected so you can reclaim your time."
            icon={Bell}
            status={checking ? 'checking' : notificationGranted ? 'granted' : 'missing'}
            action={handleRequestNotifications}
          />

          <PermissionItem 
            title="Background Activity"
            description="Ensures the app can monitor your movement and screen time even when not active."
            icon={Battery}
            status={checking ? 'checking' : batteryGranted ? 'granted' : 'missing'}
            action={handleRequestBatteryOptimization}
          />

          <PermissionItem 
            title="Usage Access"
            description="Required to detect when you are using 'doomscrolling' apps and suggest a WaitLess activity instead."
            icon={Smartphone}
            status={checking ? 'checking' : usageStatsGranted ? 'granted' : 'missing'}
            action={handleOpenUsageSettings}
          />
        </div>
      </section>

      {(!usageStatsGranted || !notificationGranted || !batteryGranted) && !checking && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 text-xs font-bold justify-center">
          <AlertCircle size={14} />
          Some features may be limited without all permissions
        </div>
      )}
    </main>
  );
}

