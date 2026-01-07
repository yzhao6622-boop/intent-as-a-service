import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import CreateIntent from './CreateIntent';
import IntentList from './IntentList';
import Loading from './Loading';
import EmptyState from './EmptyState';
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      setError('');
      console.log('正在获取意图列表...');
      const response = await apiClient.get('/intents/list');
      console.log('获取意图列表成功:', response.data);
      setIntents(response.data);
    } catch (err: any) {
      console.error('获取意图列表失败:', err);
      let errorMsg = '获取意图列表失败';
      
      if (err.response) {
        // 服务器返回了错误响应
        errorMsg = err.response.data?.error || `服务器错误: ${err.response.status}`;
      } else if (err.request) {
        // 请求已发出但没有收到响应
        errorMsg = '无法连接到服务器，请检查网络连接和后端服务是否运行';
      } else {
        // 其他错误
        errorMsg = err.message || '获取意图列表失败';
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const emptyStateAction = {
    label: '创建新意图',
    onClick: () => setShowCreate(true),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="加载意图列表..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">
                Intent-as-a-Service
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎, {user?.email}</span>
              <button
                onClick={() => navigate('/marketplace')}
                className="text-gray-700 hover:text-indigo-600"
              >
                市场
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-indigo-600"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">我的意图</h2>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            + 创建新意图
          </button>
        </div>

        {showCreate && (
          <CreateIntent
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setShowCreate(false);
              toast.success('意图创建成功！');
              fetchIntents();
            }}
          />
        )}

        {error && !loading && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={fetchIntents}
              className="ml-4 text-red-600 underline hover:text-red-800"
            >
              重试
            </button>
          </div>
        )}

        {!loading && intents.length === 0 && !error ? (
          <EmptyState
            title="还没有创建任何意图"
            description="点击「创建新意图」开始您的第一个意图"
            action={emptyStateAction}
            icon="🎯"
          />
        ) : (
          <IntentList intents={intents} onUpdate={fetchIntents} />
        )}

        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </main>
    </div>
  );
}
