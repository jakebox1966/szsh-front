import { MapPin } from "lucide-react";
import { regionalTop } from "../data";

export function RegionalTopCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-purple-500" />
        <h3 className="font-bold text-[#1a1a1a]">지역별 1위 👑</h3>
      </div>
      <div className="space-y-3">
        {regionalTop.map((item) => (
          <div
            key={item.region}
            className="flex justify-between items-center"
          >
            <span className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
              {item.region}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">
                {item.company}
              </span>
              <span className="text-xs font-bold text-purple-600">
                {item.pay}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
