import { useState, useEffect } from "react";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function DoctorSuggestions({ darkMode }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await API.get(`/suggestions/${user.id}`);

      const sorted = [...response.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setSuggestions(sorted);
      if (sorted.length > 0) {
        localStorage.setItem("lastSeenSuggestion", sorted[0].id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`
        min-h-full
        px-8
        py-6
        pb-20
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      <h1 className="text-5xl font-bold mb-2">
        {t("doctorSuggestions.title")}
      </h1>

      <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        {t("doctorSuggestions.subtitle")}
      </p>

      {suggestions.length === 0 ? (
        <div
          className={`
            rounded-2xl
            p-5
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          {t("doctorSuggestions.noSuggestions")}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`
                  rounded-2xl
                  p-5
                  shadow-sm
                  ${darkMode ? "bg-[#1f2937]" : "bg-white"}
                `}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-[#458d7b]">
                  {t("doctorSuggestions.doctor")}: {item.doctor_name}
                </h3>

                <div
                  className={`text-base text-right ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {new Date(item.created_at).toLocaleDateString()}
                  {" , "}
                  {new Date(item.created_at).toLocaleTimeString()}
                </div>
              </div>

              <p className={`text-lg`}>{item.suggestion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorSuggestions;
