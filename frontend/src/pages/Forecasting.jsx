import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Forecasting = () => {
  const [forecastData, setForecastData] = useState([]);
  const [logisticsData, setLogisticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [forecastRes, logisticsRes] = await Promise.all([
        api.getForecast(),
        api.getLogisticsPlanning()
      ]);
      setForecastData(forecastRes.data);
      setLogisticsData(logisticsRes.data);
    } catch (error) {
      setError('Failed to load forecasting data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'on_track') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          On Track
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
        <AlertTriangle className="w-3 h-3" />
        Low Awareness Area
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-16 p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#0F172A] mx-auto mb-4" />
              <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Loading forecasting data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-16 p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-900 text-lg mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{error}</p>
              <Button onClick={fetchData} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Demand Forecasting
            </h1>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Statistical forecasting based on historical distribution data
            </p>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Monthly Trend Analysis
            </h2>
            {forecastData.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Not enough data for forecasting. Log more distributions to see trends.
                </p>
              </div>
            ) : (
              <div className="h-96" data-testid="forecast-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="month" 
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                      stroke="#64748B"
                    />
                    <YAxis 
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                      stroke="#64748B"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_households" 
                      stroke="#0F172A" 
                      strokeWidth={2}
                      name="Avg Households"
                      dot={{ fill: '#0F172A', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avg_individuals" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Avg Individuals"
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Distribution Logistics Planning Table */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Distribution Logistics Planning
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="logistics-planning-table">
                <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Expected Households</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Volunteers Needed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {logisticsData.map((row) => {
                    const slotsOpen = row.volunteers_needed - row.volunteers_confirmed;
                    return (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {row.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {row.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {row.expected_households}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span style={{ fontFamily: 'Inter, sans-serif' }}>
                            {slotsOpen} slots open
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(row.status)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Historical Data Table */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0]">
              <h2 className="text-lg font-semibold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Historical Data
              </h2>
            </div>
            <table className="w-full" data-testid="forecast-table">
              <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Avg Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Avg Individuals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Distributions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {forecastData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      Not enough data for forecasting. Log more distributions to see trends.
                    </td>
                  </tr>
                ) : (
                  forecastData.map((row, idx) => (
                    <tr key={idx} className={row.month === 'Forecast' ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {row.month === 'Forecast' ? '🔮 ' : ''}{row.month}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.avg_households}</td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.avg_individuals}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{row.total_distributions}</td>
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

export default Forecasting;
