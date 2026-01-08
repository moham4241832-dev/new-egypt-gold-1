import type { Doc } from "../../convex/_generated/dataModel";

interface CustomersListProps {
  customers: (Doc<"customers"> & { employeeName?: string })[] | undefined;
  onAddCustomer: () => void;
}

export function CustomersList({ customers, onAddCustomer }: CustomersListProps) {
  if (customers === undefined) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  if (customers.length === 0) {
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          لا يوجد عملاء بعد
        </h3>
        <p className="text-gray-400 mb-6">ابدأ بإضافة عملائك الآن</p>
        <button
          onClick={onAddCustomer}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-bold rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          إضافة عميل جديد
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">قائمة العملاء</h2>
        <button
          onClick={onAddCustomer}
          className="px-4 py-2 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + إضافة عميل
        </button>
      </div>

      <div className="space-y-3">
        {customers.map((customer) => (
          <div
            key={customer._id}
            className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {customer.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <p className="text-gray-400 text-sm">{customer.phone}</p>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-sm">{customer.email}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-500 text-sm">{customer.address}</p>
                    </div>
                  )}
                  {customer.employeeName && (
                    <div className="flex items-center gap-2 mt-2">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="text-amber-400 text-sm font-medium">الموظف: {customer.employeeName}</p>
                    </div>
                  )}
                </div>
                {customer.notes && (
                  <p className="text-gray-500 text-sm mt-3 italic bg-gray-800/50 p-2 rounded">
                    {customer.notes}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
