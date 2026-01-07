export default function Loading({ text = '加载中...', size = 'md' }: { text?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}></div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
}

export function LoadingSpinner({ className = '', color = 'white' }: { className?: string; color?: 'white' | 'gray' | 'indigo' }) {
  const colorClasses = {
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    indigo: 'border-indigo-600 border-t-transparent',
  };
  
  return (
    <div className={`inline-block w-4 h-4 border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`}></div>
  );
}
