import React from 'react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useAppContext();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast">
          {toast.type === 'success' && <CheckCircle className="text-green-500" style={{color: '#22c55e'}} size={20} />}
          {toast.type === 'warning' && <AlertTriangle className="text-yellow-500" style={{color: '#f59e0b'}} size={20} />}
          {toast.type === 'error' && <XCircle className="text-red-500" style={{color: '#ef4444'}} size={20} />}
          {toast.type === 'info' && <Info className="text-blue-500" style={{color: '#3b82f6'}} size={20} />}
          <span style={{ fontWeight: 500 }}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
