import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as customerService from '../services/customerService';
import * as itemService from '../services/itemService';
import * as saleService from '../services/saleService';
import * as rentalService from '../services/rentalService';
import * as couponService from '../services/couponService';
import toast from '../services/toastService';
import SaleForm from '../components/SaleForm';
import RentalForm from '../components/RentalForm';
import ReturnForm from '../components/ReturnForm';
import PaymentModal from '../components/PaymentModal';
import '../styles/cashier.css';

export default function CashierDashboard({ activeTab: initialTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get active tab from URL or prop, default to 'sale'
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(initialTab || tabFromUrl || 'sale');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await itemService.getItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSale = async (saleData) => {
    try {
      setLoading(true);

      // Apply coupon discount if provided
      let discount = 0;
      let couponId = null;
      if (saleData.discountCode) {
        try {
          const couponResponse = await couponService.getCouponByCode(saleData.discountCode);
          const coupon = couponResponse.data;
          if (coupon && coupon.isValid && coupon.isValid()) {
            couponId = coupon._id;
            if (coupon.isPercentage) {
              const subtotal = saleData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
              discount = subtotal * (coupon.discountPercent / 100);
            } else {
              discount = coupon.discountPercent;
            }
          } else {
            toast.warning('Coupon is invalid or expired');
          }
        } catch (error) {
          toast.warning('Coupon not found');
        }
      }

      // Calculate totals
      const subtotal = saleData.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const tax = (subtotal - discount) * 0.06; // 6% tax
      const total = subtotal - discount + tax;

      // Prepare transaction for payment
      setCurrentTransaction({
        items: saleData.items,
        subtotal,
        discount,
        tax,
        total,
        couponCode: saleData.discountCode,
        couponId,
        paymentMethod: saleData.paymentMethod,
      });

      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error preparing sale:', error);
      toast.error('Error preparing sale');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentData) => {
    try {
      setLoading(true);

      // Create sale in backend
      const salePayload = {
        employeeID: user.id || user._id,
        items: currentTransaction.items.map(item => ({
          itemID: item._id || item.itemID,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: currentTransaction.subtotal,
        discount: currentTransaction.discount,
        tax: currentTransaction.tax,
        total: currentTransaction.total,
        paymentMethod: paymentData.method,
        amountTendered: paymentData.amountTendered,
        change: paymentData.change,
        couponId: currentTransaction.couponId,
      };

      const response = await saleService.createSale(salePayload);
      toast.success(`Sale completed! Invoice #${response.data._id?.substring(0, 8) || 'N/A'}`);

      // Reset form
      setShowPaymentModal(false);
      setCurrentTransaction(null);

      // Reload items for updated stock
      loadItems();
    } catch (error) {
      console.error('Error completing sale:', error);
      toast.error(error.response?.data?.message || 'Error completing sale');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRental = async (rentalData) => {
    try {
      setLoading(true);

      // First, find or create customer
      let customer = null;
      if (rentalData.customerPhone) {
        try {
          const customerResponse = await customerService.findByPhoneNumber(rentalData.customerPhone);
          customer = customerResponse.data;
        } catch (error) {
          if (error.response?.status === 404) {
            // Create new customer
            const [firstName, ...lastNameParts] = (rentalData.customerName || 'Customer').split(' ');
            const lastName = lastNameParts.join(' ') || 'Unknown';
            const newCustomerResponse = await customerService.createCustomer({
              phoneNumber: rentalData.customerPhone,
              firstName,
              lastName,
            });
            customer = newCustomerResponse.data;
          } else {
            throw error;
          }
        }
      }

      if (!customer || !customer._id) {
        throw new Error('Customer is required for rental');
      }

      // Calculate due date
      const rentalDate = new Date();
      const dueDate = new Date(rentalDate);
      dueDate.setDate(dueDate.getDate() + rentalData.daysToRent);

      // Format items array as expected by backend
      // Backend expects itemID as a Number, not MongoDB _id
      const items = [{
        itemID: rentalData.item.itemID, // This should be the Number field from Item model
        itemName: rentalData.item.itemName,
        quantity: rentalData.quantity,
      }];

      if (!items[0].itemID) {
        throw new Error('Item ID is required. Please select a valid item.');
      }

      const rentalPayload = {
        items: items, // Backend expects an array
        customerId: customer._id, // Backend expects customerId
        cashierId: user.id || user._id, // Backend expects cashierId
        dueDate: dueDate.toISOString(),
        totalCost: rentalData.totalCost || (rentalData.dailyRate * rentalData.daysToRent * rentalData.quantity),
        notes: `Payment method: ${rentalData.paymentMethod}`,
      };

      const response = await rentalService.createRental(rentalPayload);
      toast.success(`Rental created! Rental #${response.data._id?.substring(0, 8) || 'N/A'}`);

      // Reload items
      loadItems();
    } catch (error) {
      console.error('Error creating rental:', error);
      toast.error(error.response?.data?.message || error.message || 'Error creating rental');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReturn = async (returnData) => {
    try {
      setLoading(true);

      // Backend expects returnItems to be an array of items with itemID and quantity
      // But the backend service actually uses rental.items if returnItems is null
      // So we can pass null and let the backend handle it, or pass the items structure
      const response = await rentalService.returnRental(returnData.rentalId, null);

      toast.success(`Rental returned successfully${returnData.lateFee > 0 ? ` (Late fee: $${returnData.lateFee.toFixed(2)})` : ''}`);

      // Reload items
      loadItems();
    } catch (error) {
      console.error('Error processing return:', error);
      toast.error(error.response?.data?.message || 'Error processing return');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/cashier/${tab}`);
  };

  return (
    <div className="dashboard">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => handleTabChange('sale')}
        >
          New Sale
        </button>
        <button 
          className={`tab ${activeTab === 'rental' ? 'active' : ''}`}
          onClick={() => handleTabChange('rental')}
        >
          Rental
        </button>
        <button 
          className={`tab ${activeTab === 'return' ? 'active' : ''}`}
          onClick={() => handleTabChange('return')}
        >
          Return Item
        </button>
      </div>

      {activeTab === 'sale' && (
        <div className="tab-content">
          <h2>Process Sale</h2>
          {loading && items.length === 0 ? (
            <p>Loading items...</p>
          ) : (
            <SaleForm 
              onSubmit={handleCompleteSale}
              items={items}
              loading={loading}
            />
          )}
        </div>
      )}

      {activeTab === 'rental' && (
        <div className="tab-content">
          <h2>Create Rental</h2>
          {loading && items.length === 0 ? (
            <p>Loading items...</p>
          ) : (
            <RentalForm 
              onSubmit={handleCompleteRental}
              items={items}
              loading={loading}
            />
          )}
        </div>
      )}

      {activeTab === 'return' && (
        <div className="tab-content">
          <h2>Process Return</h2>
          <ReturnForm 
            onSubmit={handleCompleteReturn}
            loading={loading}
          />
        </div>
      )}

      {showPaymentModal && currentTransaction && (
        <PaymentModal 
          transaction={currentTransaction}
          onConfirm={handleConfirmPayment}
          onCancel={() => {
            setShowPaymentModal(false);
            setCurrentTransaction(null);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
