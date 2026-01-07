import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

interface MarketplaceListing {
  id: number;
  intent_id: number;
  title: string;
  description: string;
  category: string;
  credibility_score: number;
  time_window_days: number;
  price?: number;
  transaction_type: string;
  seller_name?: string;
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [minCredibility, setMinCredibility] = useState('');

  useEffect(() => {
    fetchListings();
  }, [category, minCredibility]);

  const fetchListings = async () => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (minCredibility) params.min_credibility = minCredibility;

      const response = await apiClient.get('/marketplace/browse', { params });
      setListings(response.data);
    } catch (error) {
      console.error('获取市场列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (marketplaceId: number) => {
    // 使用更友好的确认对话框
    if (!window.confirm('确定要购买/订阅这个意图吗？')) return;

    try {
      await apiClient.post(`/marketplace/purchase/${marketplaceId}`);
      // 使用toast替代alert
      if (window.toast) {
        window.toast.success('购买成功！');
      } else {
        alert('购买成功！');
      }
      fetchListings();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '购买失败';
      if (window.toast) {
        window.toast.error(errorMsg);
      } else {
        alert(errorMsg);
      }
    }
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

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">暂无可用意图</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {listing.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {listing.category}
                  </span>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">可信度:</span>
                    <span className="ml-1 font-semibold text-green-600">
                      {listing.credibility_score.toFixed(0)}
                    </span>
                  </div>
                </div>

                {listing.price && (
                  <div className="text-lg font-bold text-indigo-600 mb-4">
                    ¥{listing.price}
                  </div>
                )}

                <button
                  onClick={() => handlePurchase(listing.id)}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  购买/订阅
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
