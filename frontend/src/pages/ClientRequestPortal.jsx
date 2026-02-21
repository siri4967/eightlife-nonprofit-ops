import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const categoryImages = {
  Fresh: 'https://images.pexels.com/photos/30426859/pexels-photo-30426859.jpeg',
  Frozen: 'https://images.pexels.com/photos/5498226/pexels-photo-5498226.jpeg',
  Dairy: 'https://images.pexels.com/photos/4578396/pexels-photo-4578396.jpeg',
  Canned: 'https://images.pexels.com/photos/6994944/pexels-photo-6994944.jpeg',
  Dry: 'https://images.pexels.com/photos/586615/pexels-photo-586615.jpeg'
};

const ClientRequestPortal = () => {
  const [step, setStep] = useState(1);
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [formData, setFormData] = useState({
    location_id: '',
    pickup_date: '',
    pickup_time: '',
    household_size: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.getInventory();
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to load inventory');
    }
  };

  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const toggleItem = (item) => {
    const exists = selectedItems.find(i => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { ...item, requested_quantity: 1 }]);
    }
  };

  const updateQuantity = (id, quantity) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === id ? { ...item, requested_quantity: parseInt(quantity) || 1 } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      const requestData = {
        ...formData,
        household_size: parseInt(formData.household_size),
        items: selectedItems.map(item => ({
          name: item.item_name,
          quantity: item.requested_quantity
        }))
      };
      
      const response = await api.createFoodRequest(requestData);
      setConfirmationNumber(response.data.confirmation_number);
      setStep(3);
      toast.success('Request submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit request');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCF8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light mb-4" style={{ fontFamily: 'Fraunces, serif', color: '#3D405B' }}>
                Welcome to Eightlife
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4" style={{ fontFamily: 'Figtree, sans-serif' }}>
                We are here to help. Select the items you need and schedule your pickup.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: 'Fraunces, serif', color: '#3D405B' }}>
                Available Items
              </h2>
              
              {Object.entries(groupedInventory).map(([category, items]) => (
                <div key={category} className="mb-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden">
                      <img src={categoryImages[category]} alt={category} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="text-2xl font-medium" style={{ fontFamily: 'Fraunces, serif', color: '#E07A5F' }}>
                      {category}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {items.map((item) => {
                      const isSelected = selectedItems.find(i => i.id === item.id);
                      return (
                        <Card 
                          key={item.id}
                          onClick={() => toggleItem(item)}
                          data-testid={`select-item-${item.id}`}
                          className={`p-6 cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'border-2 shadow-lg' 
                              : 'border-2 border-transparent hover:shadow-md'
                          }`}
                          style={{ 
                            borderColor: isSelected ? '#E07A5F' : 'transparent',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px'
                          }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-medium" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                              {item.item_name}
                            </h4>
                            {isSelected && (
                              <CheckCircle className="w-6 h-6" style={{ color: '#E07A5F' }} />
                            )}
                          </div>
                          <p className="text-sm mb-2" style={{ fontFamily: 'Figtree, sans-serif', color: '#81B29A' }}>
                            Available: {item.quantity} {item.unit}
                          </p>
                          {isSelected && (
                            <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                              <Label className="text-xs mb-2" style={{ fontFamily: 'Figtree, sans-serif' }}>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={isSelected.requested_quantity}
                                onChange={(e) => updateQuantity(item.id, e.target.value)}
                                data-testid={`quantity-input-${item.id}`}
                                className="h-12"
                                style={{ fontFamily: 'Figtree, sans-serif' }}
                              />
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-50" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-center sm:text-left" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                      {selectedItems.length} items selected
                    </p>
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    data-testid="continue-to-schedule-button"
                    className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto"
                    style={{ 
                      backgroundColor: '#E07A5F', 
                      fontFamily: 'Figtree, sans-serif',
                      borderRadius: '12px'
                    }}
                  >
                    Continue to Schedule
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-light mb-8" style={{ fontFamily: 'Fraunces, serif', color: '#3D405B' }}>
                Schedule Your Pickup
              </h1>

              <Card className="p-8" style={{ backgroundColor: '#FFFFFF', borderRadius: '20px' }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="flex items-center gap-2 mb-3 text-base" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                      <Users className="w-5 h-5" style={{ color: '#E07A5F' }} />
                      Household Size
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.household_size}
                      onChange={(e) => setFormData({ ...formData, household_size: e.target.value })}
                      data-testid="household-size-input"
                      placeholder="Number of people"
                      required
                      className="h-14 text-lg"
                      style={{ fontFamily: 'Figtree, sans-serif', borderRadius: '12px' }}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-3 text-base" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                      <ShoppingBag className="w-5 h-5" style={{ color: '#E07A5F' }} />
                      Pickup Location
                    </Label>
                    <Select value={formData.location_id} onValueChange={(value) => setFormData({ ...formData, location_id: value })} required>
                      <SelectTrigger className="h-14 text-lg" style={{ borderRadius: '12px' }} data-testid="location-select">
                        <SelectValue placeholder="Select location" style={{ fontFamily: 'Figtree, sans-serif' }} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOC-001">Main Distribution Center</SelectItem>
                        <SelectItem value="LOC-002">Community Center North</SelectItem>
                        <SelectItem value="LOC-003">Community Center South</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-3 text-base" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                      <Calendar className="w-5 h-5" style={{ color: '#E07A5F' }} />
                      Pickup Date
                    </Label>
                    <Input
                      type="date"
                      value={formData.pickup_date}
                      onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                      data-testid="pickup-date-input"
                      required
                      className="h-14 text-lg"
                      style={{ fontFamily: 'Figtree, sans-serif', borderRadius: '12px' }}
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-3 text-base" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                      <Clock className="w-5 h-5" style={{ color: '#E07A5F' }} />
                      Pickup Time
                    </Label>
                    <Select value={formData.pickup_time} onValueChange={(value) => setFormData({ ...formData, pickup_time: value })} required>
                      <SelectTrigger className="h-14 text-lg" style={{ borderRadius: '12px' }} data-testid="pickup-time-select">
                        <SelectValue placeholder="Select time slot" style={{ fontFamily: 'Figtree, sans-serif' }} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</SelectItem>
                        <SelectItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</SelectItem>
                        <SelectItem value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</SelectItem>
                        <SelectItem value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</SelectItem>
                        <SelectItem value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</SelectItem>
                        <SelectItem value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-14 text-lg"
                      style={{ fontFamily: 'Figtree, sans-serif', borderRadius: '12px' }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      data-testid="submit-request-button"
                      className="flex-1 h-14 text-lg"
                      style={{ 
                        backgroundColor: '#E07A5F', 
                        fontFamily: 'Figtree, sans-serif',
                        borderRadius: '12px'
                      }}
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#81B29A' }}>
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-light mb-4" style={{ fontFamily: 'Fraunces, serif', color: '#3D405B' }}>
                Request Confirmed
              </h1>
              <p className="text-lg mb-8" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                Your food assistance request has been submitted successfully.
              </p>
            </div>

            <Card className="p-8 mb-8" style={{ backgroundColor: '#FFFFFF', borderRadius: '20px' }}>
              <p className="text-sm mb-3" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                Your confirmation number:
              </p>
              <p 
                className="text-5xl font-bold mb-6" 
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E07A5F' }}
                data-testid="confirmation-number-display"
              >
                {confirmationNumber}
              </p>
              <p className="text-base" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                Please bring this number when picking up your items.
              </p>
              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#F4F1DE' }}>
                <p className="text-sm" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                  <strong>Pickup:</strong> {formData.pickup_date} at {formData.pickup_time}
                </p>
                <p className="text-sm mt-2" style={{ fontFamily: 'Figtree, sans-serif', color: '#3D405B' }}>
                  <strong>Location:</strong> {formData.location_id}
                </p>
              </div>
            </Card>

            <Button
              onClick={() => {
                setStep(1);
                setSelectedItems([]);
                setFormData({ location_id: '', pickup_date: '', pickup_time: '', household_size: '' });
              }}
              variant="outline"
              className="h-14 px-8 text-lg"
              style={{ fontFamily: 'Figtree, sans-serif', borderRadius: '12px' }}
            >
              Make Another Request
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ClientRequestPortal;
