import { useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RouteData } from "../lib/api";

type DateFilterType = "1d" | "7d" | "30d" | "custom";

interface ReportingTabProps {
  routes: RouteData[];
  account: string;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

// Helper function to check if a route is completed
function isRouteCompleted(route: RouteData): boolean {
  if (route.status === "completed" || route.status === "cancelled") {
    return true;
  }

  const startDate = new Date(route.start_date);
  const totalAmount = parseFloat(route.amount_token_units);
  const amountPerPeriod = parseFloat(route.amount_per_period_token_units);
  const totalPeriods = Math.ceil(totalAmount / amountPerPeriod);

  const endDate = new Date(startDate);
  const frequencyNumber = route.payment_frequency_number;

  switch (route.payment_frequency_unit) {
    case "minutes":
      endDate.setMinutes(
        endDate.getMinutes() + totalPeriods * frequencyNumber
      );
      break;
    case "hours":
      endDate.setHours(endDate.getHours() + totalPeriods * frequencyNumber);
      break;
    case "days":
      endDate.setDate(endDate.getDate() + totalPeriods * frequencyNumber);
      break;
    case "weeks":
      endDate.setDate(endDate.getDate() + totalPeriods * frequencyNumber * 7);
      break;
    case "months":
      endDate.setMonth(endDate.getMonth() + totalPeriods * frequencyNumber);
      break;
  }

  return new Date() > endDate;
}

export default function ReportingTab({ routes, account }: ReportingTabProps) {
  const [dateFilter, setDateFilter] = useState<DateFilterType>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let startDate: Date;
    let endDate: Date = today;

    switch (dateFilter) {
      case "1d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "7d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "30d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          // Default to 30 days if custom dates not set
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
        }
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
    }

