export default function ErrorState({
  message = 'تعذّر تحميل البيانات الآن. تحقق من اتصالك وحاول مجددًا.',
  onRetry
}) {
  return (
    <div className="error-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v5M12 16h.01" />
      </svg>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
