import { useState, useEffect } from "react";
import API from "../api/api";
import MoodCalendar from "../components/MoodCalendar";
import { useLanguage } from "../context/LanguageContext";
function CheckIn({ darkMode }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { t } = useLanguage();

  const moods = ["😊", "😔", "😡", "😰", "😴", "😍"];

  const [selectedMood, setSelectedMood] = useState("");

  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");

  const [recentCheckins, setRecentCheckins] = useState([]);

  const [showAll, setShowAll] = useState(false);

  /* FETCH CHECKINS */
  const fetchCheckins = async () => {
    try {
      const response = await API.get(`/moods/${user.id}`);

      const formattedData = response.data.map((item) => ({
        id: item.id,

        mood: item.mood,

        note: item.note,

        created_at: item.created_at,

        date: new Date(item.created_at).toLocaleDateString(),

        time: new Date(item.created_at).toLocaleTimeString(),
      }));

      formattedData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );

      setRecentCheckins(formattedData);

      const sortedData = formattedData.sort(
        (a, b) =>
          new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`),
      );

      setRecentCheckins(sortedData);
    } catch (error) {
      console.log(error);
    }
  };

  /* LOAD ON PAGE OPEN */
  useEffect(() => {
    fetchCheckins();
  }, []);

  /* SAVE CHECKIN */
  const saveCheckIn = async () => {
    if (!selectedMood) {
      setMessage(t("checkin.selectMood"));
      /*TIME THE MSG STAY ON SCREEN*/
      setTimeout(() => {
        setMessage("");
      }, 3000);

      return;
    }

    try {
      /* SEND TO BACKEND */
      await API.post("/mood", {
        user_id: user.id,

        mood: selectedMood,

        note: note,
      });

      /* REFRESH RECENT CHECKIN DATA */
      await fetchCheckins();

      setMessage(t("checkin.saved"));

      setSelectedMood("");

      setNote("");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setMessage(t("checkin.failed"));
    }
  };

  const deleteMood = async (moodId) => {
    try {
      await API.delete(`/mood/${moodId}`);

      fetchCheckins();

      setMessage(t("checkin.deleted"));

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setMessage(t("checkin.deleteFailed"));
    }
  };

  /* SHOW ONLY 5 */
  const displayedEntries = showAll
    ? recentCheckins
    : recentCheckins.slice(0, 5);

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
      <h1 className="text-5xl font-bold mb-2">{t("checkin.title")}</h1>

      <p
        className={`text-lg mb-8 ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {t("checkin.subtitle")}
      </p>

      {/* MESSAGE */}
      {message && (
        <div
          className="
          bg-[#DCEFE9]
          text-[#1E4A3F]
            px-4
            py-3
            rounded-xl
            mb-6
            text-sm
            font-medium
          "
        >
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* LEFT SIDE */}

        <div className="xl:col-span-2 flex flex-col gap-8">
          {/* MOOD CARD */}
          <div
            className={`
          rounded-3xl
          p-6
          mb-8
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
          >
            <h2 className="text-3xl font-semibold mb-6">
              {t("checkin.howFeeling")}
            </h2>

            <div className="flex gap-5 flex-wrap">
              {moods.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(mood)}
                  className={`
                text-4xl
                p-5
                rounded-2xl
                transition
                ${
                  selectedMood === mood
                    ? "bg-[#2D6658] scale-110 shadow-lg shadow-[#2D6658]/30"
                    : darkMode
                      ? "bg-[#374151]"
                      : "bg-gray-100"
                }
              `}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* NOTE CARD */}
          <div
            className={`
          rounded-3xl
          p-5
          mb-8
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
          >
            <h2 className="text-3xl font-semibold mb-5">
              {t("checkin.addNote")}
            </h2>

            <textarea
              rows={5}
              placeholder={t("checkin.notePlaceholder")}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`
            w-full
            rounded-2xl
            p-5
            outline-none
            resize-none
            mb-5
            transition-all
            ${
              darkMode
                ? "bg-[#374151] text-white placeholder-gray-400 border border-gray-600"
                : "bg-white text-black border border-gray-300"
            }
          `}
            />

            <button
              onClick={saveCheckIn}
              className="
          bg-[#2D6658]
          hover:bg-[#245246]
            transition
            text-white
            px-6
            py-3
            rounded-xl
            text-base
          "
            >
              {t("checkin.save")}
            </button>
          </div>
        </div>
        <div className="xl:col-span-1 self-start">
          <MoodCalendar moods={recentCheckins} darkMode={darkMode} />
        </div>
      </div>

      {/* RECENT HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-3xl font-semibold">{t("checkin.recent")}</h2>

        {recentCheckins.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="
              bg-[#2D6658]
              hover:bg-[#245246]
              transition
              text-white
              px-4
              py-2
              rounded-xl
              text-sm
            "
          >
            {showAll ? t("common.showLess") : t("common.seeMore")}
          </button>
        )}
      </div>

      {/* RECENT ENTRIES */}
      <div className="flex flex-col gap-4">
        {displayedEntries.map((item, index) => (
          <div
            key={index}
            className={`
              rounded-2xl
              p-5
              ${darkMode ? "bg-[#1f2937]" : "bg-[#F8FCFA]"}
            `}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-5xl">{item.mood}</span>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {new Date(item.created_at).toLocaleString()}
                </span>

                <button
                  onClick={() => deleteMood(item.id)}
                  className="
                  bg-red-400
                  hover:bg-red-600
                  text-white
                  px-3
                  py-1
                  rounded-lg
                  text-xl
                "
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>

            <p
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CheckIn;
