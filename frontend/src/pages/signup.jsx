import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function Signup({ darkMode }) {
  const { language, changeLanguage, t } = useLanguage();
  const usernameRef = useRef(null); //REFERS USERNAME INPUT BOX
  const emailRef = useRef(null); //EMAIL BOX
  const passwordRef = useRef(null); //PASSWORD BOX
  const confirmPasswordRef = useRef(null);

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };
  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const role = "patient";

  const [message, setMessage] = useState("");

  const [showLanguages, setShowLanguages] = useState(false);

  const signupUser = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showMessage(t("signup.fillFields"));

      return;
    }

    if (password !== confirmPassword) {
      showMessage(t("signup.passwordMismatch"));

      return;
    }

    try {
      const response = await API.post("/signup", {
        username,
        email,
        password,
        role,
        language,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(
          // STORES USER INFO IN LOCAL STORAGE IN STRING FORMAT
          response.data.user,
        ),
      );

      showMessage(t("signup.signupSuccess"));

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.log(error);

      showMessage(t("signup.signupFailed"));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); //PREVENTS PAGE REFRESH ON FORM SUBMISSION BECAUSE OF DEFAULT BEHAVIOR

    signupUser();
  };

  const handleArrowNavigation = (e, nextRef, prevRef) => {
    if (e.key === "ArrowDown" && nextRef) {
      e.preventDefault(); //PREVENTS SCROLLING THE PAGE WHEN USING ARROW KEYS

      nextRef.current.focus(); //FOCUSES THE NEXT INPUT FIELD
    }

    if (e.key === "ArrowUp" && prevRef) {
      e.preventDefault();

      prevRef.current.focus();
    }
  };

  return (
    <div //WE USE FLEX BECAUSE WE WANT TO CENTER THE FORM BOTH VERTICALLY AND HORIZONTALLY
      className={`
        min-h-screen
        flex
        items-center
        justify-center
        px-6
        py-6
        overflow-y-scroll
        ${darkMode ? "bg-[#111827]" : "bg-[#f5f5f7]"}
      `}
    >
      
      <form
        onSubmit={handleSubmit}
        
        className={`
          w-full
          max-w-md
          rounded-3xl
          p-4 sm:p-8
          shadow-lg
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {t("signup.title")}
        </h1>

        <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
          {t("signup.subtitle")}
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
            "
          >
            {message}
          </div>
        )}

        {/* USERNAME */}
        <input
          ref={usernameRef}
          type="text"
          placeholder={t("signup.username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => handleArrowNavigation(e, emailRef, null)}
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-4
            ${darkMode ? "bg-[#374151] text-white" : "bg-gray-100"}
          `}
        />

        {/* EMAIL */}
        <input
          ref={emailRef}
          type="email"
          placeholder={t("signup.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => handleArrowNavigation(e, passwordRef, usernameRef)}
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-4
            ${darkMode ? "bg-[#374151] text-white" : "bg-gray-100"}
          `}
        />

        {/* PASSWORD */}
        <input
          ref={passwordRef}
          type="password"
          placeholder={t("signup.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) =>
            handleArrowNavigation(e, confirmPasswordRef, emailRef)
          }
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-4
            ${darkMode ? "bg-[#374151] text-white" : "bg-gray-100"}
          `}
        />

        {/* CONFIRM PASSWORD */}
        <input
          ref={confirmPasswordRef}
          type="password"
          placeholder={t("signup.confirmPassword")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => handleArrowNavigation(e, null, passwordRef)}
          className={`
            w-full
            px-4
            py-3
            rounded-xl
            outline-none
            mb-6
            ${darkMode ? "bg-[#374151] text-white" : "bg-gray-100"}
          `}
        />

        {/* BUTTON */}
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
          {t("signup.signup")}{" "}
          {/* WHEN THIS BUTTON IS CLICKED THE FORM 
          SUBMISSION IS TRIGGERED AND THE SIGNUP FUNCTION IS CALLED */}
        </button>

        {/* LOGIN LINK */}
        <p
          className={`text-sm text-center ${
            darkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          {t("signup.haveAccount")}{" "}
          <Link
            to="/login"
            className="
              text-[#2D6658]
              font-medium
            "
          >
            {t("signup.loginLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
