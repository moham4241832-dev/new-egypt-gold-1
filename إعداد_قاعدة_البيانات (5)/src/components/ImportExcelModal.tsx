import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ImportExcelModalProps {
  onClose: () => void;
}

type ImportType = "customers" | "sales";

export function ImportExcelModal({ onClose }: ImportExcelModalProps) {
  const [importType, setImportType] = useState<ImportType>("customers");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importCustomers = useMutation(api.customers.importCustomers);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        toast.error("الرجاء اختيار ملف Excel أو CSV");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const processCustomersFile = async (data: any[]) => {
    const customers = data
      .filter((row) => row["الاسم"] || row["name"])
      .map((row) => ({
        name: row["الاسم"] || row["name"] || "",
        phone: String(row["الهاتف"] || row["phone"] || ""),
        email: row["البريد الإلكتروني"] || row["email"] || undefined,
        address: row["العنوان"] || row["address"] || undefined,
        notes: row["ملاحظات"] || row["notes"] || undefined,
      }))
      .filter((customer) => customer.name && customer.phone);

    if (customers.length === 0) {
      toast.error("لم يتم العثور على بيانات صالحة في الملف");
      return;
    }

    try {
      const result = await importCustomers({ customers });
      
      if (result.success > 0) {
        toast.success(`تم استيراد ${result.success} عميل بنجاح! ✨`);
      }
      
      if (result.failed > 0) {
        toast.warning(`فشل استيراد ${result.failed} عميل`);
        console.error("أخطاء الاستيراد:", result.errors);
      }
      
      if (result.success > 0) {
        onClose();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الاستيراد";
      toast.error(message);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("الرجاء اختيار ملف أولاً");
      return;
    }

    setIsProcessing(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (importType === "customers") {
            await processCustomersFile(jsonData);
          }
        } catch (error) {
          toast.error("فشل قراءة الملف. تأكد من صحة التنسيق");
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        toast.error("حدث خطأ أثناء قراءة الملف");
        setIsProcessing(false);
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        "الاسم": "محمد أحمد",
        "الهاتف": "0501234567",
        "البريد الإلكتروني": "mohamed@example.com",
        "العنوان": "الرياض، حي النخيل",
        "ملاحظات": "عميل مميز",
      },
      {
        "الاسم": "فاطمة علي",
        "الهاتف": "0559876543",
        "البريد الإلكتروني": "",
        "العنوان": "جدة، حي الروضة",
        "ملاحظات": "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");
    XLSX.writeFile(wb, "قالب_العملاء.xlsx");
    
    toast.success("تم تحميل القالب بنجاح!");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">استيراد من Excel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              نوع البيانات المراد استيرادها
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setImportType("customers")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  importType === "customers"
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                    : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                }`}
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-semibold">العملاء</span>
              </button>
              <button
                onClick={() => setImportType("sales")}
                disabled
                className="p-4 rounded-lg border-2 border-gray-700 bg-gray-900/50 text-gray-600 cursor-not-allowed"
              >
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">المبيعات</span>
                <span className="block text-xs mt-1">(قريباً)</span>
              </button>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-blue-400 font-semibold mb-1">تنسيق الملف المطلوب</h3>
                <p className="text-sm text-gray-300 mb-3">
                  يجب أن يحتوي ملف Excel على الأعمدة التالية:
                </p>
                <ul className="text-sm text-gray-400 space-y-1 mb-3">
                  <li>• <strong>الاسم</strong> (إجباري)</li>
                  <li>• <strong>الهاتف</strong> (إجباري)</li>
                  <li>• البريد الإلكتروني (اختياري)</li>
                  <li>• العنوان (اختياري)</li>
                  <li>• ملاحظات (اختياري)</li>
                </ul>
                <button
                  onClick={downloadTemplate}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  تحميل ملف قالب جاهز
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اختر ملف Excel
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-yellow-500 transition-all"
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-right">
                    <p className="text-white font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300 mb-1">اضغط لاختيار ملف Excel</p>
                  <p className="text-sm text-gray-500">أو اسحب الملف وأفلته هنا</p>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  جاري الاستيراد...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  استيراد البيانات
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
