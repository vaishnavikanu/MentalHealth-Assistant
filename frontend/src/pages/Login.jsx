import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function Login({ darkMode }) {
  const { language, changeLanguage, t } = useLanguage();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState("patient");

  const [message, setMessage] = useState("");

  const [showLanguages, setShowLanguages] = useState(false);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };
  const loginUser = async () => {
    if (!email || !password) {
      showMessage(t("login.fillFields"));

      return;
    }

    try {
      const response = await API.post("/login", {
        email,
        password,
        role,
      });

      if (response.data.message === "User not found") {
        showMessage(t("login.userNotFound"));

        return;
      }

      if (response.data.message === "Incorrect password") {
        showMessage(t("login.incorrectPassword"));
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data.user));

      showMessage(t("login.loginSuccess"));

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.log(error);

      showMessage(t("login.loginFailed"));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    loginUser();
  };

  const handleArrowNavigation = (e, nextRef, prevRef) => {
    if (e.key === "ArrowDown" && nextRef) {
      e.preventDefault();

      nextRef.current.focus();
    }

    if (e.key === "ArrowUp" && prevRef) {
      e.preventDefault();

      prevRef.current.focus();
    }
  };

  return (
    <div
      className={`
    min-h-screen
    overflow-y-auto
    flex
    items-center
    justify-center
    px-6
    py-6
    transition-all
    duration-300
    ${darkMode ? "bg-[#111827]" : "bg-[#f5f5f7]"}
  `}
    >
      {/* to group related elements together and apply styles to them as a whole we use form. */}
      <form
        onSubmit={handleSubmit}
        className={`
          w-full
          max-w-md
          rounded-3xl
          p-5
          shadow-lg
          transition-all
          duration-300
          ${darkMode ? "bg-[#1f2937] text-white" : "bg-white text-black"}
        `}
      >
        <h1
          className={`
            text-center
            text-5xl
            font-extrabold
            mb-6
            tracking-tight
            ${
              darkMode
                ? "text-[#7FD3BE]"
                : "text-[#2D6658]"
            }
          `}
        >
          MindBridge
        </h1>
        <div className="mb-5 relative">
          <button
            type="button"
            onClick={() => setShowLanguages(!showLanguages)}
            className={`
      w-full
      px-4
      py-3
      rounded-xl
      border
      flex
      justify-between
      items-center
      ${
        darkMode
          ? "bg-[#374151] text-white border-gray-600"
          : "bg-white text-black border-gray-300"
      }
    `}
          >
            <span>
              {language === "en"
                ? "English"
                : language === "hi"
                  ? "हिन्दी"
                  : "తెలుగు"}
            </span>

            <span>▼</span>
          </button>

          {showLanguages && (
            <div
              className={`
        absolute
        top-full
        left-0
        mt-2
        w-full
        rounded-xl
        overflow-hidden
        shadow-xl
        z-50
        ${darkMode ? "bg-[#374151]" : "bg-white"}
      `}
            >
              <button
                type="button"
                onClick={() => {
                  changeLanguage("en");

                  setShowLanguages(false);
                }}
                className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-[#2D6658] hover:text-white
        "
              >
                English
              </button>

              <button
                type="button"
                onClick={() => {
                  changeLanguage("hi");

                  setShowLanguages(false);
                }}
                className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-[#2D6658] hover:text-white
        "
              >
                हिन्दी
              </button>

              <button
                type="button"
                onClick={() => {
                  changeLanguage("te");

                  setShowLanguages(false);
                }}
                className="
          w-full
          text-left
          px-4
          py-3
          hover:bg-[#2D6658] hover:text-white
        "
              >
                తెలుగు
              </button>
            </div>
          )}
        </div>
        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-2">{t("login.title")}</h1>

        <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          {t("login.subtitle")}
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
              mb-5
              text-sm
              font-medium
            "
          >
            {message}
          </div>
        )}

        {/* EMAIL */}
        <input
          ref={emailRef}
          type="email"
          placeholder={t("login.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => handleArrowNavigation(e, passwordRef, null)}
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-4
            transition-all
            ${
              darkMode
                ? "bg-[#374151] text-white placeholder-gray-400"
                : "bg-gray-100 text-black"
            }
          `}
        />

        {/* PASSWORD */}
        <input
          ref={passwordRef}
          type="password"
          placeholder={t("login.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => handleArrowNavigation(e, null, emailRef)}
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-6
            transition-all
            ${
              darkMode
                ? "bg-[#374151] text-white placeholder-gray-400"
                : "bg-gray-100 text-black"
            }
          `}
        />

        <div className="mb-6">
          <p className="mb-3 font-medium">{t("login.loginAs")}</p>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="patient"
                checked={role === "patient"}
                onChange={(e) => setRole(e.target.value)}
              />

              {t("login.patient")}
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="doctor"
                checked={role === "doctor"}
                onChange={(e) => setRole(e.target.value)}
              />

              {t("login.doctor")}
            </label>
          </div>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="
            w-full
            bg-[#2D6658]
            hover:bg-[#245247]
            transition
            text-white
            py-3
            rounded-xl
            font-medium
            mb-5
          "
        >
          {t("login.login")}
        </button>

        {/* SIGNUP LINK */}
        <p
          className={`text-sm text-center ${
            darkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {t("login.noAccount")}{" "}
          <Link
            to="/signup"
            className="
              text-[#2D6658]
              font-medium
              hover:underline
            "
          >
            {t("login.signupLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
