import { useState } from 'react';

let toastId = 0;
let setToastsGlobal = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  setToastsGlobal = setToasts;

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          <span className="toast-icon">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export const toast = {
  success: (message) => addToast(message, 'success'),
  error: (message) => addToast(message, 'error'),
  info: (message) => addToast(message, 'info'),
};

function addToast(message, type) {
  const id = ++toastId;
  if (setToastsGlobal) {
    setToastsGlobal(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      if (setToastsGlobal) setToastsGlobal(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }
}