    return { startDate, endDate };
  }, [dateFilter, customStartDate, customEndDate]);

  // Check if user has any routes
  const hasRoutes = useMemo(() => {
    if (!account || !routes) return false;
    return routes.some(
      (route) => route.sender === account || route.recipient === account
    );
  }, [routes, account]);

  // Helper function to check if a date is within range
  const isDateInRange = useCallback(
    (date: Date): boolean => {
      return date >= dateRange.startDate && date <= dateRange.endDate;
    },
    [dateRange]
  );

  // Export daily flow data to CSV
  const exportToCSV = useCallback(() => {
    if (!dailyFlowData || dailyFlowData.length === 0) {
      return;
    }

    // Create CSV header
    const headers = ["Date", "Inflow ($)", "Outflow ($)"];
    
    // Create CSV rows
    const rows = dailyFlowData.map((item) => [
      item.date,
      item.inflow.toFixed(2),
      item.outflow.toFixed(2),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    // Generate filename with date range
    const startDateStr = dateRange.startDate.toISOString().split("T")[0];
    const endDateStr = dateRange.endDate.toISOString().split("T")[0];
    const filename = `waypoint-flow-data-${startDateStr}-to-${endDateStr}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [ dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!account || !routes) {
      return {
        totalRouted: 0,
        totalPaymentsRouted: 0,
        totalInvoicesFunded: 0,
        outstandingInvoices: 0,
      };
    }

    const userRoutes = routes.filter(
      (route) =>
        route.sender === account || route.recipient === account
    );

    // Filter routes that have activity within the date range
    const routesInRange = userRoutes.filter((route) => {
      const startDate = new Date(route.start_date);
      const createdDate = route.created_at ? new Date(route.created_at) : startDate;
      
      // Check if route started or was created within range
      if (isDateInRange(startDate) || isDateInRange(createdDate)) {
        return true;
      }
      
      // Check if route has payments within range
      const totalAmount = parseFloat(route.amount_token_units);
      const amountPerPeriod = parseFloat(route.amount_per_period_token_units);
      const totalPeriods = Math.ceil(totalAmount / amountPerPeriod);
      const frequencyNumber = route.payment_frequency_number;
      
      let currentDate = new Date(startDate);
      for (let i = 0; i < totalPeriods; i++) {
        if (isDateInRange(currentDate)) {
          return true;
        }
        
        switch (route.payment_frequency_unit) {
          case "minutes":
            currentDate.setMinutes(currentDate.getMinutes() + frequencyNumber);
            break;
          case "hours":
            currentDate.setHours(currentDate.getHours() + frequencyNumber);
            break;
          case "days":
            currentDate.setDate(currentDate.getDate() + frequencyNumber);
            break;
          case "weeks":
            currentDate.setDate(currentDate.getDate() + frequencyNumber * 7);
            break;
          case "months":
            currentDate.setMonth(currentDate.getMonth() + frequencyNumber);
            break;
        }
        
        if (currentDate > dateRange.endDate) break;
      }
      
      return false;
    });

    // Total routed (completed routes within range)
    const completedRoutes = routesInRange.filter((route) =>
      isRouteCompleted(route)
    );
    const totalRouted = completedRoutes.reduce((sum, route) => {
      const amount = parseFloat(route.amount_token_units);
      return sum + amount / Math.pow(10, route.token.decimals);
    }, 0);

    // Total payments routed (count of completed routes)
    const totalPaymentsRouted = completedRoutes.length;

    // Total invoices funded (invoices that are active or completed)
    const invoices = routesInRange.filter(
      (route) => route.route_type === "invoice-routes"
    );
    const fundedInvoices = invoices.filter(
      (route) => route.status === "active" || route.status === "completed"
    );
    const totalInvoicesFunded = fundedInvoices.length;

    // Outstanding invoices (pending invoices where user is payer)
    const outstandingInvoices = invoices.filter(
      (route) =>
        route.status === "pending" && route.payer_address === account
    ).length;

    return {
      totalRouted,
      totalPaymentsRouted,
      totalInvoicesFunded,
      outstandingInvoices,
    };
  }, [routes, account, dateRange, isDateInRange]);

  // Calculate dynamic font size for Total Routed based on text length
  const totalRoutedText = formatCurrency(stats.totalRouted);
  const totalRoutedFontSize = useMemo(() => {
    const textLength = totalRoutedText.length;
    // Base size is 1.875rem (text-3xl), scale down for longer text
    if (textLength <= 6) return "1.875rem"; // text-3xl for short values like "$0.50"
    if (textLength <= 8) return "1.5rem"; // text-2xl for medium values like "$1,234.56"
    if (textLength <= 10) return "1.25rem"; // text-xl for longer values like "$123.45K"
    return "1rem"; // text-base for very long values like "$1,234.56M"
  }, [totalRoutedText]);

  // Calculate daily inflow/outflow data for charts
  const dailyFlowData = useMemo(() => {
    if (!account || !routes) return [];

    const userRoutes = routes.filter(
      (route) =>
        route.sender === account || route.recipient === account
    );

    // Calculate number of days in range
    const daysDiff = Math.ceil(
      (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const numDays = Math.max(1, daysDiff);

    // Initialize daily data
    const dailyData: Record<
      string,
      { date: string; inflow: number; outflow: number }
    > = {};

    for (let i = 0; i < numDays; i++) {
      const date = new Date(dateRange.startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split("T")[0];
      dailyData[dateKey] = {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        inflow: 0,
        outflow: 0,
      };
    }

    // Calculate daily amounts
    userRoutes.forEach((route) => {
      // Skip cancelled or declined routes
      if (route.status === "cancelled" || route.status === "declined") return;

      const startDate = new Date(route.start_date);
      const amountPerPeriod = parseFloat(route.amount_per_period_token_units);
      const tokenDecimals = route.token.decimals;
      const amountInTokens = amountPerPeriod / Math.pow(10, tokenDecimals);

      // Calculate payment dates
      const paymentDates: Date[] = [];
      let currentDate = new Date(startDate);
      const totalAmount = parseFloat(route.amount_token_units);
      const totalPeriods = Math.ceil(totalAmount / amountPerPeriod);
      const frequencyNumber = route.payment_frequency_number;

      for (let i = 0; i < totalPeriods; i++) {
        const paymentDate = new Date(currentDate);
        
        // Only include dates within the selected date range
        if (isDateInRange(paymentDate)) {
          paymentDates.push(paymentDate);
        }

        switch (route.payment_frequency_unit) {
          case "minutes":
            currentDate.setMinutes(
              currentDate.getMinutes() + frequencyNumber
            );
            break;
          case "hours":
            currentDate.setHours(currentDate.getHours() + frequencyNumber);
            break;
          case "days":
            currentDate.setDate(currentDate.getDate() + frequencyNumber);
            break;
          case "weeks":
            currentDate.setDate(
              currentDate.getDate() + frequencyNumber * 7
            );
            break;
          case "months":
            currentDate.setMonth(currentDate.getMonth() + frequencyNumber);
            break;
        }
        
        // Stop if we've gone past the end date
        if (currentDate > dateRange.endDate) break;
      }

      // Add to daily data
      paymentDates.forEach((paymentDate) => {
        const dateKey = paymentDate.toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          if (route.recipient === account) {
            dailyData[dateKey].inflow += amountInTokens;
          } else if (route.sender === account) {
            dailyData[dateKey].outflow += amountInTokens;
          }
        }
      });
    });

    return Object.values(dailyData);
  }, [routes, account, dateRange, isDateInRange]);

  // Show empty state if no routes
  if (!hasRoutes) {
    return (
      <div className="bg-gradient-to-br from-forest-100 to-primary-100 border-2 border-forest-400 rounded-lg p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-forest-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="text-xl font-display font-bold text-forest-800 uppercase tracking-wide mb-2">
          No Data Available
        </h3>
        <p className="text-forest-700 font-display">
          Create some routes to see your reporting statistics and analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Date Filter Buttons */}
      <div className="flex justify-end items-center gap-3 flex-wrap">
        {/* Preset Date Filters */}
        <button
          onClick={() => setDateFilter("1d")}
          className={`px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all ${
            dateFilter === "1d"
              ? "bg-forest-600 text-primary-100 border-2 border-sunset-500"
              : "bg-forest-700 text-forest-300 border-2 border-forest-500 hover:border-forest-400"
          }`}
        >
          Last Day
        </button>
        <button
          onClick={() => setDateFilter("7d")}
          className={`px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all ${
            dateFilter === "7d"
              ? "bg-forest-600 text-primary-100 border-2 border-sunset-500"
              : "bg-forest-700 text-forest-300 border-2 border-forest-500 hover:border-forest-400"
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setDateFilter("30d")}
          className={`px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all ${
            dateFilter === "30d"
              ? "bg-forest-600 text-primary-100 border-2 border-sunset-500"
              : "bg-forest-700 text-forest-300 border-2 border-forest-500 hover:border-forest-400"
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setDateFilter("custom")}
          className={`px-4 py-2 rounded-lg font-display text-sm uppercase tracking-wider transition-all ${
            dateFilter === "custom"
              ? "bg-forest-600 text-primary-100 border-2 border-sunset-500"
              : "bg-forest-700 text-forest-300 border-2 border-forest-500 hover:border-forest-400"
          }`}
        >
          Custom
        </button>

        {/* Custom Date Inputs */}
        {dateFilter === "custom" && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-forest-800 text-sm font-display uppercase tracking-wider">
                From:
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || new Date().toISOString().split("T")[0]}
                className="bg-primary-100 border-2 border-forest-500 rounded-lg text-forest-800 font-display px-3 py-2 focus:border-sunset-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-forest-800 text-sm font-display uppercase tracking-wider">
                To:
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                max={new Date().toISOString().split("T")[0]}
                className="bg-primary-100 border-2 border-forest-500 rounded-lg text-forest-800 font-display px-3 py-2 focus:border-sunset-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Routed */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-forest-300 text-sm font-display uppercase tracking-wider">
              Total Routed
            </h3>
            <svg
              className="w-5 h-5 text-forest-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p 
            className="font-display font-bold text-primary-100 break-words min-w-0 leading-tight"
            style={{
              fontSize: totalRoutedFontSize,
            }}
          >
            {totalRoutedText}
          </p>
        </div>

        {/* Total Payments Routed */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-forest-300 text-sm font-display uppercase tracking-wider">
              Total Payments Routed
            </h3>
            <svg
              className="w-5 h-5 text-forest-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-3xl font-display font-bold text-primary-100">
            {stats.totalPaymentsRouted}
          </p>
        </div>

        {/* Total Invoices Funded */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-forest-300 text-sm font-display uppercase tracking-wider">
              Total Invoices Funded
            </h3>
            <svg
              className="w-5 h-5 text-forest-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-3xl font-display font-bold text-primary-100">
            {stats.totalInvoicesFunded}
          </p>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-forest-300 text-sm font-display uppercase tracking-wider">
              Outstanding Invoices
            </h3>
            <svg
              className="w-5 h-5 text-forest-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-display font-bold text-primary-100">
            {stats.outstandingInvoices}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow per Day Chart */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <h3 className="text-forest-300 text-lg font-display font-bold uppercase tracking-wider mb-4">
            Inflow per Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis
                dataKey="date"
                stroke="#cbd5e0"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#cbd5e0"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a202c",
                  border: "1px solid #4a5568",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#cbd5e0" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="inflow"
                stroke="#48bb78"
                strokeWidth={2}
                name="Inflow"
                dot={{ fill: "#48bb78", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outflow per Day Chart */}
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
          <h3 className="text-forest-300 text-lg font-display font-bold uppercase tracking-wider mb-4">
            Outflow per Day
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
              <XAxis
                dataKey="date"
                stroke="#cbd5e0"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#cbd5e0"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a202c",
                  border: "1px solid #4a5568",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#cbd5e0" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="outflow"
                stroke="#f56565"
                strokeWidth={2}
                name="Outflow"
                dot={{ fill: "#f56565", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Combined Flow Chart */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-900 border border-forest-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-forest-300 text-lg font-display font-bold uppercase tracking-wider">
            Combined Flow (Inflow vs Outflow)
          </h3>
          <button
            onClick={exportToCSV}
            disabled={!dailyFlowData || dailyFlowData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-600 text-forest-300 hover:text-primary-100 border-2 border-forest-500 rounded-lg font-display text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
            <XAxis
              dataKey="date"
              stroke="#cbd5e0"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#cbd5e0"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a202c",
                border: "1px solid #4a5568",
                borderRadius: "8px",
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "#cbd5e0" }}
            />
            <Legend />
            <Bar dataKey="inflow" fill="#48bb78" name="Inflow" />
            <Bar dataKey="outflow" fill="#f56565" name="Outflow" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

