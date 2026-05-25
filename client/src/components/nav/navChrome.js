/** Shared class strings — flat editorial chrome, minimal pill/bubble shapes */

export function navTextTone(active, isAuthPage) {
  if (isAuthPage) {
    return active ? 'text-[#0c0a09]' : 'text-[#78716c] hover:text-[#0c0a09]';
  }
  return active
    ? 'text-[var(--bridge-text)]'
    : 'text-[var(--bridge-text-secondary)] hover:text-[var(--bridge-text)]';
}

export const navFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bridge-canvas)]';

export const navTriggerDesktop =
  `inline-flex items-center gap-0.5 border-b-2 border-transparent py-3.5 text-[15px] font-medium tracking-[-0.01em] transition-colors ${navFocus}`;

export const navLinkDesktop =
  `inline-flex items-center gap-1.5 border-b-2 border-transparent py-3.5 text-[15px] font-medium tracking-[-0.01em] transition-colors ${navFocus}`;

export const navLinkActiveBorder = 'border-[var(--color-primary)]';
export const navLinkActiveBorderAuth = 'border-[#0c0a09]';

export const navMenuPanel =
  'absolute left-0 top-full z-50 min-w-[12rem] border py-1 shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--bridge-text)_18%,transparent)]';

export const navMenuPanelStyle = {
  backgroundColor: 'var(--bridge-surface-raised)',
  borderColor: 'var(--bridge-border)',
  borderRadius: '6px',
};

export const navMenuItem =
  'block w-full px-3 py-2.5 text-left text-[15px] font-medium transition-colors';

export const navCtaDesktop =
  `ml-3 inline-flex items-center rounded-md px-4 py-2.5 text-[15px] font-semibold transition-colors ${navFocus}`;
