import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على مبيعات الموظف الحالي
export const getMySales = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
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

    let sales;
    
    // إذا كان مدير، أعرض جميع المبيعات
    if (employee.role === "admin") {
      sales = await ctx.db.query("sales").order("desc").collect();
    } else {
      // إذا كان موظف عادي، أعرض مبيعاته فقط
      sales = await ctx.db
        .query("sales")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .order("desc")
        .collect();
    }

    // تصفية حسب التاريخ إذا تم تحديده
    const filteredSales = sales.filter((sale) => {
      if (args.startDate && sale.saleDate < args.startDate) return false;
      if (args.endDate && sale.saleDate > args.endDate) return false;
      return true;
    });

    // إضافة بيانات العميل والموظف لكل عملية بيع
    const salesWithDetails = await Promise.all(
      filteredSales.map(async (sale) => {
        const customer = await ctx.db.get(sale.customerId);
        const emp = await ctx.db.get(sale.employeeId);
        return {
          ...sale,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
          employeeName: emp?.name || "غير معروف",
        };
      })
    );

    return salesWithDetails;
  },
});

// إضافة عملية بيع جديدة
export const addSale = mutation({
  args: {
    customerId: v.id("customers"),
    productName: v.string(),
    karat: v.union(v.literal("18"), v.literal("21")),
    weight: v.number(),
    pricePerGram: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const employee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!employee) {
      throw new ConvexError("لم يتم العثور على ملف الموظف");
    }

    const totalAmount = args.weight * args.pricePerGram;

    const saleId = await ctx.db.insert("sales", {
      customerId: args.customerId,
      employeeId: employee._id,
      productName: args.productName,
      karat: args.karat,
      weight: args.weight,
      pricePerGram: args.pricePerGram,
      totalAmount,
      saleDate: Date.now(),
      notes: args.notes,
    });

    return saleId;
  },
});

// إحصائيات المبيعات الأسبوعية
export const getWeeklySalesStats = query({
  args: {},
  handler: async (ctx) => {
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
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    let sales;
    
    // إذا كان مدير، احسب إحصائيات جميع المبيعات
    if (employee.role === "admin") {
      sales = await ctx.db.query("sales").collect();
    } else {
      // إذا كان موظف عادي، احسب إحصائيات مبيعاته فقط
      sales = await ctx.db
        .query("sales")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const weeklySales = sales.filter((sale) => sale.saleDate >= oneWeekAgo);

    // إحصائيات عيار 18
    const sales18 = weeklySales.filter((sale) => sale.karat === "18");
    const totalAmount18 = sales18.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalWeight18 = sales18.reduce((sum, sale) => sum + sale.weight, 0);

    // إحصائيات عيار 21
    const sales21 = weeklySales.filter((sale) => sale.karat === "21");
    const totalAmount21 = sales21.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalWeight21 = sales21.reduce((sum, sale) => sum + sale.weight, 0);

    const totalAmount = weeklySales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    const totalWeight = weeklySales.reduce((sum, sale) => sum + sale.weight, 0);

    return {
      count: weeklySales.length,
      totalAmount,
      totalWeight,
      karat18: {
        count: sales18.length,
        totalAmount: totalAmount18,
        totalWeight: totalWeight18,
      },
      karat21: {
        count: sales21.length,
        totalAmount: totalAmount21,
        totalWeight: totalWeight21,
      },
    };
  },
});

// تصدير جميع البيانات
export const exportAllData = query({
  args: {},
  handler: async (ctx) => {
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

    let sales;
    
    // إذا كان مدير، صدّر جميع المبيعات
    if (employee.role === "admin") {
      sales = await ctx.db.query("sales").order("desc").collect();
    } else {
      // إذا كان موظف عادي، صدّر مبيعاته فقط
      sales = await ctx.db
        .query("sales")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .order("desc")
        .collect();
    }

    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const customer = await ctx.db.get(sale.customerId);
        const emp = await ctx.db.get(sale.employeeId);
        return {
          ...sale,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
          employeeName: emp?.name || "غير معروف",
        };
      })
    );

    return salesWithDetails;
  },
});
