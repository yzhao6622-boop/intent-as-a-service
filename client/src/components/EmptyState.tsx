interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

export default function EmptyState({ title, description, action, icon = '📋' }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
