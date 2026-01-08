import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import Loading from './Loading';
import EmptyState from './EmptyState';
import { useToast, ToastContainer } from './Toast';

interface MarketplaceListing {
  id?: number;
  intent_id: number;
  marketplace_id?: number;
  title: string;
  description: string;
  category: string;
  credibility_score: number;
  time_window_days: number;
  price?: number;
  transaction_type?: string;
  seller_name?: string;
  seller_email?: string;
  status?: string;
  marketplace_status?: string;
  created_at?: string;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [minCredibility, setMinCredibility] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchListings();
  }, [category, minCredibility]);

  const fetchListings = async () => {
    try {
      setError('');
      const params: any = {};
      if (category) params.category = category;
      if (minCredibility) params.min_credibility = minCredibility;

      const response = await apiClient.get('/marketplace/browse', { params });
      setListings(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '获取市场列表失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (listing: MarketplaceListing) => {
    // 如果已经在市场发布，使用marketplace_id
    const marketplaceId = listing.marketplace_id || listing.id;
    if (!marketplaceId) {
      toast.error('该意图暂不可购买');
      return;
    }

    if (!window.confirm('确定要购买/订阅这个意图吗？')) return;

    try {
      const response = await apiClient.post(`/marketplace/purchase/${marketplaceId}`);
      toast.success('订阅成功！已添加到"我的意图"中');
      fetchListings();
      
      // 提示用户返回查看
      if (window.confirm('订阅成功！是否返回"我的意图"查看？')) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || '购买失败';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="加载市场列表..." size="lg" />
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
        <h2 className="text-3xl font-bold mb-6">意图市场</h2>

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                类别筛选
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">全部</option>
                <option value="职业转型">职业转型</option>
                <option value="医疗决策">医疗决策</option>
                <option value="大额消费">大额消费</option>
                <option value="关系决策">关系决策</option>
                <option value="学习成长">学习成长</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最低可信度
              </label>
              <input
                type="number"
                value={minCredibility}
                onChange={(e) => setMinCredibility(e.target.value)}
                placeholder="例如: 70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {error && !loading && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={fetchListings}
              className="ml-4 text-red-600 underline hover:text-red-800"
            >
              重试
            </button>
          </div>
        )}

        {!loading && listings.length === 0 && !error ? (
          <EmptyState
            title="暂无可用意图"
            description="当前市场中没有可用的意图"
            icon="📋"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <div
                key={listing.intent_id || listing.id || index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold flex-1 pr-2">{listing.title}</h3>
                  {listing.marketplace_status === 'available' && (
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                      已发布
                    </span>
                  )}
                </div>

                {/* 显示用户名（已脱敏） */}
                {listing.seller_email && (
                  <div className="text-xs text-gray-500 mb-2">
                    发布者: {listing.seller_email}
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {listing.category}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">可信度:</span>
                    <span
                      className={`ml-1 font-semibold ${
                        listing.credibility_score >= 70
                          ? 'text-green-600'
                          : listing.credibility_score >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {listing.credibility_score.toFixed(0)}
                    </span>
                  </div>
                </div>

                {listing.price && (
                  <div className="text-lg font-bold text-indigo-600 mb-4">
                    ¥{listing.price}
                  </div>
                )}

                {listing.time_window_days && (
                  <div className="text-xs text-gray-500 mb-4">
                    时间窗口: {listing.time_window_days} 天
                  </div>
                )}

                <button
                  onClick={() => handlePurchase(listing)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {listing.marketplace_status === 'available' ? '购买/订阅' : '查看详情'}
                </button>
              </div>
            ))}
          </div>
        )}

        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </main>
    </div>
  );
}
