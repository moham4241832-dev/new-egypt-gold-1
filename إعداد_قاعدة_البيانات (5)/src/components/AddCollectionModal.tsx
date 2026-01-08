import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Doc, Id } from "../../convex/_generated/dataModel";

interface AddCollectionModalProps {
  customers: Doc<"customers">[];
  onClose: () => void;
}

export function AddCollectionModal({
  customers,
  onClose,
}: AddCollectionModalProps) {
  const [customerId, setCustomerId] = useState<Id<"customers"> | "">("");
  const [collectionType, setCollectionType] = useState("نقدي");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("نقدي");
  const [notes, setNotes] = useState("");
  const addCollection = useMutation(api.collections.addCollection);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !amount) {
      toast.error("الرجاء إدخال العميل والمبلغ");
      return;
    }

    try {
      await addCollection({
        customerId: customerId as Id<"customers">,
        collectionType,
        amount: parseFloat(amount),
        paymentMethod: collectionType === "نقدي" ? paymentMethod : undefined,
        notes: notes || undefined,
      });
      toast.success("تم تسجيل التحصيل بنجاح!");
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ ما";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">إضافة تحصيل</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                نوع التحصيل *
              </label>
              <select
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              >
                <option value="نقدي">تحصيل نقدي (جنيه مصري)</option>
                <option value="ذهب">تحصيل ذهب (جرام)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                العميل *
              </label>
              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value as Id<"customers"> | "")
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
              >
                <option value="">اختر العميل</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {collectionType === "ذهب" ? "الوزن (جرام) *" : "المبلغ (جنيه مصري) *"}
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                placeholder={collectionType === "ذهب" ? "0.00 جرام" : "0.00 جنيه"}
              />
            </div>

            {collectionType === "نقدي" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  طريقة الدفع *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                >
                  <option value="نقدي">نقدي</option>
                  <option value="تحويل بنكي">تحويل بنكي</option>
                  <option value="شيك">شيك</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ملاحظات
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                placeholder="أي ملاحظات إضافية (اختياري)"
              />
            </div>

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
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-400 hover:to-green-500 transition-all shadow-lg hover:shadow-xl"
              >
                تسجيل التحصيل
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
