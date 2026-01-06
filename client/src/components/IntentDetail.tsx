import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import AIChat from './AIChat';

interface IntentProfile {
  intent: {
    id: number;
    title: string;
    description: string;
    category: string;
    time_window_days: number;
    credibility_score: number;
    status: string;
    stage: string;
  };
  stages: Array<{
    id: number;
    stage_name: string;
    stage_order: number;
    description: string;
    completed: boolean;
  }>;
  credibility_score: number;
  progress_percentage: number;
  recent_verifications: Array<{
    id: number;
    verification_type: string;
    ai_analysis: string;
    passed: boolean;
    created_at: string;
  }>;
}

export default function IntentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<IntentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');

  useEffect(() => {
    fetchIntentDetail();
  }, [id]);

  const fetchIntentDetail = async () => {
    try {
      const response = await apiClient.get(`/intents/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('获取意图详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await apiClient.post(`/intents/${id}/verify`);
      fetchIntentDetail();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleTrack = async () => {
    try {
      await apiClient.post(`/intents/${id}/track`);
      fetchIntentDetail();
    } catch (error) {
      console.error('追踪失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">意图不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-indigo-600"
            >
              ← 返回
            </button>
            <h1 className="text-xl font-bold text-indigo-600">
              Intent-as-a-Service
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-bold mb-2">{profile.intent.title}</h2>
          <p className="text-gray-600 mb-6">{profile.intent.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">可信度评分</div>
              <div className="text-2xl font-bold text-blue-600">
                {profile.credibility_score.toFixed(0)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">进展</div>
              <div className="text-2xl font-bold text-green-600">
                {profile.progress_percentage.toFixed(0)}%
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">时间窗口</div>
              <div className="text-2xl font-bold text-purple-600">
                {profile.intent.time_window_days}天
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">当前阶段</div>
              <div className="text-lg font-bold text-orange-600">
                {profile.intent.stage}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleVerify}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              验证意图
            </button>
            <button
              onClick={handleTrack}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              追踪演进
            </button>
          </div>
        </div>

        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'chat'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500'
            }`}
          >
            AI对话
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">阶段拆解</h3>
              <div className="space-y-4">
                {profile.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className={`border-l-4 pl-4 ${
                      stage.completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {stage.stage_order}. {stage.stage_name}
                        </h4>
                        <p className="text-gray-600 mt-1">{stage.description}</p>
                      </div>
                      {stage.completed && (
                        <span className="text-green-600 font-semibold">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">最近验证记录</h3>
              <div className="space-y-4">
                {profile.recent_verifications.length === 0 ? (
                  <p className="text-gray-500">暂无验证记录</p>
                ) : (
                  profile.recent_verifications.map((verification) => (
                    <div
                      key={verification.id}
                      className={`border-l-4 pl-4 ${
                        verification.passed
                          ? 'border-green-500'
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {verification.verification_type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            verification.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {verification.passed ? '通过' : '未通过'}
                        </span>
                      </div>
                      <p className="text-gray-700">{verification.ai_analysis}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <AIChat intentId={parseInt(id!)} />
        )}
      </main>
    </div>
  );
}
