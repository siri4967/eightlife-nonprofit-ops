import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Package, Users, AlertCircle, TrendingUp, Send, Share2, QrCode, Copy, RefreshCw, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchNextEvent();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await api.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      setError('Failed to load dashboard stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNextEvent = async () => {
    try {
      const response = await api.getNextEvent();
      setNextEvent(response.data);
    } catch (error) {
      console.error('Failed to load event', error);
    }
  };

  const handleSendSMS = async () => {
    try {
      const response = await api.sendSMS();
      toast.success(`SMS sent to ${response.data.count} volunteers`);
    } catch (error) {
      toast.error('Failed to send SMS');
    }
  };

  const handleCopyLink = () => {
    if (nextEvent?.share_url) {
      navigator.clipboard.writeText(nextEvent.share_url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShareTwitter = () => {
    if (nextEvent) {
      const text = encodeURIComponent(`${nextEvent.name} - ${nextEvent.description}. Request food assistance:`);
      const url = encodeURIComponent(nextEvent.share_url);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
  };

  const handleShowQR = () => {
    toast.info('QR Code: Scan to access /request portal', { duration: 3000 });
  };

  const statCards = [
    {
      label: 'Total Inventory Items',
      value: stats?.total_inventory_items || 0,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      testId: 'stat-total-inventory'
    },
    {
      label: 'Pending Requests',
      value: stats?.pending_requests || 0,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      testId: 'stat-pending-requests'
    },
    {
      label: 'Expiring Soon',
      value: stats?.expiring_soon || 0,
      icon: AlertCircle,
      color: 'bg-yellow-50 text-yellow-600',
      testId: 'stat-expiring-soon'
    },
    {
      label: 'Low Stock Items',
      value: stats?.low_stock_items || 0,
      icon: TrendingUp,
      color: 'bg-red-50 text-red-600',
      testId: 'stat-low-stock'
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-16 p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#0F172A] mx-auto mb-4" />
              <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Loading dashboard...</p>
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
              <Button onClick={fetchStats} className="mt-4" data-testid="retry-button">
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
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome to Eightlife operations center
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.testId} className="p-6" data-testid={stat.testId}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  onClick={handleSendSMS}
                  data-testid="quick-action-send-sms"
                  className="w-full justify-start bg-[#0F172A] hover:bg-[#1E293B] text-white h-11"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send SMS to Volunteers
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Alerts Overview
              </h3>
              <div className="space-y-3">
                {stats?.expiring_soon > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg" data-testid="alert-expiring-soon">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stats.expiring_soon} items expiring within 7 days
                      </p>
                    </div>
                  </div>
                )}
                {stats?.low_stock_items > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg" data-testid="alert-low-stock">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {stats.low_stock_items} items running low on stock
                      </p>
                    </div>
                  </div>
                )}
                {stats?.expiring_soon === 0 && stats?.low_stock_items === 0 && (
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No active alerts at this time
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Share Widget */}
          {nextEvent && (
            <Card className="p-6 bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white" data-testid="share-widget">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm opacity-80 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Next Event</p>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {nextEvent.name}
                  </h3>
                  <p className="text-sm opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {nextEvent.description}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleShowQR}
                    data-testid="share-qr-button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    data-testid="share-copy-button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={handleShareTwitter}
                    data-testid="share-twitter-button"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
