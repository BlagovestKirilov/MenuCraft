export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
