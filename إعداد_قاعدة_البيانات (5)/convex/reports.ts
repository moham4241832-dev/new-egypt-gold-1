import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// تقرير شامل للأداء
export const getPerformanceReport = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      return null;
    }

    const now = Date.now();
    const startDate = args.startDate || now - 30 * 24 * 60 * 60 * 1000; // آخر 30 يوم
    const endDate = args.endDate || now;

    // جلب المبيعات
    let sales;
    if (employee.role === "admin") {
      sales = await ctx.db.query("sales").collect();
    } else {
      sales = await ctx.db
        .query("sales")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const filteredSales = sales.filter(
      (sale) => sale.saleDate >= startDate && sale.saleDate <= endDate
    );

    // جلب التحصيلات
    let collections;
    if (employee.role === "admin") {
      collections = await ctx.db.query("collections").collect();
    } else {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const filteredCollections = collections.filter(
      (col) => col.collectionDate >= startDate && col.collectionDate <= endDate
    );

    // حساب الإحصائيات
    const totalSalesAmount = filteredSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    const totalSalesWeight = filteredSales.reduce(
      (sum, sale) => sum + sale.weight,
      0
    );

    const karat21Sales = filteredSales.filter((s) => s.karat === "21");
    const karat18Sales = filteredSales.filter((s) => s.karat === "18");

    const goldCollections = filteredCollections.filter(
      (c) => c.collectionType === "ذهب"
    );
    const cashCollections = filteredCollections.filter(
      (c) => c.collectionType === "نقدي"
    );

    const totalGoldCollected = goldCollections.reduce(
      (sum, col) => sum + col.amount,
      0
    );
    const totalCashCollected = cashCollections.reduce(
      (sum, col) => sum + col.amount,
      0
    );

    // أفضل العملاء
    const customerSales = new Map<string, number>();
    for (const sale of filteredSales) {
      const current = customerSales.get(sale.customerId) || 0;
      customerSales.set(sale.customerId, current + sale.totalAmount);
    }

    const topCustomersData = Array.from(customerSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topCustomers = [];
    for (const [customerId, amount] of topCustomersData) {
      const customer = await ctx.db.get(customerId as any);
      if (customer && "name" in customer) {
        topCustomers.push({
          name: customer.name,
          totalAmount: amount,
        });
      }
    }

    return {
      period: {
        startDate,
        endDate,
      },
      sales: {
        count: filteredSales.length,
        totalAmount: totalSalesAmount,
        totalWeight: totalSalesWeight,
        karat21: {
          count: karat21Sales.length,
          totalAmount: karat21Sales.reduce((sum, s) => sum + s.totalAmount, 0),
          totalWeight: karat21Sales.reduce((sum, s) => sum + s.weight, 0),
        },
        karat18: {
          count: karat18Sales.length,
          totalAmount: karat18Sales.reduce((sum, s) => sum + s.totalAmount, 0),
          totalWeight: karat18Sales.reduce((sum, s) => sum + s.weight, 0),
        },
      },
      collections: {
        count: filteredCollections.length,
        gold: {
          count: goldCollections.length,
          totalAmount: totalGoldCollected,
        },
        cash: {
          count: cashCollections.length,
          totalAmount: totalCashCollected,
        },
      },
      topCustomers,
    };
  },
});

// تقرير العملاء المتأخرين في السداد
export const getOverdueCustomers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      return [];
    }

    // جلب جميع العملاء
    let customers;
    if (employee.role === "admin") {
      customers = await ctx.db.query("customers").collect();
    } else {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const overdueCustomers = await Promise.all(
      customers.map(async (customer) => {
        // حساب إجمالي المبيعات
        const sales = await ctx.db
          .query("sales")
          .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
          .collect();

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

        // حساب إجمالي التحصيلات النقدية
        const collections = await ctx.db
          .query("collections")
          .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
          .collect();

        const totalCashCollected = collections
          .filter((c) => c.collectionType === "نقدي")
          .reduce((sum, col) => sum + col.amount, 0);

        const remainingDebt = totalSales - totalCashCollected;

        // آخر عملية تحصيل
        const lastCollection = collections.sort(
          (a, b) => b.collectionDate - a.collectionDate
        )[0];

        const daysSinceLastPayment = lastCollection
          ? Math.floor((Date.now() - lastCollection.collectionDate) / (1000 * 60 * 60 * 24))
          : null;

        return {
          customer,
          totalSales,
          totalCashCollected,
          remainingDebt,
          lastPaymentDate: lastCollection?.collectionDate,
          daysSinceLastPayment,
        };
      })
    );

    // فلترة العملاء الذين لديهم ديون متبقية
    return overdueCustomers
      .filter((c) => c.remainingDebt > 0)
      .sort((a, b) => b.remainingDebt - a.remainingDebt);
  },
});

// تقرير المبيعات اليومية
export const getDailySalesReport = query({
  args: {
    days: v.number(), // عدد الأيام للتقرير
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      return [];
    }

    const now = Date.now();
    const startDate = now - args.days * 24 * 60 * 60 * 1000;

    let sales;
    if (employee.role === "admin") {
      sales = await ctx.db.query("sales").collect();
    } else {
      sales = await ctx.db
        .query("sales")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const filteredSales = sales.filter((sale) => sale.saleDate >= startDate);

    // تجميع المبيعات حسب اليوم
    const dailyData = new Map<string, { count: number; amount: number; weight: number }>();

    for (const sale of filteredSales) {
      const date = new Date(sale.saleDate);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const current = dailyData.get(dateKey) || { count: 0, amount: 0, weight: 0 };
      dailyData.set(dateKey, {
        count: current.count + 1,
        amount: current.amount + sale.totalAmount,
        weight: current.weight + sale.weight,
      });
    }

    // تحويل إلى مصفوفة مرتبة
    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});
