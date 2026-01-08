import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

interface CollectionsListProps {
  customers: Doc<"customers">[] | undefined;
  onAddCollection: () => void;
}

export function CollectionsList({
  customers,
  onAddCollection,
}: CollectionsListProps) {
  const collections = useQuery(api.collections.getMyCollections, {});

  if (collections === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (collections.length === 0) {
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          لا توجد تحصيلات بعد
        </h3>
        <p className="text-gray-400 mb-6">ابدأ بتسجيل تحصيلاتك الآن</p>
        <button
          onClick={onAddCollection}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          إضافة تحصيل
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">سجل التحصيلات</h2>
        <button
          onClick={onAddCollection}
          className="px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + إضافة تحصيل
        </button>
      </div>

      <div className="space-y-3">
        {collections.map((collection) => (
          <div
            key={collection._id}
            className={`bg-gray-900/50 border rounded-lg p-4 transition-all ${
              collection.collectionType === "ذهب"
                ? "border-amber-500/30 hover:border-amber-500/50"
                : "border-green-500/30 hover:border-green-500/50"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded ${
                      collection.collectionType === "ذهب"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {collection.collectionType === "ذهب" ? "🪙 ذهب" : "💵 نقدي"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {collection.customerName}
                </h3>
                <p className="text-gray-400 text-sm">
                  {collection.customerPhone}
                </p>
              </div>
              <div className="text-end">
                <p
                  className={`text-xl font-bold ${
                    collection.collectionType === "ذهب"
                      ? "text-amber-400"
                      : "text-green-400"
                  }`}
                >
                  {collection.amount.toLocaleString("ar-SA")}{" "}
                  {collection.collectionType === "ذهب" ? "جرام" : "جنيه"}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(collection.collectionDate).toLocaleDateString(
                    "ar-SA"
                  )}
                </p>
              </div>
            </div>
            {collection.collectionType === "نقدي" && collection.paymentMethod && (
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">طريقة الدفع</p>
                <p className="text-sm text-white font-medium">
                  {collection.paymentMethod}
                </p>
              </div>
            )}
            {collection.notes && (
              <p className="text-gray-500 text-sm mt-3 italic">
                {collection.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
