import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { StatsCards } from "./StatsCards";
import { CustomersList } from "./CustomersList";
import { SalesList } from "./SalesList";
import { CollectionsList } from "./CollectionsList";
import { AddCustomerModal } from "./AddCustomerModal";
import { AddSaleModal } from "./AddSaleModal";
import { AddCollectionModal } from "./AddCollectionModal";
import { ExcelExportButton } from "./ExcelExportButton";
import { ImportExcelModal } from "./ImportExcelModal";
import { ReportsPanel } from "./ReportsPanel";
import type { Doc } from "../../convex/_generated/dataModel";

type TabType = "customers" | "sales" | "collections" | "reports";

interface DashboardProps {
  employee: Doc<"employees">;
}

export function Dashboard({ employee }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("customers");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSale, setShowAddSale] = useState(false);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [showImportExcel, setShowImportExcel] = useState(false);

  const customers = useQuery(api.customers.getMyCustomers);
  const salesStats = useQuery(api.sales.getWeeklySalesStats);
  const collectionsStats = useQuery(api.collections.getWeeklyCollectionsStats);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-950/80 via-gray-900/80 to-black/80 backdrop-blur-lg border-b border-amber-900/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://polished-pony-114.convex.cloud/api/storage/474bbac8-4741-42c6-9681-8ab68ae8b470"
                alt="NEW EGYPT GOLD"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">
                  مرحباً، {employee.name}
                </h1>
                <p className="text-sm text-gray-400">{employee.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportExcel(true)}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                استيراد Excel
              </button>
              <ExcelExportButton />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <StatsCards
          salesStats={salesStats}
          collectionsStats={collectionsStats}
          customersCount={customers?.length || 0}
        />

        {/* Tabs */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl border border-amber-900/30 overflow-hidden">
          <div className="border-b border-amber-900/30">
            <div className="flex">
              <button
                onClick={() => setActiveTab("customers")}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === "customers"
                    ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-white hover:bg-amber-950/30"
                }`}
              >
                العملاء
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === "sales"
                    ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-white hover:bg-amber-950/30"
                }`}
              >
                المبيعات
              </button>
              <button
                onClick={() => setActiveTab("collections")}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === "collections"
                    ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-white hover:bg-amber-950/30"
                }`}
              >
                التحصيلات
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === "reports"
                    ? "bg-amber-500/10 text-amber-400 border-b-2 border-amber-500"
                    : "text-gray-400 hover:text-white hover:bg-amber-950/30"
                }`}
              >
                التقارير
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "customers" && (
              <CustomersList
                customers={customers}
                onAddCustomer={() => setShowAddCustomer(true)}
              />
            )}
            {activeTab === "sales" && (
              <SalesList
                customers={customers}
                onAddSale={() => setShowAddSale(true)}
              />
            )}
            {activeTab === "collections" && (
              <CollectionsList
                customers={customers}
                onAddCollection={() => setShowAddCollection(true)}
              />
            )}
            {activeTab === "reports" && (
              <ReportsPanel employee={employee} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddCustomer && (
        <AddCustomerModal onClose={() => setShowAddCustomer(false)} />
      )}
      {showAddSale && customers && (
        <AddSaleModal
          isOpen={showAddSale}
          customers={customers}
          onClose={() => setShowAddSale(false)}
        />
      )}
      {showAddCollection && customers && (
        <AddCollectionModal
          customers={customers}
          onClose={() => setShowAddCollection(false)}
        />
      )}
      {showImportExcel && (
        <ImportExcelModal onClose={() => setShowImportExcel(false)} />
      )}
    </div>
  );
}
