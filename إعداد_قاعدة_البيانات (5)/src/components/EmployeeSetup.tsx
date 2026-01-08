import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function EmployeeSetup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const createEmployee = useMutation(api.employees.createEmployee);
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("الرجاء إدخال جميع البيانات");
      return;
    }

    try {
      await createEmployee({ name, phone });
      toast.success("تم إنشاء ملفك بنجاح!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "حدث خطأ ما";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 border border-amber-900/30">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img 
                src="https://polished-pony-114.convex.cloud/api/storage/474bbac8-4741-42c6-9681-8ab68ae8b470"
                alt="NEW EGYPT GOLD"
                className="w-20 h-20 object-contain mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              إعداد ملف الموظف
            </h2>
            <p className="text-gray-400">أدخل بياناتك للبدء</p>
            {loggedInUser?.email && (
              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                <p className="text-sm text-amber-400">
                  📧 الإيميل: {loggedInUser.email}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {loggedInUser.email === "admin@newegyptgold.com" 
                    ? "🔑 سيتم تسجيلك كمدير تلقائياً" 
                    : "👤 سيتم تسجيلك كموظف مبيعات"}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                placeholder="أدخل اسمك"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                placeholder="05xxxxxxxx"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              إنشاء الملف
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-300 text-center">
              💡 سيتم حفظ بياناتك تلقائياً ولن تحتاج لإدخالها مرة أخرى
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
