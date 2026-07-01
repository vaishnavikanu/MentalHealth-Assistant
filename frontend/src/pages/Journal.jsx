import { useState, useEffect } from "react";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function Journal({ darkMode }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const { t } = useLanguage();
  const [journals, setJournals] = useState([]);

  const [title, setTitle] = useState("");

  const [content, setContent] = useState("");
  /*TO SHOW SUCCESS MSG*/
  const [message, setMessage] = useState("");

  const [showAll, setShowAll] = useState(false);

  const displayedJournals = showAll ? journals : journals.slice(0, 5);

  // FETCH JOURNALS
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await API.get(`/journals/${user.id}`); //GETS ALL THE JOURNALS RELATED TO USER_ID

      setJournals(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // ADD JOURNAL
  const addJournal = async () => {
    if (title.trim() === "" || content.trim() === "") {
      setMessage(t("journal.fillFields"));

      setTimeout(() => {
        setMessage("");
      }, 3000);

      return;
    }

    try {
      //STROING IN DB
      await API.post("/journal", {
        user_id: user.id,

        title: title,

        content: content,
      });
      // TO SEE THE UPDATED LIST
      fetchJournals();

      setTitle("");

      setContent("");

      setMessage(t("journal.addedSuccess"));

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setMessage(t("journal.saveFailed"));
    }
  };

  // DELETE JOURNAL
  const deleteJournal = async (journalId) => {
    try {
      await API.delete(`/journal/${journalId}`);

      fetchJournals();

      setMessage(t("journal.deletedSuccess"));

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.log(error);

      setMessage(t("journal.deleteFailed"));
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
      <h1 className="text-5xl font-bold mb-2">{t("journal.title")}</h1>

      <p
        className={`mb-8 text-lg ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {t("journal.subtitle")}
      </p>

      {/* MESSAGE */}
      {message && (
        <div
          className="
            bg-[#DCEFE9]
            text-[#245247]
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

      {/* ADD JOURNAL */}
      <div
        className={`
          rounded-2xl
          p-4
          shadow-sm
          mb-8
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
      >
        <h2 className="text-2xl font-semibold mb-5">{t("journal.newEntry")}</h2>

        {/* TITLE */}
        <input
          type="text"
          placeholder={t("journal.journalTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`
            w-full
            rounded-xl
            px-4
            py-3
            outline-none
            mb-4
            transition-all
            ${
              darkMode
                ? "bg-[#374151] text-white placeholder-gray-400 border border-gray-600"
                : "bg-white text-black border border-gray-300"
            }
          `}
        />

        {/* CONTENT */}
        <textarea
          placeholder={t("journal.writeThoughts")}
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`
            w-full
            rounded-xl
            p-4
            outline-none
            resize-none
            mb-4
            transition-all
            ${
              darkMode
                ? "bg-[#374151] text-white placeholder-gray-400 border border-gray-600"
                : "bg-white text-black border border-gray-300"
            }
          `}
        />

        {/* SAVE BUTTON */}
        <button
          onClick={addJournal}
          className="
            bg-[#2D6658]
            hover:bg-[#245247]
            transition
            text-white
            px-6
            py-3
            rounded-xl
            text-base
          "
        >
          {t("journal.saveJournal")}
        </button>
      </div>

      {/* JOURNAL HEADER */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-3xl font-bold">{t("journal.recentJournals")}</h2>

        {journals.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
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
            {showAll ? t("common.showLess") : t("common.seeMore")}
          </button>
        )}
      </div>

      {/* JOURNAL ENTRIES */}
      <div className="flex flex-col gap-3">
        {displayedJournals.map((journal) => (
          <div
            key={journal.id}
            className={`
              rounded-2xl
              p-4
              shadow-sm
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-xl">{journal.title}</h3>

              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}
              >
                {new Date(journal.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <p
                className={`text-sm leading-6.5 flex-1 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {journal.content}
              </p>

              <button
                onClick={() => deleteJournal(journal.id)}
                className="
                  ml-4
                  bg-red-400
                  hover:bg-red-600
                  transition
                  text-white
                  px-3
                  py-1
                  rounded-lg
                  text-xl
                  shrink-0
                "
              >
                {t("journal.delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Journal;
