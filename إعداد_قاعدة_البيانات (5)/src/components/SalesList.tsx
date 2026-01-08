import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

interface SalesListProps {
  customers: Doc<"customers">[] | undefined;
  onAddSale: () => void;
}

export function SalesList({ customers, onAddSale }: SalesListProps) {
  const sales = useQuery(api.sales.getMySales, {});

  if (sales === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 bg-gray-700/50 rounded-xl mb-4">
          <svg
            className="w-12 h-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          لا توجد مبيعات بعد
        </h3>
        <p className="text-gray-400 mb-6">ابدأ بتسجيل مبيعاتك الآن</p>
        <button
          onClick={onAddSale}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          إضافة عملية بيع
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">سجل المبيعات</h2>
        <button
          onClick={onAddSale}
          className="px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + إضافة بيع
        </button>
      </div>

      <div className="space-y-3">
        {sales.map((sale) => (
          <div
            key={sale._id}
            className="bg-gray-900/50 border border-amber-500/30 rounded-lg p-4 hover:border-amber-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-bold rounded bg-amber-500/20 text-amber-400">
                    عيار {sale.karat}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {sale.productName}
                </h3>
                <p className="text-gray-400 text-sm">{sale.customerName}</p>
                <p className="text-gray-500 text-xs">{sale.customerPhone}</p>
              </div>
              <div className="text-end">
                <p className="text-xl font-bold text-amber-400">
                  {sale.totalAmount.toLocaleString("ar-SA")} ريال
                </p>
                <p className="text-sm text-gray-400">
                  {sale.weight.toFixed(2)} جرام
                </p>
                <p className="text-xs text-gray-500">
                  {sale.pricePerGram.toLocaleString("ar-SA")} ريال/جرام
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(sale.saleDate).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
            {sale.notes && (
              <p className="text-gray-500 text-sm mt-3 italic">{sale.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
