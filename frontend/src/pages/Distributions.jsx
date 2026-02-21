import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const Distributions = () => {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    location_id: '',
    households_served: '',
    individuals_served: '',
  });

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      const response = await api.getDistributions();
      setDistributions(response.data);
    } catch (error) {
      toast.error('Failed to load distributions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDistribution({
        ...formData,
        households_served: parseInt(formData.households_served),
        individuals_served: parseInt(formData.individuals_served),
        items_distributed: []
      });
      toast.success('Distribution logged');
      setShowDialog(false);
      setFormData({
        date: '',
        location_id: '',
        households_served: '',
        individuals_served: '',
      });
      fetchDistributions();
    } catch (error) {
      toast.error('Failed to log distribution');
    }
  };

  const totalHouseholds = distributions.reduce((sum, d) => sum + d.households_served, 0);
  const totalIndividuals = distributions.reduce((sum, d) => sum + d.individuals_served, 0);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Distribution Management
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Track food distributions and impact
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white" data-testid="add-distribution-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Distribution
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Log Distribution</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="date">Distribution Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      data-testid="distribution-date-input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location_id">Location ID</Label>
                    <Input
                      id="location_id"
                      value={formData.location_id}
                      onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                      placeholder="LOC-001"
                      data-testid="distribution-location-input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="households_served">Households Served</Label>
                    <Input
                      id="households_served"
                      type="number"
                      value={formData.households_served}
                      onChange={(e) => setFormData({ ...formData, households_served: e.target.value })}
                      data-testid="distribution-households-input"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="individuals_served">Individuals Served</Label>
                    <Input
                      id="individuals_served"
                      type="number"
                      value={formData.individuals_served}
                      onChange={(e) => setFormData({ ...formData, individuals_served: e.target.value })}
                      data-testid="distribution-individuals-input"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#0F172A] hover:bg-[#1E293B]" data-testid="distribution-submit-button">Log Distribution</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border border-[#E2E8F0]" data-testid="total-households-stat">
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Total Households Served</p>
              <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>{totalHouseholds}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-[#E2E8F0]" data-testid="total-individuals-stat">
              <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Total Individuals Served</p>
              <p className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>{totalIndividuals}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
            <table className="w-full" data-testid="distributions-table">
              <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Households</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Individuals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {distributions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No distributions logged yet
                    </td>
                  </tr>
                ) : (
                  distributions.map((dist) => (
                    <tr key={dist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{dist.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{dist.location_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dist.households_served}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dist.individuals_served}</td>
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

export default Distributions;
