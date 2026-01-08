import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على بيانات الموظف الحالي
export const getCurrentEmployee = query({
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

    return employee;
  },
});

// إنشاء ملف موظف جديد تلقائياً
export const createEmployee = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    // التحقق من عدم وجود ملف موظف مسبقاً
    const existing = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new ConvexError("لديك ملف موظف بالفعل");
    }

    // الحصول على بيانات المستخدم (اختياري)
    const user = await ctx.db.get(userId);
    const userEmail = user?.email || `user_${userId.slice(-8)}@temp.com`;

    // تحديد الدور تلقائياً بناءً على الإيميل
    const role = userEmail === "admin@newegyptgold.com" ? "admin" : "employee";

    const employeeId = await ctx.db.insert("employees", {
      userId,
      name: args.name,
      phone: args.phone,
      email: userEmail,
      role: role,
      isActive: true,
    });

    return employeeId;
  },
});

// الحصول على جميع الموظفين (للمدير فقط)
export const getAllEmployees = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const currentEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentEmployee || currentEmployee.role !== "admin") {
      throw new ConvexError("غير مصرح لك بعرض هذه البيانات");
    }

    const employees = await ctx.db.query("employees").collect();
    return employees;
  },
});

// إحصائيات موظف معين (للمدير فقط)
export const getEmployeeStats = query({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const currentEmployee = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!currentEmployee || currentEmployee.role !== "admin") {
      throw new ConvexError("غير مصرح لك بعرض هذه البيانات");
    }

    // جلب المبيعات
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalWeight = sales.reduce((sum, sale) => sum + sale.weight, 0);

    // جلب التحصيلات
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    const totalCollections = collections.reduce(
      (sum, col) => sum + col.amount,
      0
    );

    // جلب العملاء
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .collect();

    return {
      totalSales,
      totalWeight,
      totalCollections,
      customersCount: customers.length,
      salesCount: sales.length,
      collectionsCount: collections.length,
    };
  },
});
