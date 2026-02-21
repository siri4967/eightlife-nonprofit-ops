import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, Package, Loader2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [donorImpact, setDonorImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setError(null);
      const response = await api.getDonorImpact();
      setDonorImpact(response.data);
    } catch (error) {
      setError('Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!donorImpact) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Distributions', donorImpact.total_distributions],
      ['Total Households Served', donorImpact.total_households_served],
      ['Total Individuals Served', donorImpact.total_individuals_served],
      ['Report Date', new Date(donorImpact.report_date).toLocaleDateString()],
      [''],
      ['Source Breakdown', ''],
      ...Object.entries(donorImpact.source_breakdown || {}).map(([source, qty]) => [source, qty])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eightlife-donor-impact-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report exported successfully');
  };

  const handleDownloadPDF = () => {
    toast.info('PDF feature coming soon');
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
              <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>Loading reports...</p>
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
              <Button onClick={fetchReports} className="mt-4">
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Reports
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Monthly service reports and donor impact metrics
              </p>
            </div>
            <Button 
              onClick={exportToCSV}
              data-testid="export-csv-button"
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {/* Donor Impact Report Card */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white" data-testid="donor-impact-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Donor Impact Report Card
              </h2>
              <Button
                onClick={handleDownloadPDF}
                data-testid="download-pdf-button"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 p-6 rounded-xl" data-testid="impact-individuals">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Individuals Served</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {donorImpact?.total_individuals_served || 0}
                </p>
                <p className="text-sm text-green-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  +{donorImpact?.yoy_growth || 0}% YoY
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl" data-testid="impact-households">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Avg Households/Month</p>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {donorImpact?.avg_households_per_month || 0}
                </p>
                <p className="text-sm text-blue-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Peak: {donorImpact?.peak_households || 0} in {donorImpact?.peak_month || 'N/A'}
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl" data-testid="impact-waste">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Waste Reduction</p>
                  </div>
                </div>
                <p className="text-4xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {donorImpact?.waste_reduction || 0}%
                </p>
              </div>

              <div className="bg-white/10 p-6 rounded-xl" data-testid="impact-capacity">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Capacity Increase</p>
                  </div>
                </div>
                <p className="text-4xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {donorImpact?.capacity_increase || 0}%
                </p>
              </div>
            </div>
          </Card>

          {/* Distribution Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6" data-testid="report-total-distributions">
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Total Distributions</p>
              <p className="text-4xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {donorImpact?.total_distributions || 0}
              </p>
            </Card>
            <Card className="p-6" data-testid="report-total-households">
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Households Served</p>
              <p className="text-4xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {donorImpact?.total_households_served || 0}
              </p>
            </Card>
            <Card className="p-6" data-testid="report-total-individuals">
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Individuals Served</p>
              <p className="text-4xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {donorImpact?.total_individuals_served || 0}
              </p>
            </Card>
          </div>

          {/* Source Breakdown */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Source Breakdown
            </h2>
            {Object.keys(donorImpact?.source_breakdown || {}).length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>No source data available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(donorImpact?.source_breakdown || {}).map(([source, qty]) => (
                  <div key={source} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg" data-testid={`source-${source.toLowerCase().replace(/\s+/g, '-')}`}>
                    <span className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {source}
                    </span>
                    <span className="text-lg font-bold text-[#0F172A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {qty} units
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              <strong>Report Date:</strong> {donorImpact?.report_date ? new Date(donorImpact.report_date).toLocaleString() : 'N/A'}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
