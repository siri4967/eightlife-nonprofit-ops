import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    quantity: '',
    unit: '',
    source: '',
    received_date: '',
    expiration_date: '',
    storage_location: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.getInventory();
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createInventory({
        ...formData,
        quantity: parseInt(formData.quantity)
      });
      toast.success('Inventory batch added');
      setShowDialog(false);
      setFormData({
        item_name: '',
        category: '',
        quantity: '',
        unit: '',
        source: '',
        received_date: '',
        expiration_date: '',
        storage_location: ''
      });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to add inventory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    try {
      await api.deleteInventory(id);
      toast.success('Batch deleted');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to delete batch');
    }
  };

  const categories = ['Dry', 'Dairy', 'Canned', 'Frozen', 'Fresh'];
  const sources = ['Donation', 'USDA', 'Second Harvest Heartland'];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="pt-16 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Manage your food inventory with batch tracking
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#0F172A] hover:bg-[#1E293B] text-white" data-testid="add-inventory-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Manrope, sans-serif' }}>Add Inventory Batch</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item_name">Item Name</Label>
                      <Input
                        id="item_name"
                        value={formData.item_name}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        data-testid="inventory-item-name-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })} required>
                        <SelectTrigger data-testid="inventory-category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        data-testid="inventory-quantity-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="lbs, units, boxes"
                        data-testid="inventory-unit-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="source">Source</Label>
                      <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })} required>
                        <SelectTrigger data-testid="inventory-source-select">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {sources.map(src => (
                            <SelectItem key={src} value={src}>{src}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="storage_location">Storage Location</Label>
                      <Input
                        id="storage_location"
                        value={formData.storage_location}
                        onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                        data-testid="inventory-location-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="received_date">Received Date</Label>
                      <Input
                        id="received_date"
                        type="date"
                        value={formData.received_date}
                        onChange={(e) => setFormData({ ...formData, received_date: e.target.value })}
                        data-testid="inventory-received-date-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiration_date">Expiration Date</Label>
                      <Input
                        id="expiration_date"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                        data-testid="inventory-expiration-date-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                    <Button type="submit" className="bg-[#0F172A] hover:bg-[#1E293B]" data-testid="inventory-submit-button">Add Batch</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading inventory...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden">
              <table className="w-full" data-testid="inventory-table">
                <thead className="bg-gray-50 border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Expiration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No inventory items yet. Add your first batch to get started.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{item.item_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{item.quantity} {item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.expiration_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.storage_location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(item.id)}
                            data-testid={`delete-inventory-${item.id}`}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Inventory;
