import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

const ClientRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.getFoodRequests();
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.updateFoodRequest(id, { status });
      toast.success(`Request marked as ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status] || styles.pending}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Client Requests
            </h1>
            <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              View and manage incoming food assistance requests
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#E2E8F0] p-12 text-center">
              <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>No client requests yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4" data-testid="client-requests-list">
              {requests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(request.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'JetBrains Mono, monospace' }} data-testid={`request-confirmation-${request.confirmation_number}`}>
                            {request.confirmation_number}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Pickup Date</p>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{request.pickup_date}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Pickup Time</p>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{request.pickup_time}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Location</p>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{request.location_id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Household Size</p>
                            <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{request.household_size} people</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Requested Items</p>
                          <div className="flex flex-wrap gap-2">
                            {request.items && request.items.length > 0 ? (
                              request.items.map((item, idx) => (
                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {item.name} ({item.quantity})
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No items specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateStatus(request.id, 'completed')}
                          data-testid={`complete-request-${request.id}`}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete
                        </Button>
                        <Button
                          onClick={() => updateStatus(request.id, 'cancelled')}
                          data-testid={`cancel-request-${request.id}`}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientRequests;
