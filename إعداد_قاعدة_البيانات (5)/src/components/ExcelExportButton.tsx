import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export function ExcelExportButton() {
  const sales = useQuery(api.sales.exportAllData);
  const collections = useQuery(api.collections.exportAllCollections);
  const customers = useQuery(api.customers.getMyCustomers);

  const handleExport = () => {
    if (!sales || !collections || !customers) {
      toast.error("جاري تحميل البيانات...");
      return;
    }

    try {
      // إنشاء ملف Excel جديد
      const workbook = XLSX.utils.book_new();

      // ورقة المبيعات
      const salesData = sales.map((sale) => ({
        "التاريخ": new Date(sale.saleDate).toLocaleDateString("ar-SA"),
        "اسم العميل": sale.customerName,
        "رقم الهاتف": sale.customerPhone,
        "اسم المنتج": sale.productName,
        "العيار": sale.karat,
        "الوزن (جرام)": sale.weight.toFixed(2),
        "السعر للجرام (ريال)": sale.pricePerGram.toFixed(2),
        "المبلغ الإجمالي (ريال)": sale.totalAmount.toFixed(2),
        "ملاحظات": sale.notes || "",
      }));
      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, "المبيعات");

      // ورقة التحصيلات
      const collectionsData = collections.map((collection) => ({
        "التاريخ": new Date(collection.collectionDate).toLocaleDateString(
          "ar-SA"
        ),
        "اسم العميل": collection.customerName,
        "رقم الهاتف": collection.customerPhone,
        "نوع التحصيل": collection.collectionType,
        "المبلغ/الوزن": collection.amount.toFixed(2),
        "طريقة الدفع": collection.paymentMethod || "-",
        "ملاحظات": collection.notes || "",
      }));
      const collectionsSheet = XLSX.utils.json_to_sheet(collectionsData);
      XLSX.utils.book_append_sheet(workbook, collectionsSheet, "التحصيلات");

      // ورقة العملاء
      const customersData = customers.map((customer) => ({
        "اسم العميل": customer.name,
        "رقم الهاتف": customer.phone,
        "العنوان": customer.address || "-",
        "تاريخ الإضافة": new Date(customer.createdAt).toLocaleDateString(
          "ar-SA"
        ),
        "ملاحظات": customer.notes || "",
      }));
      const customersSheet = XLSX.utils.json_to_sheet(customersData);
      XLSX.utils.book_append_sheet(workbook, customersSheet, "العملاء");

      // حساب الإحصائيات
      const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalWeight = sales.reduce((sum, s) => sum + s.weight, 0);
      const totalGoldCollections = collections
        .filter((c) => c.collectionType === "ذهب")
        .reduce((sum, c) => sum + c.amount, 0);
      const totalCashCollections = collections
        .filter((c) => c.collectionType === "نقدي")
        .reduce((sum, c) => sum + c.amount, 0);

      const statsData = [
        { "البيان": "إجمالي المبيعات (ريال)", "القيمة": totalSales.toFixed(2) },
        { "البيان": "إجمالي الوزن المباع (جرام)", "القيمة": totalWeight.toFixed(2) },
        { "البيان": "عدد المبيعات", "القيمة": sales.length },
        { "البيان": "تحصيلات الذهب (جرام)", "القيمة": totalGoldCollections.toFixed(2) },
        { "البيان": "التحصيلات النقدية (جنيه)", "القيمة": totalCashCollections.toFixed(2) },
        { "البيان": "عدد التحصيلات", "القيمة": collections.length },
        { "البيان": "عدد العملاء", "القيمة": customers.length },
      ];
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, "الإحصائيات");

      // تصدير الملف
      const fileName = `NEW_EGYPT_GOLD_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success("تم تصدير البيانات بنجاح! 📊");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  };

  const isLoading = !sales || !collections || !customers;

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {isLoading ? "جاري التحميل..." : "تصدير إلى Excel"}
    </button>
  );
}
