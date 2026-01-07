import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Intent {
  id: number;
  title: string;
  description: string;
  category: string;
  credibility_score: number;
  status: string;
  created_at: string;
}

interface IntentListProps {
  intents: Intent[];
  onUpdate: () => void;
}

export default function IntentList({ intents }: IntentListProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'abandoned':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      active: '进行中',
      completed: '已完成',
      abandoned: '已放弃',
      paused: '已暂停',
    };
    return statusMap[status] || status;
  };

  if (intents.length === 0) {
    return null; // 空状态由父组件处理
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {intents.map((intent) => (
        <div
          key={intent.id}
          onClick={() => navigate(`/intent/${intent.id}`)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
              {intent.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                intent.status
              )}`}
            >
              {getStatusText(intent.status)}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {intent.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {intent.category}
              </span>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">可信度:</span>
                <span
                  className={`ml-1 font-semibold ${
                    intent.credibility_score >= 70
                      ? 'text-green-600'
                      : intent.credibility_score >= 50
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {intent.credibility_score.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            {format(new Date(intent.created_at), 'yyyy-MM-dd HH:mm')}
          </div>
        </div>
      ))}
    </div>
  );
}
