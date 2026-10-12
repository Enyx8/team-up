import type { ToastMessage } from '../types'

type ToastRegionProps = {
  toasts: ToastMessage[]
}

export function ToastRegion({ toasts }: ToastRegionProps) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className="toast" key={toast.id}>
          <div className="toast-icon">✳</div>
          <div>
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
