import { Sun, Moon, Monitor } from 'lucide-react';
import { useI18n } from '../i18n';
import { useCurrentTheme } from '../hooks/useCurrentTheme';
import { applyThemeChange } from '../utils/appearance';

const OPTIONS = [
  { value: 'light', labelKey: 'footer.light', fallback: 'Light', icon: Sun },
  { value: 'system', labelKey: 'footer.system', fallback: 'System', icon: Monitor },
  { value: 'dark', labelKey: 'footer.dark', fallback: 'Dark', icon: Moon },
];

export default function ThemeToggle({ variant = 'pill', className = '' }) {
  const { t } = useI18n();
  const [theme, setThemeState] = useCurrentTheme();

  function handleTheme(val) {
    setThemeState(val);
    applyThemeChange(val);
  }

  const isPlain = variant === 'plain';

  return (
    <div
      role="group"
      aria-label={t('footer.theme', 'Theme')}
      className={`inline-flex items-center gap-0.5 ${isPlain ? '' : 'rounded-xl p-0.5'} ${className}`}
      style={
        isPlain
          ? undefined
          : {
              backgroundColor: 'var(--bridge-surface-muted)',
              boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
            }
      }
    >
      {OPTIONS.map(({ value, labelKey, fallback, icon: Icon }) => {
        const active = theme === value;
        const label = t(labelKey, fallback);
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleTheme(value)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`flex items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              isPlain ? 'h-9 w-9' : 'h-7 w-7'
            }`}
            style={
              active
                ? isPlain
                  ? { color: 'var(--color-primary)' }
                  : { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                : { color: 'var(--bridge-text-muted)' }
            }
          >
            <Icon className={isPlain ? 'h-[18px] w-[18px]' : 'h-3.5 w-3.5'} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
