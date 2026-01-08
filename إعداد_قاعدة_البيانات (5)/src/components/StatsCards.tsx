interface StatsCardsProps {
  salesStats:
    | {
        count: number;
        totalAmount: number;
        totalWeight: number;
        karat18: { count: number; totalAmount: number; totalWeight: number };
        karat21: { count: number; totalAmount: number; totalWeight: number };
      }
    | null
    | undefined;
  collectionsStats:
    | {
        count: number;
        goldCount: number;
        cashCount: number;
        totalGold: number;
        totalCash: number;
      }
    | null
    | undefined;
  customersCount: number;
}

export function StatsCards({
  salesStats,
  collectionsStats,
  customersCount,
}: StatsCardsProps) {
  return (
    <div className="mb-8">
      {/* إحصائيات عامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* عدد العملاء */}
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">
            إجمالي العملاء
          </h3>
          <p className="text-3xl font-bold text-white">{customersCount}</p>
        </div>

        {/* مبيعات عيار 21 الأسبوعية */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <span className="text-2xl">💍</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">
            مبيعات عيار 21 (أسبوعياً)
          </h3>
          <p className="text-3xl font-bold text-white">
            {salesStats?.karat21.count ?? 0}
          </p>
          <p className="text-sm text-amber-400 mt-2 font-semibold">
            {(salesStats?.karat21.totalWeight ?? 0).toFixed(2)} جرام
          </p>
        </div>

        {/* مبيعات عيار 18 الأسبوعية */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <span className="text-2xl">✨</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">
            مبيعات عيار 18 (أسبوعياً)
          </h3>
          <p className="text-3xl font-bold text-white">
            {salesStats?.karat18.count ?? 0}
          </p>
          <p className="text-sm text-yellow-400 mt-2 font-semibold">
            {(salesStats?.karat18.totalWeight ?? 0).toFixed(2)} جرام
          </p>
        </div>

        {/* تحصيلات الذهب الأسبوعية */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <span className="text-2xl">🪙</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">
            تحصيلات الذهب (أسبوعياً)
          </h3>
          <p className="text-3xl font-bold text-white">
            {collectionsStats?.goldCount ?? 0}
          </p>
          <p className="text-sm text-amber-400 mt-2 font-semibold">
            {(collectionsStats?.totalGold ?? 0).toFixed(2)} جرام
          </p>
        </div>
      </div>

      {/* بطاقة التحصيلات النقدية - صف منفصل */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <span className="text-2xl">💵</span>
            </div>
          </div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">
            التحصيلات النقدية (أسبوعياً)
          </h3>
          <p className="text-3xl font-bold text-white">
            {collectionsStats?.cashCount ?? 0}
          </p>
          <p className="text-sm text-green-400 mt-2 font-semibold">
            {(collectionsStats?.totalCash ?? 0).toLocaleString("ar-SA")} جنيه
          </p>
        </div>
      </div>
    </div>
  );
}
