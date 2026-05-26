/**
 * 显示错误提示消息
 * @param {string} message - 错误消息内容
 */
export function showError(message) {
  // 移除已有的toast，避免叠加
  const existingToasts = document.querySelectorAll('.error-toast, .success-toast')
  existingToasts.forEach(t => {
    t.style.animation = 'slideUp 0.3s ease-out'
    setTimeout(() => t.remove(), 300)
  })

  // 创建提示元素
  const toast = document.createElement('div')
  toast.className = 'error-toast'
  toast.textContent = message
  
  // 添加样式
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: '9999',
    fontSize: '14px',
    animation: 'slideDown 0.3s ease-out'
  })
  
  // 添加到页面
  document.body.appendChild(toast)
  
  // 3秒后自动消失
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

/**
 * 显示成功提示消息
 * @param {string} message - 成功消息内容
 */
export function showSuccess(message) {
  // 移除已有的toast，避免叠加
  const existingToasts = document.querySelectorAll('.error-toast, .success-toast')
  existingToasts.forEach(t => {
    t.style.animation = 'slideUp 0.3s ease-out'
    setTimeout(() => t.remove(), 300)
  })

  const toast = document.createElement('div')
  toast.className = 'success-toast'
  toast.textContent = message
  
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#52c41a',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: '9999',
    fontSize: '14px',
    animation: 'slideDown 0.3s ease-out'
  })
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 2000)
}

// 添加动画样式
const style = document.createElement('style')
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }
`
document.head.appendChild(style)