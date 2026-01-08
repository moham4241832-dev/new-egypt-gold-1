import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على عملاء الموظف الحالي
export const getMyCustomers = query({
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

    // إذا كان مدير، أعرض جميع العملاء
    if (employee.role === "admin") {
      const customers = await ctx.db.query("customers").order("desc").collect();
      
      const customersWithEmployee = await Promise.all(
        customers.map(async (customer) => {
          const emp = await ctx.db.get(customer.employeeId);
          return {
            ...customer,
            employeeName: emp?.name || "غير معروف",
          };
        })
      );
      
      return customersWithEmployee;
    }

    // إذا كان موظف عادي، أعرض عملاءه فقط
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_employee", (q) => q.eq("employeeId", employee._id))
      .order("desc")
      .collect();

    return customers;
  },
});

// إضافة عميل جديد
export const addCustomer = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
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

    const customerId = await ctx.db.insert("customers", {
      name: args.name,
      phone: args.phone,
      email: args.email,
      address: args.address,
      employeeId: employee._id,
      notes: args.notes,
      createdAt: Date.now(),
    });

    return customerId;
  },
});

// استيراد عدة عملاء دفعة واحدة من Excel
export const importCustomers = mutation({
  args: {
    customers: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        email: v.optional(v.string()),
        address: v.optional(v.string()),
        notes: v.optional(v.string()),
      })
    ),
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

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const customer of args.customers) {
      try {
        await ctx.db.insert("customers", {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          employeeId: employee._id,
          notes: customer.notes,
          createdAt: Date.now(),
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`فشل إضافة ${customer.name}: ${error}`);
      }
    }

    return results;
  },
});
