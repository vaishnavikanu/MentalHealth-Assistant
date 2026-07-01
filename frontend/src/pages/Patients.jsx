import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function Patients({ darkMode }) {
  const { t } = useLanguage();
  const [patients, setPatients] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await API.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.username.toLowerCase().includes(
      //include is used to check if the search term is present in the username or not
      searchTerm.toLowerCase(),
    ),
  );

  return (
    <div
      className={`
        min-h-full
        p-8
        transition-all
        duration-300
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      {/* HEADING */}
      <h1 className="text-5xl font-bold mb-2">{t("patients.title")}</h1>

      <p
        className={`text-lg mb-8 ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {t("patients.subtitle")}
      </p>

      <p className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        {t("patients.totalPatients")} {patients.length}
      </p>

      {/* SEARCH */}
      <input
        type="text"
        placeholder={t("patients.search")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`
          w-full
          max-w-md
          px-5
          py-3
          rounded-2xl
          border
          mb-8
          outline-none
          shadow-sm
          transition
          ${
            darkMode
              ? `
                  bg-[#1f2937]
                  border-gray-700
                  text-white
                  placeholder:text-gray-400
                  focus:border-[#2D6658]
                `
              : `
                  bg-white
                  border-[#7FB8A7]
                  text-black
                  placeholder:text-gray-500
                  focus:border-[#2D6658]
                  focus:ring-2
                  focus:ring-[#DCEFE9]
                `
          }
        `}
      />

      {/* NO PATIENT FOUND */}
      {filteredPatients.length === 0 && (
        <div className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {t("patients.noPatient")}
        </div>
      )}

      {/* PATIENT CARDS */}
      <div className="flex flex-col gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => {
              navigate(`/patient-history?patient=${patient.id}`);
            }}
            className={`
              rounded-3xl
              p-6
              shadow-sm
              hover:shadow-md
              hover:scale-[1.01]
              transition-all
              duration-300
              cursor-pointer
              border
              ${
                darkMode
                  ? `
                      bg-[#1f2937]
                      border-gray-700
                      hover:bg-[#374151]
                    `
                  : `
                      bg-white
                      border-gray-100
                      hover:bg-gray-50
                    `
              }
            `}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  👤 {patient.username}
                </h2>

                <p
                  className={`${darkMode ? "text-gray-300" : "text-gray-500"}`}
                >
                  {patient.email}
                </p>
              </div>

              <div className="text-[#5b9c8c] font-medium">
                {t("patients.viewHistory")} →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Patients;
