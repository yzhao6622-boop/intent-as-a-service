import React, { useState } from 'react';
import apiClient from '../api/client';
import { useToast, ToastContainer } from './Toast';
import { LoadingSpinner } from './Loading';

interface CreateIntentProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateIntent({ onClose, onSuccess }: CreateIntentProps) {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError('请输入您的意图描述');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/intents/create', { userInput });
      toast.success('意图创建成功！AI正在分析...');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      console.error('创建意图错误:', err);
      console.error('错误详情:', err.response?.data);
      
      // 获取详细的错误信息
      let errorMsg = '创建意图失败';
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.message) {
        errorMsg = err.message;
      } else if (err.response?.status === 500) {
        errorMsg = '服务器内部错误，请查看后端日志获取详细信息';
      }
      
      // 如果是多行错误信息，显示完整内容
      setError(errorMsg);
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4">
        <h2 className="text-2xl font-bold mb-4">创建新意图</h2>
        <p className="text-gray-600 mb-4">
          请描述您的真实意图。AI将分析并生成一个可验证的意图档案。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述您的意图
            </label>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="例如：我打算在90天内，从零基础转行做前端工程师"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  AI分析中...
                </>
              ) : (
                '创建意图'
              )}
            </button>
          </div>
        </form>
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </div>
    </div>
  );
}
