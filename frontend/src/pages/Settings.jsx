import { useState } from "react";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function Settings({ darkMode, setDarkMode }) {
  /* LOGGED USER */
  const user = JSON.parse(localStorage.getItem("user"));

  const { language, changeLanguage, t, translate } = useLanguage();
  /* TEMP THEME */
  const [tempDarkMode, setTempDarkMode] = useState(darkMode);

  const [tempLanguage, setTempLanguage] = useState(language);

  const [message, setMessage] = useState("");

  const [showChatPopup, setShowChatPopup] = useState(false);

  const [showDataPopup, setShowDataPopup] = useState(false);

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  /* SHOW MESSAGE */
  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  /* SAVE SETTINGS */
  const saveSettings = () => {
    setDarkMode(tempDarkMode);

    localStorage.setItem("theme", tempDarkMode ? "dark" : "light");

    changeLanguage(tempLanguage);

    showMessage(translate("settings.saved", tempLanguage));
  };

  /* CLEAR DATA */
  const clearAllData = async () => {
    try {
      await API.delete(`/clear-data/${user.id}`);

      showMessage(t("settings.dataCleared"));
    } catch (error) {
      console.log(error);

      showMessage(t("settings.dataClearFailed"));
    }
  };
  /*CLEAR CHAT HISTORY*/
  const clearChatHistory = async () => {
    try {
      await API.delete(`/clear-chat-history/${user.id}`);

      showMessage(t("settings.chatCleared"));
    } catch (error) {
      console.log(error);

      showMessage(t("settings.chatClearFailed"));
    }
  };
  /* LOGOUT */
  const logoutUser = () => {
    localStorage.removeItem("user");

    window.location.href = "/login"; //CHANGE THE PAGE-REDIRECTING TO LOGIN
  };

  return (
    <>
      {showChatPopup && (
        <div
          className="
          fixed inset-0
          bg-black/50
          flex items-center justify-center
          z-50
        "
        >
          <div
            className={`
            w-[92%]
            max-w-[420px]
            rounded-3xl
            p-5 sm:p-8
            mx-4
            ${darkMode ? "bg-[#1f2937] text-white" : "bg-white text-black"}
          `}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {t("settings.clearChatHistory")}
            </h2>

            <p className="mb-6 text-sm sm:text-base">
              {t("settings.chatPopup")}
            </p>

            <div
              className="
              flex
              flex-col
              sm:flex-row
              justify-end
              gap-3
            "
            >
              <button
                onClick={() => setShowChatPopup(false)}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  bg-gray-300 text-black
                "
              >
                {t("settings.cancel")}
              </button>

              <button
                onClick={async () => {
                  setShowChatPopup(false);

                  await clearChatHistory();
                }}
                className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                  bg-red-500 text-white
                "
              >
                {t("settings.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDataPopup && (
        <div
          className="
          fixed inset-0
          bg-black/50
          flex items-center justify-center
          z-50
        "
        >
          <div
            className={`
            w-[90%]
            max-w-[400px]
            rounded-3xl
            p-5 sm:p-6
            ${darkMode ? "bg-[#1f2937] text-white" : "bg-white text-black"}
          `}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              {t("settings.clearAllData")}
            </h2>

            <p className="mb-6 text-sm sm:text-base">
              {t("settings.dataPopup")}
            </p>

            <div
              className="
              flex
              flex-col
              sm:flex-row
              justify-end
              gap-3
            "
            >
              <button
                onClick={() => setShowDataPopup(false)}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  bg-gray-300 text-black
                "
              >
                {t("settings.cancel")}
              </button>

              <button
                onClick={async () => {
                  setShowDataPopup(false);

                  await clearAllData();
                }}
                className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                  bg-red-500 text-white
                "
              >
                {t("settings.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
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
        <h1 className="text-4xl font-bold mb-2">{t("settings.title")}</h1>

        <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          {t("settings.subtitle")}
        </p>

        {/* MESSAGE */}
        {message && (
          <div
            className="
              bg-[#DCEFE9]
              text-[#2D6658]
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

        {/* PROFILE */}
        <div
          className={`
          rounded-2xl
          p-6
          mb-6
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
        >
          <h2 className="text-xl font-semibold mb-5">
            {t("settings.profile")}
          </h2>

          <div className="flex flex-col gap-5">
            {/* NAME */}
            <div>
              <p
                className={`text-sm mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {t("settings.name")}
              </p>

              <div
                className={`
                rounded-xl
                px-4
                py-3
                ${
                  darkMode
                    ? "bg-[#374151]"
                    : "bg-gray-50 border border-gray-200"
                }
              `}
              >
                {user?.username}
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <p
                className={`text-sm mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {t("settings.email")}
              </p>

              <div
                className={`
                rounded-xl
                px-4
                py-3
                ${
                  darkMode
                    ? "bg-[#374151]"
                    : "bg-gray-50 border border-gray-200"
                }
              `}
              >
                {user?.email}
              </div>
            </div>
          </div>
        </div>

        {/* PREFERENCES */}
        <div
          className={`
          rounded-2xl
          p-6
          mb-6
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
        >
          <h2 className="text-xl font-semibold mb-5">
            {t("settings.preferences")}
          </h2>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t("settings.darkMode")}</h3>

              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {t("settings.darkModeDesc")}
              </p>
            </div>

            <button
              onClick={() => setTempDarkMode(!tempDarkMode)}
              className={`
              w-14
              h-7
              rounded-full
              transition
              relative
              ${tempDarkMode ? "bg-[#2D6658]" : "bg-gray-300"}
            `}
            >
              <div
                className={`
                absolute
                top-1
                w-5
                h-5
                bg-white
                rounded-full
                transition-all
                duration-300
                ${
                  tempDarkMode ? "left-8" : "left-1" //FOR TOGGLING
                }
              `}
              />
            </button>
          </div>
          <div
            className="
          mt-6
          flex
          flex-col
          sm:flex-row
          sm:justify-between
          sm:items-center
          gap-3
        "
          >
            <h3 className="font-medium">{t("settings.language")}</h3>

            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`
                w-full
                sm:w-[150px]
                px-4
                py-2
                rounded-xl
                border
                text-left
                ${
                  darkMode
                    ? "bg-[#374151] text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }
              `}
              >
                {tempLanguage === "en"
                  ? "English"
                  : tempLanguage === "hi"
                    ? "हिन्दी"
                    : "తెలుగు"}
              </button>

              {showLanguageMenu && (
                <div
                  className={`
                  absolute
                  top-full
                  mt-2
                  left-0
                  w-full
                  rounded-xl
                  overflow-hidden
                  shadow-lg
                  z-50
                  ${darkMode ? "bg-[#374151]" : "bg-white"}
                `}
                >
                  <button
                    onClick={() => {
                      setTempLanguage("en");
                      setShowLanguageMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#2D6658] hover:text-white"
                  >
                    English
                  </button>

                  <button
                    onClick={() => {
                      setTempLanguage("hi");
                      setShowLanguageMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#2D6658] hover:text-white"
                  >
                    हिन्दी
                  </button>

                  <button
                    onClick={() => {
                      setTempLanguage("te");
                      setShowLanguageMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-[#2D6658] hover:text-white"
                  >
                    తెలుగు
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DATA MANAGEMENT */}
        <div
          className={`
          rounded-2xl
          p-6
          mb-6
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
        >
          <h2 className="text-xl font-semibold mb-5">
            {t("settings.dataManagement")}
          </h2>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowChatPopup(true)}
              className={`
              px-5
              py-3
              rounded-xl
              text-left
              transition
              ${darkMode ? "bg-[#374151]" : "bg-gray-100"}
            `}
            >
              {t("settings.clearChatHistory")}
            </button>

            <button
              onClick={() => setShowDataPopup(true)}
              className="
              bg-red-100
              hover:bg-red-200
              transition
              text-red-600
              px-5
              py-3
              rounded-xl
              text-left
            "
            >
              {t("settings.clearAllData")}
            </button>
          </div>
        </div>

        {/* SUPPORT */}
        <div
          className={`
          rounded-2xl
          p-6
          mb-6
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
        >
          <h2 className="text-xl font-semibold mb-4">
            {t("settings.helpSupport")}
          </h2>

          <p className={`mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {t("settings.helpText")}
          </p>

          <div
            className={`
            rounded-xl
            px-4
            py-3
            font-medium
            ${darkMode ? "bg-[#374151]" : "bg-gray-100"}
          `}
          >
            📞 {t("settings.support")}: +91 8985048918 
          </div>
        </div>

        {/* TERMS */}
        <div
          className={`
          rounded-2xl
          p-6
          mb-8
          ${darkMode ? "bg-[#1f2937]" : "bg-white"}
        `}
        >
          <h2 className="text-xl font-semibold mb-5">
            {t("settings.termsPrivacy")}
          </h2>

          <div className="flex flex-col gap-4">
            {/* PRIVACY */}
            <div
              className={`
              rounded-xl
              p-4
              ${darkMode ? "bg-[#374151]" : "bg-gray-100"}
            `}
            >
              <h3 className="font-semibold mb-2">
                {t("settings.privacyPolicy")}
              </h3>

              <p className="text-sm leading-6">{t("settings.privacyText")}</p>
            </div>

            {/* TERMS */}
            <div
              className={`
              rounded-xl
              p-4
              ${darkMode ? "bg-[#374151]" : "bg-gray-100"}
            `}
            >
              <h3 className="font-semibold mb-2">
                {t("settings.termsConditions")}
              </h3>

              <p className="text-sm leading-6">{t("settings.termsText")}</p>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 flex-wrap">
          {/* SAVE */}
          <button
            onClick={saveSettings}
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
            {t("settings.saveSettings")}
          </button>

          {/* LOGOUT */}
          <button
            onClick={logoutUser}
            className="
            bg-red-500
            hover:bg-red-600
            transition
            text-white
            px-6
            py-3
            rounded-xl
            text-base
          "
          >
            {t("settings.logout")}
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;
