import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // جدول الموظفين
  employees: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()), // الإيميل لتحديد الصلاحيات (اختياري)
    role: v.string(), // "admin" أو "employee"
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),

  // جدول العملاء
  customers: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()), // البريد الإلكتروني
    address: v.optional(v.string()),
    employeeId: v.id("employees"), // الموظف المسؤول
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_employee", ["employeeId"]),

  // جدول المبيعات
  sales: defineTable({
    customerId: v.id("customers"),
    employeeId: v.id("employees"),
    productName: v.string(),
    karat: v.union(v.literal("18"), v.literal("21")), // عيار الذهب
    weight: v.number(), // بالجرام
    pricePerGram: v.number(),
    totalAmount: v.number(),
    saleDate: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_employee", ["employeeId"])
    .index("by_date", ["saleDate"])
    .index("by_karat", ["karat"]),

  // جدول التحصيلات
  collections: defineTable({
    customerId: v.id("customers"),
    employeeId: v.id("employees"),
    collectionType: v.string(), // "ذهب" أو "نقدي"
    amount: v.number(), // بالجرام للذهب أو بالجنيه للنقدي
    paymentMethod: v.optional(v.string()), // "نقدي" أو "تحويل بنكي" (للنقدي فقط)
    collectionDate: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_customer", ["customerId"])
    .index("by_employee", ["employeeId"])
    .index("by_date", ["collectionDate"])
    .index("by_type", ["collectionType"]),

  // جدول الإشعارات
  notifications: defineTable({
    employeeId: v.id("employees"),
    type: v.string(), // "payment_due", "high_debt", "milestone"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedCustomerId: v.optional(v.id("customers")),
    createdAt: v.number(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_read", ["isRead"])
    .index("by_date", ["createdAt"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
