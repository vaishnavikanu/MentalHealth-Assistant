import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import MoodGraph from "../components/MoodGraph";
import ChatHistoryCard from "../components/ChatHistoryCard";
import MoodHistoryCard from "../components/MoodHistoryCard";
import JournalHistoryCard from "../components/JournalHistoryCard";
import API from "../api/api";

function PatientHistory({ darkMode }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [chatHistory, setChatHistory] = useState([]);

  const [moodHistory, setMoodHistory] = useState([]);

  const [journalHistory, setJournalHistory] = useState([]);

  const [patientInfo, setPatientInfo] = useState(null);

  const [suggestion, setSuggestion] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  const [showAllChats, setShowAllChats] = useState(false);

  const [showAllMoods, setShowAllMoods] = useState(false);

  const [showAllJournals, setShowAllJournals] = useState(false);

  const [showAllSuggestions, setShowAllSuggestions] = useState(false);

  const [activeTab, setActiveTab] = useState("chat");

  const queryParams = new URLSearchParams(location.search);

  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = queryParams.get("patient");

  useEffect(() => {
    const container = document.getElementById("main-content");

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [patientId]);
  useEffect(() => {
    fetchHistory();

    fetchSuggestions();
  }, [patientId]);

  const fetchHistory = async () => {
    try {
      const response = await API.get(`/history/${patientId}`);

      setPatientInfo(response.data.patient);

      setChatHistory(response.data.chats);

      setMoodHistory(response.data.moods);

      setJournalHistory(response.data.journals);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSuggestions = async () => {
    try {
      const response = await API.get(`/suggestions/${patientId}`);

      setSuggestions(
        [...response.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const saveSuggestion = async () => {
    if (!suggestion.trim()) {
      return;
    }

    try {
      await API.post("/suggestion", {
        patient_id: patientId,
        doctor_id: user.id,
        suggestion: suggestion,
      });

      setSuggestion("");

      fetchSuggestions();
    } catch (error) {
      console.log(error);
    }
  };

  const displayedSuggestions = showAllSuggestions
    ? suggestions
    : suggestions.slice(0, 3);

  return (
    <div
      className={`
        min-h-full
        px-8
        py-6
        pb-20
        transition-all
        duration-300
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      {/* HEADING */}
      <h1 className="text-5xl font-bold mb-2">{t("history.patientHistory")}</h1>

      <p
        className={`mb-10 text-lg ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {t("history.viewPatientRecords")}
      </p>

      {patientInfo && (
        <div
          className={`mb-10 rounded-2xl p-5 ${
            darkMode ? "bg-[#1f2937]" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-semibold mb-3">
            {t("history.patientInformation")}
          </h2>

          <p className="mb-2">
            <strong>{t("history.name")}:</strong> {patientInfo.username}
          </p>

          <p>
            <strong>{t("history.email")}:</strong> {patientInfo.email}
          </p>
        </div>
      )}

      {/* HISTORY TABS */}

      <div
        className="
          flex
          gap-3
          mb-10
          overflow-x-auto
          overflow-y-hidden
          whitespace-nowrap
          pb-2
          hide-scrollbar
          snap-x
          snap-mandatory
          touch-pan-x
        "
      >
        <button
          onClick={() => setActiveTab("chat")}
          className={`
            shrink-0
            snap-start
            whitespace-nowrap
            px-6
            py-3
            rounded-full
            font-semibold
            transition-all
            duration-300
            ${
              activeTab === "chat"
                ? "bg-[#2D6658] text-white shadow-lg"
                : darkMode
                  ? "bg-[#1f2937] text-gray-300 hover:bg-[#2B3A4A]"
                  : "bg-white text-gray-700 hover:bg-[#DCEFE9]"
            }
          `}
        >
          {t("history.chatHistory")}
        </button>

        <button
          onClick={() => setActiveTab("mood")}
          className={`
            shrink-0
            snap-start
            whitespace-nowrap
            px-6
            py-3
            rounded-full
            font-semibold
            transition-all
            duration-300
            ${
              activeTab === "mood"
                ? "bg-[#2D6658] text-white shadow-lg"
                : darkMode
                  ? "bg-[#1f2937] text-gray-300 hover:bg-[#2B3A4A]"
                  : "bg-white text-gray-700 hover:bg-[#DCEFE9]"
            }
          `}
        >
          {t("history.moodHistory")}
        </button>

        <button
          onClick={() => setActiveTab("journal")}
          className={`
            shrink-0
            snap-start
            whitespace-nowrap
            px-6
            py-3
            rounded-full
            font-semibold
            transition-all
            duration-300
            ${
              activeTab === "journal"
                ? "bg-[#2D6658] text-white shadow-lg"
                : darkMode
                  ? "bg-[#1f2937] text-gray-300 hover:bg-[#2B3A4A]"
                  : "bg-white text-gray-700 hover:bg-[#DCEFE9]"
            }
          `}
        >
          {t("history.journalHistory")}
        </button>

        <button
          onClick={() => setActiveTab("suggestion")}
          className={`
            shrink-0
            snap-start
            whitespace-nowrap
            px-6
            py-3
            rounded-full
            font-semibold
            transition-all
            duration-300
            ${
              activeTab === "suggestion"
                ? "bg-[#2D6658] text-white shadow-lg"
                : darkMode
                  ? "bg-[#1f2937] text-gray-300 hover:bg-[#2B3A4A]"
                  : "bg-white text-gray-700 hover:bg-[#DCEFE9]"
            }
          `}
        >
          {t("history.doctorSuggestions")}
        </button>
      </div>

      {/* CHAT HISTORY */}
      {activeTab === "chat" && (
        <div className="mb-14">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold">
              {t("history.chatHistory")}
            </h2>

            {chatHistory.length > 5 && (
              <button
                onClick={() => setShowAllChats(!showAllChats)}
                className="
              bg-[#2D6658]
              hover:bg-[#245247]
              transition
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
              "
              >
                {showAllChats ? t("common.showLess") : t("common.seeMore")}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {chatHistory.length === 0 ? (
              <div
                className={`
                rounded-2xl
                p-4
                ${darkMode ? "bg-[#1f2937]" : "bg-white"}
              `}
              >
                {t("history.noChatHistory")}
              </div>
            ) : (
              (showAllChats ? chatHistory : chatHistory.slice(0, 5)).map(
                (chat) => (
                  <ChatHistoryCard
                    key={chat.id}
                    chat={chat}
                    darkMode={darkMode}
                    patientId={patientId}
                    navigateTo="/doctor-chat-view"
                  />
                ),
              )
            )}
          </div>
        </div>
      )}

      {/* MOOD HISTORY */}
      {activeTab === "mood" && (
        <>
          {/* MOOD TRACKER */}
          <div className="mb-14">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">
                {t("history.moodTracker")}
              </h2>
            </div>

            <MoodGraph moods={moodHistory} darkMode={darkMode} />
          </div>

          <div className="mb-14">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">
                {t("history.moodHistory")}
              </h2>

              {moodHistory.length > 5 && (
                <button
                  onClick={() => setShowAllMoods(!showAllMoods)}
                  className="
              bg-[#2D6658]
              hover:bg-[#245247]
              transition
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
              "
                >
                  {showAllMoods ? t("common.showLess") : t("common.seeMore")}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {moodHistory.length === 0 ? (
                <div
                  className={`
                rounded-2xl
                p-4
                ${darkMode ? "bg-[#1f2937]" : "bg-white"}
              `}
                >
                  {t("history.noMoodHistory")}
                </div>
              ) : (
                (showAllMoods ? moodHistory : moodHistory.slice(0, 5)).map(
                  (mood) => (
                    <MoodHistoryCard
                      key={mood.id}
                      mood={mood}
                      darkMode={darkMode}
                    />
                  ),
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* JOURNAL HISTORY */}
      {activeTab === "journal" && (
        <>
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">
                {t("history.journalHistory")}
              </h2>

              {journalHistory.length > 5 && (
                <button
                  onClick={() => setShowAllJournals(!showAllJournals)}
                  className="
               bg-[#2D6658]
              hover:bg-[#245247]
              transition
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
              "
                >
                  {showAllJournals ? t("common.showLess") : t("common.seeMore")}
                </button>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {journalHistory.length === 0 ? (
                <div
                  className={`
                rounded-2xl
                p-4
                ${darkMode ? "bg-[#1f2937]" : "bg-white"}
              `}
                >
                  {t("history.noJournalHistory")}
                </div>
              ) : (
                (showAllJournals
                  ? journalHistory
                  : journalHistory.slice(0, 5)
                ).map((journal) => (
                  <JournalHistoryCard
                    key={journal.id}
                    journal={journal}
                    darkMode={darkMode}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
      {activeTab === "suggestion" && (
        <>
          <div className="mt-14">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-semibold">
                {t("history.doctorSuggestions")}
              </h2>

              {suggestions.length > 3 && (
                <button
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="
                bg-[#2D6658]
                hover:bg-[#245247]
                text-white
                px-4
                py-2
                rounded-xl
                text-sm
              "
                >
                  {showAllSuggestions
                    ? t("common.showLess")
                    : t("common.seeMore")}
                </button>
              )}
            </div>

            <div
              className={`rounded-2xl p-5 mb-6 ${
                darkMode ? "bg-[#1f2937]" : "bg-white"
              }`}
            >
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                rows={4}
                placeholder={t("history.writeSuggestion")}
                className={`
              w-full
              rounded-xl
              p-4
              mb-4
              outline-none
              resize-none
              ${darkMode ? "bg-[#374151] text-white" : "bg-gray-100 text-black"}
            `}
              />

              <button
                onClick={saveSuggestion}
                className="
              bg-[#2D6658]
              hover:bg-[#245247]
              text-white
              px-5
              py-2
              rounded-xl
            "
              >
                {t("history.saveSuggestion")}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {displayedSuggestions.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-5 ${
                    darkMode ? "bg-[#1f2937]" : "bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p
                      className={`max-w-[75%] ${
                        darkMode ? "text-gray-200" : "text-black"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-2 text-[#5ea493]">
                            Dr. {item.doctor_name}
                          </h3>

                          <p>{item.suggestion}</p>
                        </div>
                      </div>
                    </p>

                    <p
                      className={`text-sm text-right ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PatientHistory;
