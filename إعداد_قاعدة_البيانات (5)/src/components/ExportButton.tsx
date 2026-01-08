import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ExportButton() {
  const allData = useQuery(api.sales.exportAllData);

  const handleExport = () => {
    if (!allData || allData.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const headers = [
      "التاريخ",
      "اسم العميل",
      "رقم الهاتف",
      "اسم المنتج",
      "العيار",
      "الوزن (جرام)",
      "السعر للجرام",
      "المبلغ الإجمالي",
      "ملاحظات",
    ];

    const rows = allData.map((sale) => [
      new Date(sale.saleDate).toLocaleDateString("ar-SA"),
      sale.customerName,
      sale.customerPhone,
      sale.productName,
      sale.karat,
      sale.weight.toFixed(2),
      sale.pricePerGram.toFixed(2),
      sale.totalAmount.toFixed(2),
      sale.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={!allData || allData.length === 0}
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
      تصدير البيانات
    </button>
  );
}
