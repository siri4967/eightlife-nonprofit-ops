import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, Send, CheckCircle } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await api.resolveAlert(alertId);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
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

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-900';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getSeverityIcon = (severity) => {
    return <AlertCircle className={`w-5 h-5 ${
      severity === 'high' ? 'text-red-600' : 
      severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
    }`} />;
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Alerts & Notifications
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Monitor expiration risk and low stock alerts
              </p>
            </div>
            <Button 
              onClick={handleSendSMS}
              data-testid="send-sms-volunteers-button"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Send SMS to Volunteers
            </Button>
          </div>

          <div className="space-y-4" data-testid="alerts-list">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading alerts...</p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>No active alerts. Everything looks good!</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-6 rounded-lg border-2 ${getSeverityColor(alert.severity)} ${alert.resolved ? 'opacity-50' : ''}`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {alert.alert_type}
                          </h3>
                          <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium uppercase">
                            {alert.severity}
                          </span>
                          {alert.resolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {alert.message}
                        </p>
                        <p className="text-xs mt-2 opacity-70" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        onClick={() => handleResolve(alert.id)}
                        data-testid={`resolve-alert-${alert.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;
