"use client";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import TextField from "@/components/form/text-field";
import SelectField from "@/components/form/select-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/ui/loading";
import Error from "@/components/ui/error";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  DollarSign,
  Package,
  CreditCard,
  FileText,
  Calculator,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  NotepadText,
} from "lucide-react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderCreateSchema } from "@/validation/order";
import { createOrder, getOrder } from "@/api/order";
import { getCourseCombos } from "@/api/course";
import { getCoupons } from "@/api/coupon";
import toast from "react-hot-toast";
import ROUTES from "@/constants/route";
import { PAYMENT_METHODS } from "@/constants/paymentMethod";
import { useEffect, useState } from "react";

const OrderForm = () => {
  const router = useRouter();
  const param = useParams();
  const queryClient = useQueryClient();

  const orderId = Array.isArray(param.orderId)
    ? param.orderId[0]
    : param.orderId;

  let title = "";
  let description = "";
  if (orderId === undefined || param.orderId === "") {
    title = "Create New Order";
    description = "Create a new order with combo and payment details";
  } else {
    title = "Edit Order";
    description = "Update order information and status";
  }

  // State for calculations and pagination
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [calculatedTotals, setCalculatedTotals] = useState({
    originalPrice: 0,
    discountAmount: 0,
    finalAmount: 0,
  });

  // Pagination states for combos
  const [comboPage, setComboPage] = useState(1);
  const [comboSearch, setComboSearch] = useState("");
  const combosPerPage = 6; // 6 combos per page

  // Queries
  const {
    data: orderData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId),
    enabled: orderId !== undefined && orderId !== "",
  });

  const { data: combosData, isLoading: combosLoading } = useQuery({
    queryKey: ["combos", comboPage, comboSearch],
    queryFn: () =>
      getCourseCombos({
        page: comboPage,
        search: comboSearch,
      }),
  });

  const { data: couponsData } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getCoupons({ page: 1 }),
  });

  // Process combo data
  const comboOptions =
    combosData?.result?.map((combo) => ({
      label: `${combo.name} - $${combo.combo_price}`,
      value: combo.id,
      name: combo.name,
      price: parseFloat(combo.combo_price || "0"),
      description: combo.description,
    })) || [];

  // Pagination info for combos
  const totalCombos = combosData?.meta?.total || 0;
  const totalComboPages = Math.ceil(totalCombos / combosPerPage);
  const hasNextPage = comboPage < totalComboPages;
  const hasPrevPage = comboPage > 1;

  const couponOptions =
    couponsData?.result?.map((coupon) => ({
      label: `${coupon.code} (${
        coupon.discount_type === "percentage"
          ? coupon.discount_value + "%"
          : Number(coupon.discount_value).toLocaleString() + " VND"
      })`,
      value: coupon.code,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
    })) || [];

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof OrderCreateSchema>) => {
      return createOrder(formData);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      router.push(ROUTES.ADMIN_ORDERS);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create order");
    },
  });

  // Form setup - CHANGED: comboId now single string, not array
  const orderForm = useForm<z.infer<typeof OrderCreateSchema>>({
    resolver: zodResolver(OrderCreateSchema),
    defaultValues: {
      comboId: "", // Single combo selection
      couponId: "",
      paymentMethod: "credit_card",
      notes: "",
    },
  });

  // Calculate totals when combo or coupon changes
  const calculateTotals = () => {
    const comboId = orderForm.getValues("comboId");
    const couponId = orderForm.getValues("couponId");

    // Calculate original price from selected combo
    let originalPrice = 0;
    if (comboId) {
      const combo = comboOptions.find((c) => c.value === comboId);
      originalPrice = combo?.price || 0;
    }

    // Calculate discount
    let discountAmount = 0;
    if (couponId) {
      const selectedCoupon = couponOptions.find((c) => c.value === couponId);
      if (
        selectedCoupon &&
        "discount_value" in selectedCoupon &&
        selectedCoupon.discount_value !== undefined
      ) {
        if (selectedCoupon.discount_type === "percentage") {
          discountAmount =
            (originalPrice * selectedCoupon.discount_value) / 100;
        } else {
          discountAmount = selectedCoupon.discount_value;
        }
      }
    }

    const finalAmount = originalPrice - discountAmount;

    // Update state
    setCalculatedTotals({
      originalPrice,
      discountAmount,
      finalAmount,
    });
  };

  // Handle combo selection - CHANGED: single selection
  const handleComboChange = (comboId: string) => {
    orderForm.setValue("comboId", comboId);
    const combo = comboOptions.find((c) => c.value === comboId);
    setSelectedCombo(combo);
    setTimeout(calculateTotals, 100);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage) {
      setComboPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setComboPage((prev) => prev - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setComboPage(page);
  };

  // Search handler
  const handleSearchChange = (value: string) => {
    setComboSearch(value);
    setComboPage(1); // Reset to first page when searching
  };

  useEffect(() => {
    if (orderData) {
      // For edit mode - CHANGED: single combo
      const comboId = orderData.order_items?.[0]?.combo_id || "";

      orderForm.reset({
        comboId: comboId,
        couponId: orderData.coupon_usage?.[0]?.coupon_id || "",
        paymentMethod: orderData.payment_method || "credit_card",
        notes: orderData.notes || "",
      });
    }
  }, [orderData, orderForm]);

  // Watch for changes to recalculate
  useEffect(() => {
    const subscription = orderForm.watch(() => {
      calculateTotals();
    });
    return () => subscription.unsubscribe();
  }, [orderForm.watch]);

  const onSubmit = async (data: z.infer<typeof OrderCreateSchema>) => {
    console.log("Order Form Submitted:", data);
    createOrderMutation.mutate(data);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Error
        title="Order Not Found"
        description="The requested order does not exist or has been deleted."
        dismissible={true}
        onDismiss={() => router.push(ROUTES.ADMIN_ORDERS)}
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
              <Heading title={title} description={description} />
            </div>

            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.ADMIN_ORDERS)}
              className="flex items-center space-x-2"
            >
              <span>Back to Order list</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...orderForm}>
          <form
            onSubmit={orderForm.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Combo Selection with Pagination */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span>Combo Selection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search combos..."
                        value={comboSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <FormField
                      control={orderForm.control}
                      name="comboId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Combo (Choose One)</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {combosLoading ? (
                                <div className="flex justify-center py-8">
                                  <Loading />
                                </div>
                              ) : comboOptions.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                  {comboSearch
                                    ? "No combos found for your search"
                                    : "No combos available"}
                                </div>
                              ) : (
                                <>
                                  {/* Combo Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {comboOptions.map((combo) => (
                                      <div
                                        key={combo.value}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                                          field.value === combo.value
                                            ? "border-blue-500 bg-blue-50 shadow-md"
                                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                        }`}
                                        onClick={() => {
                                          field.onChange(combo.value);
                                          handleComboChange(combo.value);
                                        }}
                                      >
                                        <div className="space-y-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h4 className="font-medium text-gray-900 line-clamp-1">
                                                {combo.name}
                                              </h4>
                                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                {combo.description}
                                              </p>
                                            </div>
                                            <div className="ml-3 flex-shrink-0">
                                              <span className="text-md font-bold text-blue-600">
                                                {Number(
                                                  combo.price
                                                ).toLocaleString()}{" "}
                                                VND
                                              </span>
                                            </div>
                                          </div>

                                          {field.value === combo.value && (
                                            <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                              <span className="font-medium">
                                                ✓ Selected
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Pagination Controls */}
                                  {totalComboPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t">
                                      <div className="text-sm text-gray-500">
                                        Showing{" "}
                                        {(comboPage - 1) * combosPerPage + 1} to{" "}
                                        {Math.min(
                                          comboPage * combosPerPage,
                                          totalCombos
                                        )}{" "}
                                        of {totalCombos} combos
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={handlePrevPage}
                                          disabled={!hasPrevPage}
                                        >
                                          <ChevronLeft className="h-4 w-4" />
                                          <span className="ml-1 hidden sm:inline">
                                            Previous
                                          </span>
                                        </Button>

                                        {/* Page Numbers */}
                                        <div className="flex items-center space-x-1">
                                          {Array.from(
                                            {
                                              length: Math.min(
                                                5,
                                                totalComboPages
                                              ),
                                            },
                                            (_, i) => {
                                              let pageNum;
                                              if (totalComboPages <= 5) {
                                                pageNum = i + 1;
                                              } else if (comboPage <= 3) {
                                                pageNum = i + 1;
                                              } else if (
                                                comboPage >=
                                                totalComboPages - 2
                                              ) {
                                                pageNum =
                                                  totalComboPages - 4 + i;
                                              } else {
                                                pageNum = comboPage - 2 + i;
                                              }

                                              return (
                                                <Button
                                                  key={pageNum}
                                                  type="button"
                                                  variant={
                                                    pageNum === comboPage
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  size="sm"
                                                  className="w-8 h-8"
                                                  onClick={() =>
                                                    handlePageChange(pageNum)
                                                  }
                                                >
                                                  {pageNum}
                                                </Button>
                                              );
                                            }
                                          )}
                                        </div>

                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={handleNextPage}
                                          disabled={!hasNextPage}
                                        >
                                          <span className="mr-1 hidden sm:inline">
                                            Next
                                          </span>
                                          <ChevronRight className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Coupon Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span>Coupon & Discount</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SelectField
                      label="Select Coupon"
                      placeholder="Select a coupon"
                      control={orderForm.control}
                      name="couponId"
                      options={couponOptions || []}
                    />

                    {selectedCoupon && selectedCoupon.value !== "" && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            Coupon Applied: {selectedCoupon.code}
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Discount:{" "}
                          {selectedCoupon.discount_type === "percentage"
                            ? `${selectedCoupon.discount_value}%`
                            : `$${selectedCoupon.discount_value}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      <span>Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SelectField
                      control={orderForm.control}
                      name="paymentMethod"
                      label="Payment Method"
                      placeholder="Select payment method"
                      options={PAYMENT_METHODS}
                    />
                  </CardContent>
                </Card>

                {/* Order Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span>Order Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <TextField
                      control={orderForm.control}
                      name="notes"
                      label="Additional Notes"
                      placeholder="Add any special notes or instructions..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-green-600" />
                      <span>Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selected Combo */}
                    {selectedCombo && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">
                          Selected Combo:
                        </h4>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                {selectedCombo.name}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedCombo.description}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-blue-600 ml-2">
                              {Number(selectedCombo.price).toLocaleString()} VND
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {Number(
                            calculatedTotals.originalPrice
                          ).toLocaleString()}{" "}
                          VND
                        </span>
                      </div>

                      {calculatedTotals.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-medium text-green-600">
                            -
                            {Number(
                              calculatedTotals.discountAmount
                            ).toLocaleString()}{" "}
                            VND
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">
                          {Number(
                            calculatedTotals.finalAmount
                          ).toLocaleString()}{" "}
                          VND
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        className="w-full flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        disabled={createOrderMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {createOrderMutation.isPending
                            ? "Creating..."
                            : "Create Order"}
                        </span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OrderForm;
