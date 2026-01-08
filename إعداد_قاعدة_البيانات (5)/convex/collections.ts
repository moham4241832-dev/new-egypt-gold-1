import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على تحصيلات الموظف الحالي
export const getMyCollections = query({
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

    let collections;
    
    // إذا كان مدير، أعرض جميع التحصيلات
    if (employee.role === "admin") {
      collections = await ctx.db.query("collections").order("desc").collect();
    } else {
      // إذا كان موظف عادي، أعرض تحصيلاته فقط
      collections = await ctx.db
        .query("collections")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .order("desc")
        .collect();
    }

    // تصفية حسب التاريخ إذا تم تحديده
    const filteredCollections = collections.filter((collection) => {
      if (args.startDate && collection.collectionDate < args.startDate)
        return false;
      if (args.endDate && collection.collectionDate > args.endDate)
        return false;
      return true;
    });

    // إضافة بيانات العميل والموظف لكل تحصيل
    const collectionsWithDetails = await Promise.all(
      filteredCollections.map(async (collection) => {
        const customer = await ctx.db.get(collection.customerId);
        const emp = await ctx.db.get(collection.employeeId);
        return {
          ...collection,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
          employeeName: emp?.name || "غير معروف",
        };
      })
    );

    return collectionsWithDetails;
  },
});

// إضافة تحصيل جديد
export const addCollection = mutation({
  args: {
    customerId: v.id("customers"),
    collectionType: v.string(),
    amount: v.number(),
    paymentMethod: v.optional(v.string()),
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

    const collectionId = await ctx.db.insert("collections", {
      customerId: args.customerId,
      employeeId: employee._id,
      collectionType: args.collectionType,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      collectionDate: Date.now(),
      notes: args.notes,
    });

    return collectionId;
  },
});

// إحصائيات التحصيلات الأسبوعية
export const getWeeklyCollectionsStats = query({
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

    let collections;
    
    // إذا كان مدير، احسب إحصائيات جميع التحصيلات
    if (employee.role === "admin") {
      collections = await ctx.db.query("collections").collect();
    } else {
      // إذا كان موظف عادي، احسب إحصائيات تحصيلاته فقط
      collections = await ctx.db
        .query("collections")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .collect();
    }

    const weeklyCollections = collections.filter(
      (collection) => collection.collectionDate >= oneWeekAgo
    );

    // إحصائيات التحصيلات الذهبية
    const goldCollections = weeklyCollections.filter(
      (col) => col.collectionType === "ذهب"
    );
    const totalGold = goldCollections.reduce((sum, col) => sum + col.amount, 0);

    // إحصائيات التحصيلات النقدية
    const cashCollections = weeklyCollections.filter(
      (col) => col.collectionType === "نقدي"
    );
    const totalCash = cashCollections.reduce((sum, col) => sum + col.amount, 0);

    return {
      count: weeklyCollections.length,
      goldCount: goldCollections.length,
      cashCount: cashCollections.length,
      totalGold,
      totalCash,
    };
  },
});

// تصدير جميع التحصيلات
export const exportAllCollections = query({
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

    let collections;
    
    if (employee.role === "admin") {
      collections = await ctx.db.query("collections").order("desc").collect();
    } else {
      collections = await ctx.db
        .query("collections")
        .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
        .order("desc")
        .collect();
    }

    const collectionsWithDetails = await Promise.all(
      collections.map(async (collection) => {
        const customer = await ctx.db.get(collection.customerId);
        const emp = await ctx.db.get(collection.employeeId);
        return {
          ...collection,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
          employeeName: emp?.name || "غير معروف",
        };
      })
    );

    return collectionsWithDetails;
  },
});
