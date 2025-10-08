"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextBadgeInfo } from "@/components/ui/info";
import {
  Package,
  CreditCard,
  FileText,
  Edit,
  DollarSign,
  Receipt,
  Settings,
  Download,
  Loader2,
  Tag,
  ShoppingBag,
  NotepadText,
} from "lucide-react";

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrder, updateOrderStatus } from "@/api/order";
import { OrderStatus } from "@/interface/order";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const OrderDetail = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // State for status update
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");

  // Get order details
  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["orderDetail", slug],
    queryFn: () => getOrder(slug),
    enabled: !!slug,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      return updateOrderStatus(slug, status);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orderDetail", slug] });
      setIsStatusDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update order status"
      );
    },
  });

  // Order status options based on OrderStatus enum
  const orderStatusOptions = [
    {
      label: "Pending",
      value: OrderStatus.PENDING,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Completed",
      value: OrderStatus.COMPLETED,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Cancelled",
      value: OrderStatus.CANCELLED,
      color: "bg-red-100 text-red-800",
    },
  ];

  // Handle status update
  const handleStatusUpdate = () => {
    const updates: { status?: string; paymentStatus?: string } = {};

    if (selectedStatus && selectedStatus !== orderData?.status) {
      updates.status = selectedStatus;
    }

    if (
      selectedPaymentStatus &&
      selectedPaymentStatus !== orderData?.payment_status
    ) {
      updates.paymentStatus = selectedPaymentStatus;
    }

    if (Object.keys(updates).length > 0) {
      updateStatusMutation.mutate(updates);
    } else {
      toast.error("No changes to update");
    }
  };

  // Initialize status values when data loads
  useEffect(() => {
    if (orderData) {
      setSelectedStatus(orderData.status || "");
      setSelectedPaymentStatus(orderData.payment_status || "");
    }
  }, [orderData]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !orderData) {
    return (
      <Error
        title="Order Not Found"
        description="The requested order does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.back()}
        onRetry={() => refetch()}
        onGoBack={() => router.back()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <NotepadText className="h-6 w-6 text-blue-600" />
              </div>
              <Heading
                title={`Order #${orderData.order_code}`}
                description={`Order details and management`}
              />
            </div>

            <div className="flex items-center space-x-3">
              <Dialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>
                      Change the order status and payment status as needed.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Order Status
                      </label>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select order status" />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsStatusDialogOpen(false)}
                      disabled={updateStatusMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleStatusUpdate}
                      disabled={updateStatusMutation.isPending}
                    >
                      {updateStatusMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        "Update Status"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Order Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Order Status
                  </label>
                  <TextBadgeInfo status={orderData.status} />
                </div>

                <Separator />

                {/* Order Timeline */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Order Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Order Created</p>
                        <p className="text-xs text-gray-500">
                          {format(
                            new Date(orderData.created_at),
                            "PPP 'at' pp"
                          )}
                        </p>
                      </div>
                    </div>

                    {orderData.updated_at !== orderData.created_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-xs text-gray-500">
                            {format(
                              new Date(orderData.updated_at),
                              "PPP 'at' pp"
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items - Updated to show combo items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span>Order Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.order_items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.item_type?.toUpperCase()}
                          </Badge>
                          {item.item_type === "combo" && (
                            <Tag className="h-3 w-3 text-blue-500" />
                          )}
                        </div>

                        <h4 className="font-medium text-gray-900">
                          {item.item_type === "combo"
                            ? item.combo_name || "Combo Package"
                            : item.course_title || "Course"}
                        </h4>

                        <p className="text-sm text-gray-500 mt-1">
                          {item.item_type === "combo"
                            ? `Combo ID: ${item.combo_id}`
                            : `Course ID: ${item.course_id}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">
                          {Number(item.price).toLocaleString()} VND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Payment Method
                    </label>
                    <p className="text-sm text-gray-900 mt-1 capitalize">
                      {orderData.payment_method?.replace("_", " ")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">
                      Payment Status
                    </label>
                    <TextBadgeInfo status={orderData.payment_status} />
                  </div>
                </div>

                {/* Payment Details */}
                {orderData.payments && orderData.payments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Payment History
                    </h4>
                    <div className="space-y-2">
                      {orderData.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {Number(payment.amount).toLocaleString()} VND
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(payment.created_at), "PPP")}
                            </p>
                          </div>
                          <TextBadgeInfo status={payment.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            {orderData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span>Order Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{orderData.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary - Updated with VND currency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Order Code:</span>
                    <span className="font-medium">{orderData.order_code}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {Number(orderData.total_amount).toLocaleString()} VND
                    </span>
                  </div>

                  {parseFloat(orderData.discount_amount || "0") > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -{Number(orderData.discount_amount).toLocaleString()}{" "}
                        VND
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">
                      {Number(orderData.final_amount).toLocaleString()} VND
                    </span>
                  </div>
                </div>

                {/* Coupon Usage */}
                {orderData.coupon_usage &&
                  orderData.coupon_usage.length > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Coupon Applied
                        </span>
                      </div>
                    </div>
                  )}

                {/* Order Status Info */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Order Information
                  </h4>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p>• Deleted: {orderData.deleted ? "Yes" : "No"}</p>
                    <p>
                      • Created: {format(new Date(orderData.created_at), "PPP")}
                    </p>
                    <p>
                      • Updated: {format(new Date(orderData.updated_at), "PPP")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsStatusDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
