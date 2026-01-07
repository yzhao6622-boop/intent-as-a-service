import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import apiClient from '../api/client';
import ConfirmDialog from './ConfirmDialog';
import { useToast, ToastContainer } from './Toast';

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

export default function IntentList({ intents, onUpdate }: IntentListProps) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

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

  const handleDeleteClick = (e: React.MouseEvent, intentId: number) => {
    e.stopPropagation(); // 阻止点击事件冒泡到卡片
    setDeleteConfirm(intentId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/intents/${deleteConfirm}`);
      toast.success('意图已删除');
      setDeleteConfirm(null);
      onUpdate(); // 刷新列表
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '删除失败';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  if (intents.length === 0) {
    return null; // 空状态由父组件处理
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {intents.map((intent) => (
          <div
            key={intent.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition relative"
          >
            <div
              onClick={() => navigate(`/intent/${intent.id}`)}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 flex-1 pr-2">
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

            {/* 删除按钮 */}
            <button
              onClick={(e) => handleDeleteClick(e, intent.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-1"
              title="删除意图"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 删除确认对话框 */}
      {deleteConfirm && (
        <ConfirmDialog
          title="确认删除"
          message="确定要删除这个意图吗？此操作不可恢复。"
          confirmText="删除"
          cancelText="取消"
          type="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </>
  );
}
