import { useState, useEffect } from "react";
import API from "../api/api";
import MoodGraph from "../components/MoodGraph";
import { useLanguage } from "../context/LanguageContext";
function MoodTracker({ darkMode }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { t } = useLanguage();

  const [moodEntries, setMoodEntries] = useState([]);

  // FETCH MOODS
  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const response = await API.get(`/moods/${user.id}`);

      setMoodEntries(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const moodCount = {};

  moodEntries.forEach((entry) => {
    moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
  });

  const totalMoods = moodEntries.length;

  const moodScores = {
    "😍": 10,
    "😊": 8,
    "😴": 6,
    "😔": 4,
    "😨": 2,
    "😡": 1,
  };

  let totalScore = 0;

  moodEntries.forEach((entry) => {
    totalScore += moodScores[entry.mood] || 0;
  });

  const averageScore =
    totalMoods > 0 ? (totalScore / totalMoods).toFixed(1) : 0;

  let averageEmoji = "😐";

  let averageLabel = t("moodTracker.noData");

  if (averageScore >= 9) {
    averageEmoji = "😍";

    averageLabel = t("moodTracker.excellent");
  } else if (averageScore >= 7) {
    averageEmoji = "😊";

    averageLabel = t("moodTracker.good");
  } else if (averageScore >= 5) {
    averageEmoji = "😴";

    averageLabel = t("moodTracker.okay");
  } else if (averageScore >= 3) {
    averageEmoji = "😔";

    averageLabel = t("moodTracker.low");
  } else if (averageScore > 0) {
    averageEmoji = "😨";

    averageLabel = t("moodTracker.poor");
  }

  let moodInsight = t("moodTracker.noInsight");

  if (averageScore >= 9) {
    moodInsight = t("moodTracker.insightExcellent");
  } else if (averageScore >= 7) {
    moodInsight = t("moodTracker.insightGood");
  } else if (averageScore >= 5) {
    moodInsight = t("moodTracker.insightOkay");
  } else if (averageScore >= 3) {
    moodInsight = t("moodTracker.insightLow");
  } else if (averageScore > 0) {
    moodInsight = t("moodTracker.insightPoor");
  }

  return (
    //OVERALL CONTAINER
    <div
      className={`
        min-h-full
        px-3 md:px-6 lg:px-9
        py-6
        pb-20
        transition-all
        duration-300
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      {/* HEADING */}
      <div
        className="
          flex
          flex-wrap
          justify-between
          items-start
          gap-4
          mb-8
        "
      >
        <div>
          <h1 className=" text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            {t("moodTracker.title")}
          </h1>
          <p
            className={`text-lg ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {t("moodTracker.subtitle")}
          </p>
        </div>
      </div>
      {/*GRAPH SECTION*/}
      <div>
        <MoodGraph moods={moodEntries} darkMode={darkMode} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div
            className={`
          rounded-3xl
          p-4
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
          >
            <h2 className="text-2xl font-semibold mb-5">
              {t("moodTracker.distribution")}
            </h2>

            <div className="space-y-2">
              {Object.entries(moodCount).map(([mood, count]) => {
                const percent = Math.round((count / totalMoods) * 100);

                return (
                  <div key={mood} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{mood}</span>

                        <span className="font-medium">{count}</span>
                      </div>

                      <span className="font-semibold text-[#2D6658]">
                        {percent}%
                      </span>
                    </div>

                    <div
                      className={`
                w-full
                h-3
                rounded-full
                overflow-hidden
                ${darkMode ? "bg-[#374151]" : "bg-gray-200"}
              `}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                        }}
                        className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-[#2D6658]
                  to-[#58A58A]
                "
                      />
                    </div>
                  </div>
                );
              })}{" "}
              {/*END OF MOOD DISTRIBUTION */}
            </div>
          </div>
          <div
            className={`

          rounded-3xl
          p-6

          ${darkMode ? "bg-[#1f2937]" : "bg-white"}

          `}
          >
            <h2 className="text-2xl font-semibold mb-6">
              {t("moodTracker.averageMood")}
            </h2>

            <div className="flex flex-col h-full">
              <div className="text-center">
                <div className="text-7xl mb-4">{averageEmoji}</div>

                <h3 className="text-4xl font-bold text-[#2D6658]">
                  {averageLabel}
                </h3>

                <p
                  className={`mt-2 ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {averageScore} / 10
                </p>
              </div>

              <div
                className={`
            mt-8
            rounded-2xl
            p-5
            py-7
            border
            ${
              darkMode
                ? "bg-[#111827] border-[#374151]"
                : "bg-[#F7FAF9] border-[#D9E8E3]"
            }
          `}
              >
                <h4 className="font-semibold text-xl text-[#2D6658] mb-2">
                  {t("moodTracker.moodInsight")}
                </h4>

                <p
                  className={`leading-8 text-lg ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {moodInsight.split(". ").map((sentence, index) => (
                    <span key={index}>
                      {sentence}
                      {index !== moodInsight.split(". ").length - 1 && "."}

                      <br />
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MoodTracker;
