import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Doc<"customers">[] | undefined;
}

export function AddSaleModal({
  isOpen,
  onClose,
  customers,
}: AddSaleModalProps) {
  const [customerId, setCustomerId] = useState<Id<"customers"> | "">("");
  const [productName, setProductName] = useState("");
  const [karat, setKarat] = useState<"18" | "21">("21");
  const [weight, setWeight] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");
  const [notes, setNotes] = useState("");

  const addSale = useMutation(api.sales.addSale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !productName || !weight || !pricePerGram) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await addSale({
        customerId: customerId as Id<"customers">,
        productName,
        karat,
        weight: parseFloat(weight),
        pricePerGram: parseFloat(pricePerGram),
        notes: notes || undefined,
      });

      toast.success("تم إضافة عملية البيع بنجاح!");
      
      // إعادة تعيين النموذج
      setCustomerId("");
      setProductName("");
      setKarat("21");
      setWeight("");
      setPricePerGram("");
      setNotes("");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ أثناء إضافة البيع";
      toast.error(message);
    }
  };

  if (!isOpen) return null;

  const totalAmount =
    weight && pricePerGram
      ? (parseFloat(weight) * parseFloat(pricePerGram)).toFixed(2)
      : "0";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              إضافة عملية بيع
            </h2>
            <button
              onClick={onClose}
              className="text-gray-900 hover:text-gray-700 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* اختيار العميل */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              العميل *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value as Id<"customers">)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              required
            >
              <option value="">اختر العميل</option>
              {customers?.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>

          {/* اسم المنتج */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اسم المنتج *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              placeholder="مثال: سلسلة، خاتم، أسورة"
              required
            />
          </div>

          {/* العيار */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              العيار *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setKarat("18")}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  karat === "18"
                    ? "bg-amber-500 text-gray-900 shadow-lg"
                    : "bg-gray-900 text-gray-400 border border-gray-700 hover:border-amber-500"
                }`}
              >
                عيار 18
              </button>
              <button
                type="button"
                onClick={() => setKarat("21")}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  karat === "21"
                    ? "bg-amber-500 text-gray-900 shadow-lg"
                    : "bg-gray-900 text-gray-400 border border-gray-700 hover:border-amber-500"
                }`}
              >
                عيار 21
              </button>
            </div>
          </div>

          {/* الوزن */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الوزن (جرام) *
            </label>
            <input
              type="number"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>

          {/* سعر الجرام */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              سعر الجرام (ريال) *
            </label>
            <input
              type="number"
              step="0.01"
              value={pricePerGram}
              onChange={(e) => setPricePerGram(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>

          {/* المبلغ الإجمالي */}
          {totalAmount !== "0" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">المبلغ الإجمالي</p>
              <p className="text-2xl font-bold text-amber-400">
                {parseFloat(totalAmount).toLocaleString("ar-SA")} ريال
              </p>
            </div>
          )}

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ملاحظات
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
              rows={3}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              حفظ البيع
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
