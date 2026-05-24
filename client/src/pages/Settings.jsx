import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AppLink from '../components/AppLink';
import { isMentorAccount } from '../utils/accountRole';
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Monitor,
  Moon,
  Sun,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Settings as SettingsIcon } from 'lucide-react';
import { removeAllResumesForUser } from '../api/resumeStorage';
import { toJsonbSafe } from '../utils/jsonbSafe';
import { focusRing } from '../ui';
import {
  applyAppearance,
  applyThemePreference,
  getStoredAppearanceOverlay,
} from '../utils/appearance';
import { LANGUAGE_OPTIONS, useI18n } from '../i18n';

/** Never persist password fields to JSONB. */
function settingsForPersistence(s) {
  const account = { ...s.account };
  delete account.current_password;
  delete account.new_password;
  delete account.confirm_password;
  return { ...s, account };
}

/** PostgREST: table missing from API schema (migration not applied on this project). */
function isUserSettingsTableMissingError(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const msg = String(error.message || '');
  return msg.includes("Could not find the table") && msg.includes('user_settings');
}

const DEFAULT_SETTINGS = {
  account: {
    email: '',
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  },
  notifications: {
    email_notifications: true,
    session_reminders: true,
    mentor_updates: true,
    marketing_emails: false,
    push_notifications: true,
    sms_notifications: false
  },
  appearance: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    font_size: 'medium',
    high_contrast: false
  },
  privacy: {
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    allow_mentor_contact: true,
    data_sharing: false
  },
  billing: {
    plan: 'free',
    auto_renew: false,
    payment_method: null
  }
};

