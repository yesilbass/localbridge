export default function StepFooter({ primaryLabel, onPrimary, secondaryLabel, onSecondary, disabled }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {secondaryLabel ? (
        <button
          type="button"
          onClick={onSecondary}
          className="bridge-focus rounded-full px-4 py-2 text-sm font-bold transition-colors"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--bridge-text-secondary)',
            boxShadow: 'inset 0 0 0 1px var(--bridge-border)',
          }}
        >
          {secondaryLabel}
        </button>
      ) : null}
      {primaryLabel ? (
        <button
          type="button"
          onClick={onPrimary}
          disabled={disabled}
          className="bridge-focus rounded-full px-5 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            opacity: disabled ? 0.55 : 1,
          }}
        >
          {primaryLabel}
        </button>
      ) : null}
    </div>
  );
}
