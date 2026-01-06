import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import CreateIntent from './CreateIntent';
import IntentList from './IntentList';

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

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      const response = await apiClient.get('/intents/list');
      setIntents(response.data);
    } catch (error) {
      console.error('获取意图列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
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
              fetchIntents();
            }}
          />
        )}

        <IntentList intents={intents} onUpdate={fetchIntents} />
      </main>
    </div>
  );
}
