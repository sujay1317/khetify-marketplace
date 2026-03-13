import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import logo from '@/assets/khetify-logo-new.png';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface ReceiptData {
  orderId: string;
  orderDate: string;
  customerName: string;
  shippingAddress: ShippingAddress | null;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: string;
  sellerName: string;
}

interface OrderReceiptProps {
  open: boolean;
  onClose: () => void;
  data: ReceiptData;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ open, onClose, data }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${data.orderId.slice(0, 8).toUpperCase()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
            }
            .receipt { 
              border: 2px dashed #ccc; 
              padding: 20px; 
              background: white;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 15px; }
            .logo { font-size: 24px; font-weight: bold; color: #22c55e; }
            .logo span { color: #f97316; }
            .order-info { margin-bottom: 15px; font-size: 12px; }
            .order-id { font-weight: bold; font-size: 14px; }
            .section-title { font-weight: bold; margin: 15px 0 8px; font-size: 12px; text-transform: uppercase; color: #666; }
            .address { font-size: 12px; line-height: 1.5; }
            .items { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin: 8px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 50px; text-align: center; }
            .item-price { width: 70px; text-align: right; }
            .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 15px; padding-top: 10px; border-top: 2px solid #22c55e; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #666; }
            .seller-info { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px; }
            .status { display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
            .status.pending { background: #fef3c7; color: #92400e; }
            .status.confirmed { background: #dbeafe; color: #1e40af; }
            .status.shipped { background: #e0e7ff; color: #3730a3; }
            .status.delivered { background: #dcfce7; color: #166534; }
            .status.cancelled { background: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .receipt { border: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusClass = (status: string) => {
    return `status ${status.toLowerCase()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Receipt</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>View and print order details for #{data.orderId.slice(0, 8)}</DialogDescription>
        </DialogHeader>

        <div ref={receiptRef} className="receipt bg-white p-5 border-2 border-dashed border-muted rounded-lg">
          {/* Header */}
          <div className="header text-center mb-5 pb-4 border-b border-dashed">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src={logo} alt="KhetiFy" className="w-10 h-10" />
              <div className="logo text-2xl font-bold">
                <span style={{ color: '#22c55e' }}>KHETIFY</span>
                <span style={{ color: '#f97316' }}>.shop</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Farm Fresh Products</p>
          </div>

          {/* Order Info */}
          <div className="order-info text-sm mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="order-id font-bold">Order #{data.orderId.slice(0, 8).toUpperCase()}</span>
              <span className={getStatusClass(data.status)}>{data.status}</span>
            </div>
            <p className="text-muted-foreground text-xs">{data.orderDate}</p>
          </div>

          {/* Seller Info */}
          <div className="seller-info bg-muted/50 p-3 rounded-lg mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">SOLD BY</p>
            <p className="font-medium">{data.sellerName}</p>
          </div>

          {/* Customer & Shipping */}
          {data.shippingAddress && (
            <div className="mb-4">
              <p className="section-title text-xs font-semibold text-muted-foreground mb-2">SHIP TO</p>
              <div className="address text-sm space-y-1">
                <p className="font-medium">{data.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">{data.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.pincode}
                </p>
                <p className="text-muted-foreground">📞 {data.shippingAddress.phone}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="items border-t border-b py-3 my-4">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span className="flex-1">ITEM</span>
              <span className="w-12 text-center">QTY</span>
              <span className="w-16 text-right">PRICE</span>
            </div>
            {data.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-dashed last:border-0">
                <span className="flex-1 pr-2">{item.product_name}</span>
                <span className="w-12 text-center">{item.quantity}</span>
                <span className="w-16 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center font-bold text-lg pt-3 border-t-2 border-primary">
            <span>TOTAL</span>
            <span className="text-primary">₹{data.total.toLocaleString('en-IN')}</span>
          </div>

          {/* Payment Method */}
          <div className="mt-3 text-sm text-center">
            <span className="text-muted-foreground">Payment: </span>
            <span className="font-medium uppercase">{data.paymentMethod}</span>
          </div>

          {/* Footer */}
          <div className="footer text-center mt-6 pt-4 border-t border-dashed text-xs text-muted-foreground">
            <p className="font-medium mb-1">Thank you for shopping with us!</p>
            <p>www.khetify.shop</p>
            <p className="mt-2">For queries: support@khetify.shop</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderReceipt;
