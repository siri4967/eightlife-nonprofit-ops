import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Card } from '@/components/ui/card';

const Donations = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.getInventory();
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const sources = ['Donation', 'USDA', 'Second Harvest Heartland'];
  const sourceStats = sources.map(source => {
    const items = inventory.filter(item => item.source === source);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    return { source, count: items.length, totalQty };
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Donation Tracking
            </h1>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track incoming donations and sources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {sourceStats.map((stat) => (
              <Card key={stat.source} className="p-6" data-testid={`donation-source-${stat.source.toLowerCase().replace(/\s+/g, '-')}`}>
                <h3 className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stat.source}
                </h3>
                <p className="text-3xl font-bold text-[#0F172A] mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {stat.count}
                </p>
                <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total units: {stat.totalQty}
                </p>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-semibold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Recent Donations
              </h2>
            </div>
            <table className="w-full" data-testid="donations-table">
              <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Received Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No donations recorded yet
                    </td>
                  </tr>
                ) : (
                  inventory.slice(0, 20).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{item.item_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{item.source}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.quantity} {item.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.received_date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Donations;
