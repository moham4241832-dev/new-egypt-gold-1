import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

interface ReportsPanelProps {
  employee: Doc<"employees">;
}

export function ReportsPanel({ employee }: ReportsPanelProps) {
  const [reportType, setReportType] = useState<"performance" | "overdue" | "daily">("performance");
  const [days, setDays] = useState(30);

  const performanceReport = useQuery(api.reports.getPerformanceReport, {
    startDate: Date.now() - days * 24 * 60 * 60 * 1000,
    endDate: Date.now(),
  });

  const overdueCustomers = useQuery(api.reports.getOverdueCustomers);
  const dailySalesReport = useQuery(api.reports.getDailySalesReport, { days });

  return (
    <div className="space-y-6">
      {/* اختيار نوع التقرير */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setReportType("performance")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            reportType === "performance"
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📊 تقرير الأداء
        </button>
        <button
          onClick={() => setReportType("overdue")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            reportType === "overdue"
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          ⚠️ العملاء المتأخرين
        </button>
        <button
          onClick={() => setReportType("daily")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            reportType === "daily"
              ? "bg-amber-500 text-white shadow-lg"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          📅 المبيعات اليومية
        </button>
      </div>

      {/* اختيار الفترة الزمنية */}
      <div className="flex gap-3 items-center">
        <span className="text-gray-400">الفترة:</span>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
        >
          <option value={7}>آخر 7 أيام</option>
          <option value={14}>آخر 14 يوم</option>
          <option value={30}>آخر 30 يوم</option>
          <option value={60}>آخر 60 يوم</option>
          <option value={90}>آخر 90 يوم</option>
        </select>
      </div>

      {/* عرض التقرير */}
      {reportType === "performance" && performanceReport && (
        <PerformanceReport data={performanceReport} />
      )}

      {reportType === "overdue" && overdueCustomers && (
        <OverdueCustomersReport data={overdueCustomers} />
      )}

      {reportType === "daily" && dailySalesReport && (
        <DailySalesReport data={dailySalesReport} />
      )}
    </div>
  );
}

function PerformanceReport({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* ملخص المبيعات */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📈 ملخص المبيعات</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">عدد المبيعات</p>
            <p className="text-2xl font-bold text-white">{data.sales.count}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">إجمالي المبلغ</p>
            <p className="text-2xl font-bold text-amber-400">
              {data.sales.totalAmount.toLocaleString("ar-SA")} جنيه
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">إجمالي الوزن</p>
            <p className="text-2xl font-bold text-amber-400">
              {data.sales.totalWeight.toFixed(2)} جرام
            </p>
          </div>
        </div>
      </div>

      {/* تفاصيل العيارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
          <h4 className="text-lg font-bold text-white mb-3">✨ عيار 18</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">العدد:</span>
              <span className="text-white font-semibold">{data.sales.karat18.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المبلغ:</span>
              <span className="text-yellow-400 font-semibold">
                {data.sales.karat18.totalAmount.toLocaleString("ar-SA")} جنيه
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الوزن:</span>
              <span className="text-yellow-400 font-semibold">
                {data.sales.karat18.totalWeight.toFixed(2)} جرام
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6">
          <h4 className="text-lg font-bold text-white mb-3">💍 عيار 21</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">العدد:</span>
              <span className="text-white font-semibold">{data.sales.karat21.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">المبلغ:</span>
              <span className="text-amber-400 font-semibold">
                {data.sales.karat21.totalAmount.toLocaleString("ar-SA")} جنيه
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">الوزن:</span>
              <span className="text-amber-400 font-semibold">
                {data.sales.karat21.totalWeight.toFixed(2)} جرام
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* التحصيلات */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">💰 التحصيلات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">تحصيلات ذهبية</p>
            <p className="text-2xl font-bold text-amber-400">
              {data.collections.gold.totalAmount.toFixed(2)} جرام
            </p>
            <p className="text-sm text-gray-500">({data.collections.gold.count} عملية)</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">تحصيلات نقدية</p>
            <p className="text-2xl font-bold text-green-400">
              {data.collections.cash.totalAmount.toLocaleString("ar-SA")} جنيه
            </p>
            <p className="text-sm text-gray-500">({data.collections.cash.count} عملية)</p>
          </div>
        </div>
      </div>

      {/* أفضل العملاء */}
      {data.topCustomers.length > 0 && (
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">🏆 أفضل العملاء</h3>
          <div className="space-y-3">
            {data.topCustomers.map((customer: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "⭐"}</span>
                  <span className="text-white font-semibold">{customer.name}</span>
                </div>
                <span className="text-amber-400 font-bold">
                  {customer.totalAmount.toLocaleString("ar-SA")} جنيه
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverdueCustomersReport({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-12 text-center">
        <span className="text-6xl mb-4 block">✅</span>
        <h3 className="text-2xl font-bold text-white mb-2">رائع!</h3>
        <p className="text-gray-400">جميع العملاء قاموا بالسداد الكامل</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">⚠️ عملاء لديهم ديون متبقية</h3>
        <p className="text-gray-400 text-sm">إجمالي: {data.length} عميل</p>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-lg font-bold text-white">{item.customer.name}</h4>
                <p className="text-sm text-gray-400">{item.customer.phone}</p>
              </div>
              <div className="text-end">
                <p className="text-2xl font-bold text-red-400">
                  {item.remainingDebt.toLocaleString("ar-SA")} جنيه
                </p>
                <p className="text-xs text-gray-500">الدين المتبقي</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-500">إجمالي المبيعات</p>
                <p className="text-white font-semibold">
                  {item.totalSales.toLocaleString("ar-SA")} جنيه
                </p>
              </div>
              <div>
                <p className="text-gray-500">المدفوع</p>
                <p className="text-green-400 font-semibold">
                  {item.totalCashCollected.toLocaleString("ar-SA")} جنيه
                </p>
              </div>
              <div>
                <p className="text-gray-500">آخر دفعة</p>
                <p className="text-gray-400 font-semibold">
                  {item.daysSinceLastPayment !== null
                    ? `منذ ${item.daysSinceLastPayment} يوم`
                    : "لا يوجد"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailySalesReport({ data }: { data: any[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
        <span className="text-6xl mb-4 block">📊</span>
        <h3 className="text-2xl font-bold text-white mb-2">لا توجد مبيعات</h3>
        <p className="text-gray-400">لم يتم تسجيل أي مبيعات في هذه الفترة</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📅 المبيعات اليومية</h3>
        <div className="space-y-3">
          {data.map((day, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{day.date}</span>
                <div className="text-end">
                  <p className="text-white font-semibold">
                    {day.amount.toLocaleString("ar-SA")} جنيه
                  </p>
                  <p className="text-xs text-gray-500">
                    {day.count} عملية • {day.weight.toFixed(2)} جرام
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${(day.amount / maxAmount) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ملخص الفترة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-white">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">إجمالي المبلغ</p>
          <p className="text-2xl font-bold text-green-400">
            {data.reduce((sum, d) => sum + d.amount, 0).toLocaleString("ar-SA")} جنيه
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">إجمالي الوزن</p>
          <p className="text-2xl font-bold text-yellow-400">
            {data.reduce((sum, d) => sum + d.weight, 0).toFixed(2)} جرام
          </p>
        </div>
      </div>
    </div>
  );
}
