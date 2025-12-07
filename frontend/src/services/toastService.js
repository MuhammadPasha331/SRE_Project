// Simple toast notification system
let toastContainer = null;

const getToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      font-family: inherit;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const createToastElement = (message, type) => {
  const toast = document.createElement('div');
  const bgColor = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
  }[type] || '#17a2b8';

  const textColor = type === 'warning' ? '#000' : '#fff';

  toast.style.cssText = `
    background-color: ${bgColor};
    color: ${textColor};
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 4000);

  return toast;
};

// Add CSS animations if not already present
if (!document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

export const toast = {
  success: (message) => {
    getToastContainer().appendChild(createToastElement(message, 'success'));
  },
  error: (message) => {
    getToastContainer().appendChild(createToastElement(message, 'error'));
  },
  warning: (message) => {
    getToastContainer().appendChild(createToastElement(message, 'warning'));
  },
  info: (message) => {
    getToastContainer().appendChild(createToastElement(message, 'info'));
  },
};

export default toast;
