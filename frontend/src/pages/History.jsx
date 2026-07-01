import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import MoodGraph from "../components/MoodGraph";
import ChatHistoryCard from "../components/ChatHistoryCard";
import MoodHistoryCard from "../components/MoodHistoryCard";
import JournalHistoryCard from "../components/JournalHistoryCard";
import API from "../api/api";

function History({ darkMode }) {
  //STORING A NAVIGATION FUNCTION
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [chatHistory, setChatHistory] = useState([]);

  const [moodHistory, setMoodHistory] = useState([]);

  const [journalHistory, setJournalHistory] = useState([]);

  const [patientInfo, setPatientInfo] = useState(null);

  const [showAllChats, setShowAllChats] = useState(false);

  const [showAllMoods, setShowAllMoods] = useState(false);

  const [showAllJournals, setShowAllJournals] = useState(false);

  const [activeTab, setActiveTab] = useState("chat");

  const user = JSON.parse(localStorage.getItem("user"));

  const queryParams = new URLSearchParams(location.search);

  const patientId = queryParams.get("patient");
  /* FETCH HISTORY */
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await API.get(`/history/${patientId || user.id}`);

      setPatientInfo(response.data.patient);

      setChatHistory(response.data.chats);

      setMoodHistory(
        [...response.data.moods].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );

      setJournalHistory(
        [...response.data.journals].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await API.delete(`/chat-session/${chatId}`);

      fetchHistory();
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
        transition-all
        duration-300
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      {/* HEADING */}
      <h1 className="text-5xl font-bold mb-2">
        {patientId
          ? t("history.patientHistory")
          : user.role === "doctor"
            ? t("history.myHistory")
            : t("history.history")}
      </h1>

      <p
        className={`mb-10 text-lg ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {patientId
          ? t("history.viewPatientRecords")
          : user.role === "doctor"
            ? t("history.viewOwnHistory")
            : t("history.viewActivities")}
      </p>

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

        {(user.role === "patient" || patientId) && (
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
        )}

        {(user.role === "patient" || patientId) && (
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
        )}
      </div>

      {/* CHAT HISTORY */}
      {activeTab === "chat" && (
        <>
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
                      deleteChat={deleteChat}
                      navigateTo="/"
                    />
                  ),
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* MOOD HISTORY */}
      {activeTab === "mood" && (
        <>
          {user.role === "patient" || patientId ? (
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
                      //FOR THE COMPLETE CARD
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
          ) : null}
        </>
      )}

      {/*MOOD TRACKER --- VISIBLE ONLY TO DOCTOR*/}

      {patientId && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">{t("history.moodTracker")}</h2>
        </div>
      )}

      {patientId && <MoodGraph moods={moodHistory} darkMode={darkMode} />}

      {/* JOURNAL HISTORY */}
      {activeTab === "journal" && (
        <>
          {(user.role === "patient" || patientId) && (
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
                    {showAllJournals
                      ? t("common.showLess")
                      : t("common.seeMore")}
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
                    //FOR CARD
                    <JournalHistoryCard
                      key={journal.id}
                      journal={journal}
                      darkMode={darkMode}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default History;