export default function Settings() {
  const { user, logout, loading: authLoading } = useAuth();
  const { t, setLanguage } = useI18n();
  const navigate = useNavigate();
  const asMentor = user ? isMentorAccount(user) : false;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState(() => {
    const stored = getStoredAppearanceOverlay();
    return {
      ...DEFAULT_SETTINGS,
      appearance: { ...DEFAULT_SETTINGS.appearance, ...(stored || {}) },
    };
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [serverSettingsAvailable, setServerSettingsAvailable] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, authLoading]);

  // After server load: sync DOM + localStorage. Skip while loading so defaults never overwrite a stored theme.
  useEffect(() => {
    if (loading) return;
    applyAppearance(settings.appearance);
  }, [settings.appearance, loading]);

  // If theme is "system", respond to OS-level changes live (global listener also runs in main.jsx)
  useEffect(() => {
    if (settings.appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemePreference('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.appearance.theme]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

      if (error && isUserSettingsTableMissingError(error)) {
        setServerSettingsAvailable(false);
        const localTheme = getStoredAppearanceOverlay();
        setSettings((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
          },
          appearance: localTheme ? { ...prev.appearance, ...localTheme } : prev.appearance,
        }));
      } else if (error) {
        console.error('Error loading settings:', error);
      } else if (data?.settings) {
        // Merge with defaults so newly-added fields don't break old saved rows
        const merged = {
          ...DEFAULT_SETTINGS,
          ...data.settings,
          account: { ...DEFAULT_SETTINGS.account, ...(data.settings.account || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.settings.notifications || {}) },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(data.settings.appearance || {}) },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...(data.settings.privacy || {}) },
          billing: { ...DEFAULT_SETTINGS.billing, ...(data.settings.billing || {}) },
        };
        merged.account.email = user.email || merged.account.email;
        merged.account.full_name = user.user_metadata?.full_name || merged.account.full_name;
        const localTheme = getStoredAppearanceOverlay();
        if (localTheme) {
          merged.appearance = { ...merged.appearance, ...localTheme };
        }
        setSettings(merged);
      } else {
        const localTheme = getStoredAppearanceOverlay();
        setSettings((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          },
          appearance: localTheme ? { ...prev.appearance, ...localTheme } : prev.appearance,
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      applyAppearance(settings.appearance);

      // Persist full_name to auth metadata so other parts of the app see the updated name
      const currentName = user.user_metadata?.full_name ?? '';
      if (settings.account.full_name && settings.account.full_name !== currentName) {
        await supabase.auth.updateUser({ data: { full_name: settings.account.full_name } });
      }

      const persisted = toJsonbSafe(settingsForPersistence(settings));
      let { error } = await supabase.from('user_settings').upsert(
        {
          user_id: user.id,
          settings: persisted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      if (error && !isUserSettingsTableMissingError(error)) {
        const { data: row } = await supabase.from('user_settings').select('id').eq('user_id', user.id).maybeSingle();
        if (row?.id) ({ error } = await supabase.from('user_settings').update({ settings: persisted, updated_at: new Date().toISOString() }).eq('user_id', user.id));
        else ({ error } = await supabase.from('user_settings').insert({ user_id: user.id, settings: persisted, updated_at: new Date().toISOString() }));
      }

      if (error) {
        if (isUserSettingsTableMissingError(error)) {
          setServerSettingsAvailable(false);
          setMessage({
            type: 'success',
            text: 'Preferences saved on this device. Cloud backup is unavailable until the database is updated.',
          });
          setTimeout(() => setMessage({ type: '', text: '' }), 5000);
          return;
        }
        throw error;
      }
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({
        type: 'error',
        text: err.message ? `${err.message} (run supabase/BRIDGE_PUBLISH.sql if tables are missing)` : 'Error saving settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section, field, value) => {
    if (section === 'appearance' && field === 'language') {
      setLanguage(value);
    }
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    const { current_password, new_password, confirm_password } = settings.account;

    if (!current_password || !new_password || !confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (new_password !== confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: new_password });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setSettings((prev) => ({
        ...prev,
        account: {
          ...prev.account,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }
      }));
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage({ type: 'error', text: 'Error updating password. Please check your current password.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await removeAllResumesForUser(user.id).catch(() => {});

      if (asMentor) {
        const { error: mentorDelErr } = await supabase.from('mentor_profiles').delete().eq('user_id', user.id);
        if (mentorDelErr) {
          const msg = String(mentorDelErr.message || '');
          if (mentorDelErr.code === '23503' || msg.toLowerCase().includes('foreign key')) {
            setMessage({
              type: 'error',
              text: 'You still have sessions linked to your mentor profile. Complete or cancel them on the dashboard, then try again.',
            });
            setShowDeleteConfirm(false);
            return;
          }
          throw mentorDelErr;
        }
      }

      await supabase.from('user_profiles').delete().eq('user_id', user.id);
      const { error: delSettingsErr } = await supabase.from('user_settings').delete().eq('user_id', user.id);
      if (delSettingsErr && !isUserSettingsTableMissingError(delSettingsErr)) throw delSettingsErr;

      await logout();
      setShowDeleteConfirm(false);
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setMessage({ type: 'error', text: 'Could not finish account cleanup. Try again or contact support.' });
    }
  };

  const exportData = async () => {
    try {
      const [profileData, settingsData] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (profileData.error) throw profileData.error;
      if (settingsData.error && !isUserSettingsTableMissingError(settingsData.error)) {
        throw settingsData.error;
      }

      const payload = {
        profile: profileData.data,
        settings: settingsData.data,
        local_appearance_snapshot: getStoredAppearanceOverlay(),
        export_date: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bridge-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (err) {
      console.error('Error exporting data:', err);
      setMessage({ type: 'error', text: 'Error exporting data.' });
    }
  };

  if (authLoading) {
    return <LoadingSpinner label="Checking your session…" className="min-h-screen" />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const inputClass = 'w-full rounded-xl border bg-[var(--bridge-surface-muted)] px-4 py-2.5 text-sm text-[var(--bridge-text)] placeholder:text-[var(--bridge-text-faint)] outline-none transition disabled:opacity-50 disabled:cursor-not-allowed';
  const inputEvents = {
    onFocus: (e) => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--color-primary) 65%, transparent)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)'; },
    onBlur:  (e) => { e.currentTarget.style.borderColor = 'var(--bridge-border)'; e.currentTarget.style.boxShadow = ''; },
  };
  const selectClass = inputClass + ' cursor-pointer';

  function Toggle({ checked, onChange }) {
    return (
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${focusRing}`}
        style={{ backgroundColor: checked ? 'var(--color-primary)' : 'var(--bridge-border-strong)' }}>
        <span className={`pointer-events-none mt-0.5 ml-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    );
  }

  function SectionLabel({ children }) {
    return <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bridge-text-faint)]">{children}</p>;
  }

  function Divider() {
    return <div className="border-t border-[var(--bridge-border)]" />;
  }

  function ToggleRow({ label, description, checked, onChange }) {
    return (
      <div className="flex items-center justify-between gap-6 py-3.5">
        <div>
          <p className="text-sm font-semibold text-[var(--bridge-text)]">{label}</p>
          {description && <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{description}</p>}
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
    );
  }

  const NAV_SECTIONS = [
    { id: 'account',       label: 'Account',       icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
    { id: 'privacy',       label: 'Privacy',       icon: Shield },
    { id: 'billing',       label: 'Billing',       icon: CreditCard },
  ];

  return (
      <div data-route-atmo="settings" className="relative isolate min-h-screen" style={{ backgroundColor: 'var(--bridge-canvas)' }}>

        {/* Hero header — matches Pricing/About pattern */}
        <section className="relative overflow-hidden px-5 pt-12 pb-8 sm:px-8 lg:pt-16 lg:pb-10">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[8%] top-[-30%] h-[100%] w-[55%] rounded-full blur-[100px]"
              style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 28%, transparent) 0%, transparent 70%)', opacity: 0.3 }} />
            <div className="absolute -right-[10%] top-[-20%] h-[80%] w-[40%] rounded-full blur-[110px]"
              style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent, var(--color-primary)) 32%, transparent) 0%, transparent 70%)', opacity: 0.18 }} />
          </div>
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bridge-surface) 80%, transparent)', color: 'var(--bridge-text-muted)', boxShadow: '0 0 0 1px var(--bridge-border) inset' }}>
              <SettingsIcon className="h-3 w-3" style={{ color: 'var(--color-primary)' }} />
              Settings
            </div>
            <h1 className="font-display font-black"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', lineHeight: 1.06, letterSpacing: '-0.03em', color: 'var(--bridge-text)' }}>
              Your{' '}
              <span className="font-editorial italic" style={{ color: 'var(--color-primary)' }}>
                preferences
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
              Manage your account, privacy, and how Bridge looks and feels.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8">

          {/* Banners */}
          {!serverSettingsAvailable && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm"
              style={{ borderColor: 'color-mix(in srgb, var(--color-warning, var(--color-primary)) 35%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, var(--color-warning, var(--color-primary)) 8%, var(--bridge-surface))' }}>
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-warning, var(--color-primary))' }} aria-hidden />
              <p style={{ color: 'var(--bridge-text-secondary)' }}>
                The <code className="rounded px-1.5 py-0.5 text-xs font-mono" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>user_settings</code> table isn't available. Theme preferences still work in this browser. Run <code className="rounded px-1.5 py-0.5 text-xs font-mono" style={{ backgroundColor: 'var(--bridge-surface-muted)' }}>supabase/ensure_user_settings.sql</code> to enable cloud sync.
              </p>
            </div>
          )}

          {message.text && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm"
              style={message.type === 'success'
                ? { borderColor: 'color-mix(in srgb, #10b981 30%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, #10b981 8%, var(--bridge-surface))', color: 'var(--bridge-text)' }
                : { borderColor: 'color-mix(in srgb, #ef4444 30%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface))', color: 'var(--bridge-text)' }}>
              {message.type === 'success'
                ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Layout: sidebar + content */}
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">

            {/* Sidebar nav */}
            <nav className="shrink-0 lg:w-56" aria-label="Settings sections">
              {/* Mobile: horizontal scroll tabs */}
              <div className="flex gap-1 overflow-x-auto rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-1.5 lg:hidden">
                {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <button key={id} type="button" onClick={() => setActiveSection(id)}
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all ${focusRing}`}
                      style={active ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', boxShadow: '0 4px 14px -4px color-mix(in srgb, var(--color-primary) 50%, transparent)' } : { color: 'var(--bridge-text-secondary)' }}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </div>
              {/* Desktop: vertical list */}
              <div className="hidden lg:flex lg:flex-col lg:gap-0.5">
                {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id;
                  return (
                    <button key={id} type="button" onClick={() => setActiveSection(id)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all text-left ${focusRing}`}
                      style={active ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)' } : { color: 'var(--bridge-text-secondary)' }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = 'var(--bridge-surface-muted)'; e.currentTarget.style.color = 'var(--bridge-text)'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--bridge-text-secondary)'; } }}>
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Content card */}
            <div className="min-w-0 flex-1">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl opacity-40"
                  style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 15%, transparent), transparent 70%)' }} />

                <div className="relative p-7 sm:p-8">

                  {/* ── ACCOUNT ── */}
                  {activeSection === 'account' && (
                    <div className="space-y-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                          <User className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Account</h2>
                          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Manage your identity and security</p>
                        </div>
                      </div>

                      {asMentor ? (
                        <div className="rounded-xl border p-4"
                          style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 28%, var(--bridge-border))', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, var(--bridge-surface))' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>Mentor account</p>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                            You're set up to receive requests and run sessions. Create a separate member profile to also book mentors.
                          </p>
                          <AppLink to="/dashboard" className={`mt-2 inline-flex text-sm font-semibold underline underline-offset-2 hover:no-underline ${focusRing} rounded-sm`} style={{ color: 'var(--color-primary)' }}>
                            Open mentor dashboard →
                          </AppLink>
                        </div>
                      ) : (
                        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>Member account</p>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                            Use the mentor directory to shortlist people, book sessions, and track everything from your dashboard.
                          </p>
                        </div>
                      )}

                      <div className="space-y-5">
                        <SectionLabel>Profile</SectionLabel>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>Email</label>
                            <input type="email" value={settings.account.email} disabled
                              className={inputClass} style={{ borderColor: 'var(--bridge-border)' }} />
                            <p className="text-[11px]" style={{ color: 'var(--bridge-text-faint)' }}>Contact support to change your email</p>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>Full Name</label>
                            <input type="text" value={settings.account.full_name} placeholder="Your name"
                              onChange={e => updateSettings('account', 'full_name', e.target.value)}
                              className={inputClass} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents} />
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-5">
                        <SectionLabel>Change Password</SectionLabel>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>Current Password</label>
                          <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} value={settings.account.current_password}
                              placeholder="Enter current password"
                              onChange={e => updateSettings('account', 'current_password', e.target.value)}
                              className={inputClass + ' pr-10'} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--bridge-text-faint)' }}>
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>New Password</label>
                            <input type={showPassword ? 'text' : 'password'} value={settings.account.new_password}
                              placeholder="New password" onChange={e => updateSettings('account', 'new_password', e.target.value)}
                              className={inputClass} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>Confirm Password</label>
                            <input type={showPassword ? 'text' : 'password'} value={settings.account.confirm_password}
                              placeholder="Confirm new password" onChange={e => updateSettings('account', 'confirm_password', e.target.value)}
                              className={inputClass} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents} />
                          </div>
                        </div>
                        <button onClick={handlePasswordChange}
                          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
                          style={{ backgroundColor: 'var(--bridge-surface-raised)', color: 'var(--bridge-text)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                          Update password
                        </button>
                      </div>

                      <Divider />

                      <div className="space-y-4">
                        <SectionLabel>Data Management</SectionLabel>
                        <div className="flex flex-wrap gap-3">
                          <button onClick={exportData}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
                            style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                            <Download className="h-4 w-4" /> Export my data
                          </button>
                          <button onClick={() => setShowDeleteConfirm(true)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
                            style={{ backgroundColor: 'color-mix(in srgb, #ef4444 8%, var(--bridge-surface))', color: '#ef4444', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, #ef4444 30%, var(--bridge-border))' }}>
                            <Trash2 className="h-4 w-4" /> Delete account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── NOTIFICATIONS ── */}
                  {activeSection === 'notifications' && (
                    <div className="space-y-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                          <Bell className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Notifications</h2>
                          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Control what you hear from Bridge</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <SectionLabel>Email</SectionLabel>
                        <div className="divide-y divide-[var(--bridge-border)]">
                          {[
                            { key: 'email_notifications', label: 'General updates', description: 'Important updates about your account' },
                            { key: 'session_reminders',   label: 'Session reminders', description: 'Reminders before upcoming sessions' },
                            { key: 'mentor_updates',      label: 'Mentor updates', description: 'Updates from mentors you follow' },
                            { key: 'marketing_emails',    label: 'Marketing', description: 'Promotions and feature announcements' },
                          ].map(item => (
                            <ToggleRow key={item.key} label={item.label} description={item.description}
                              checked={settings.notifications[item.key]}
                              onChange={v => updateSettings('notifications', item.key, v)} />
                          ))}
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-1">
                        <SectionLabel>Push & SMS</SectionLabel>
                        <div className="divide-y divide-[var(--bridge-border)]">
                          {[
                            { key: 'push_notifications', label: 'Browser push', description: 'Notifications in your browser' },
                            { key: 'sms_notifications',  label: 'SMS', description: 'Text messages for critical updates' },
                          ].map(item => (
                            <ToggleRow key={item.key} label={item.label} description={item.description}
                              checked={settings.notifications[item.key]}
                              onChange={v => updateSettings('notifications', item.key, v)} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── APPEARANCE ── */}
                  {activeSection === 'appearance' && (
                    <div className="space-y-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                          <Palette className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Appearance</h2>
                          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Changes apply live across the whole site</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <SectionLabel>Theme</SectionLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark',  label: 'Dark',  icon: Moon },
                            { value: 'system',label: 'System',icon: Monitor },
                          ].map(({ value, label, icon: Icon }) => {
                            const active = settings.appearance.theme === value;
                            return (
                              <button key={value} type="button" onClick={() => updateSettings('appearance', 'theme', value)}
                                className={`flex flex-col items-center gap-2.5 rounded-2xl border p-4 text-center transition-all ${focusRing}`}
                                style={active ? {
                                  borderColor: 'color-mix(in srgb, var(--color-primary) 60%, transparent)',
                                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--bridge-surface))',
                                  boxShadow: '0 6px 20px -6px color-mix(in srgb, var(--color-primary) 30%, transparent)',
                                } : { borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
                                <Icon className="h-5 w-5" style={{ color: active ? 'var(--color-primary)' : 'var(--bridge-text-muted)' }} aria-hidden />
                                <span className="text-[13px] font-semibold" style={{ color: active ? 'var(--color-primary)' : 'var(--bridge-text-secondary)' }}>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-4">
                        <SectionLabel>Language & Region</SectionLabel>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>{t('settings.language', 'Language')}</label>
                            <select value={settings.appearance.language} onChange={e => updateSettings('appearance', 'language', e.target.value)}
                              className={selectClass} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents}>
                              {LANGUAGE_OPTIONS.map(lang => <option key={lang.code} value={lang.code}>{lang.label}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>{t('settings.timezone', 'Timezone')}</label>
                            <select value={settings.appearance.timezone} onChange={e => updateSettings('appearance', 'timezone', e.target.value)}
                              className={selectClass} style={{ borderColor: 'var(--bridge-border)' }} {...inputEvents}>
                              {['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo'].map(tz => (
                                <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-4">
                        <SectionLabel>Display</SectionLabel>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-semibold" style={{ color: 'var(--bridge-text-secondary)' }}>Font size</label>
                          <select value={settings.appearance.font_size} onChange={e => updateSettings('appearance', 'font_size', e.target.value)}
                            className={selectClass} style={{ borderColor: 'var(--bridge-border)', maxWidth: '14rem' }} {...inputEvents}>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                          </select>
                        </div>
                        <ToggleRow label="High contrast" description="Increase contrast for better visibility"
                          checked={settings.appearance.high_contrast}
                          onChange={v => updateSettings('appearance', 'high_contrast', v)} />
                      </div>
                    </div>
                  )}

                  {/* ── PRIVACY ── */}
                  {activeSection === 'privacy' && (
                    <div className="space-y-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                          <Shield className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Privacy & Security</h2>
                          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Control your visibility and data</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <SectionLabel>Profile visibility</SectionLabel>
                        <select value={settings.privacy.profile_visibility} onChange={e => updateSettings('privacy', 'profile_visibility', e.target.value)}
                          className={selectClass} style={{ borderColor: 'var(--bridge-border)', maxWidth: '16rem' }} {...inputEvents}>
                          <option value="public">Everyone</option>
                          <option value="mentors">Only Mentors</option>
                          <option value="private">Only Me</option>
                        </select>
                      </div>

                      <Divider />

                      <div className="space-y-1">
                        <SectionLabel>Contact information</SectionLabel>
                        <div className="divide-y divide-[var(--bridge-border)]">
                          {[
                            { key: 'show_email',          label: 'Show email',         description: 'Display email on your public profile' },
                            { key: 'show_phone',          label: 'Show phone',          description: 'Display phone on your public profile' },
                            { key: 'allow_mentor_contact',label: 'Allow direct contact',description: 'Mentors can message you directly' },
                          ].map(item => (
                            <ToggleRow key={item.key} label={item.label} description={item.description}
                              checked={settings.privacy[item.key]}
                              onChange={v => updateSettings('privacy', item.key, v)} />
                          ))}
                        </div>
                      </div>

                      <Divider />

                      <div className="space-y-1">
                        <SectionLabel>Data sharing</SectionLabel>
                        <ToggleRow label="Share anonymized usage data" description="Help improve Bridge — no personally identifiable data"
                          checked={settings.privacy.data_sharing}
                          onChange={v => updateSettings('privacy', 'data_sharing', v)} />
                      </div>
                    </div>
                  )}

                  {/* ── BILLING ── */}
                  {activeSection === 'billing' && (
                    <div className="space-y-7">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}>
                          <CreditCard className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--bridge-text)' }}>Billing & Subscription</h2>
                          <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Manage your plan and payment</p>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-2xl p-6 text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover, color-mix(in srgb, var(--color-primary) 70%, #000)))' }}>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-75">Current plan</p>
                        <p className="mt-1 font-display text-2xl font-black capitalize">{settings.billing.plan}</p>
                        <p className="mt-1.5 text-sm opacity-80">
                          {settings.billing.plan === 'free'
                            ? 'Access the directory and book individual sessions.'
                            : 'Unlimited access to all mentors and premium features.'}
                        </p>
                        <button className={`mt-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold transition hover:opacity-90 ${focusRing}`}
                          style={{ color: 'var(--color-primary)' }}>
                          {settings.billing.plan === 'free' ? 'Upgrade plan' : 'Manage subscription'}
                        </button>
                      </div>

                      <div className="space-y-3">
                        <SectionLabel>Payment method</SectionLabel>
                        {settings.billing.payment_method ? (
                          <div className="flex items-center justify-between rounded-xl border p-4" style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5" style={{ color: 'var(--bridge-text-muted)' }} />
                              <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--bridge-text)' }}>Visa ending in 4242</p>
                                <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>Expires 12/24</p>
                              </div>
                            </div>
                            <button className={`text-sm font-semibold ${focusRing} rounded-sm`} style={{ color: 'var(--color-primary)' }}>Update</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center rounded-xl border border-dashed py-8 text-center"
                            style={{ borderColor: 'var(--bridge-border)', backgroundColor: 'var(--bridge-surface-muted)' }}>
                            <CreditCard className="mb-3 h-7 w-7" style={{ color: 'var(--bridge-text-faint)' }} />
                            <p className="mb-4 text-sm" style={{ color: 'var(--bridge-text-muted)' }}>No payment method on file</p>
                            <button className={`inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 ${focusRing}`}
                              style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 20px -6px color-mix(in srgb, var(--color-primary) 50%, transparent)' }}>
                              Add payment method
                            </button>
                          </div>
                        )}
                      </div>

                      <Divider />

                      <ToggleRow label="Auto-renew subscription" description="Automatically renew before your plan expires"
                        checked={settings.billing.auto_renew}
                        onChange={v => updateSettings('billing', 'auto_renew', v)} />
                    </div>
                  )}

                </div>
              </div>

              {/* Save bar */}
              <div className="mt-5 flex justify-end">
                <button onClick={saveSettings} disabled={saving}
                  className={`btn-sheen inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-55 ${focusRing}`}
                  style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 12px 30px -8px color-mix(in srgb, var(--color-primary) 55%, transparent)' }}>
                  {saving ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Saving…</>
                  ) : (
                    <><Save className="h-4 w-4" />Save settings</>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>{/* /max-w-7xl */}

        {/* Delete confirm modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xl" onClick={() => setShowDeleteConfirm(false)} aria-hidden />
            <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-float">
              <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
              <div className="relative p-7 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-[0_10px_24px_-6px_rgba(239,68,68,0.5)]">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-semibold" style={{ color: 'var(--bridge-text)' }}>Delete account</h3>
                </div>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--bridge-text-secondary)' }}>
                  This cannot be undone. All your profile data, session history, and settings will be permanently deleted.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${focusRing}`}
                    style={{ backgroundColor: 'var(--bridge-surface-muted)', color: 'var(--bridge-text-secondary)', boxShadow: 'inset 0 0 0 1px var(--bridge-border)' }}>
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount}
                    className={`btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_-4px_rgba(239,68,68,0.5)] transition hover:-translate-y-0.5 ${focusRing}`}>
                    <AlertTriangle className="h-4 w-4" />
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
