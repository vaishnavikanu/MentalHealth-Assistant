import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Patients from "./pages/Patients";
import { useState, useEffect } from "react";
import { useRef } from "react";
import Sidebar from "./components/Sidebar";
import DoctorChatView from "./pages/DoctorChatView";
import Chat from "./pages/Chat";
import CheckIn from "./pages/CheckIn";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import History from "./pages/History";
import SelfCare from "./pages/SelfCare";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import PatientHistory from "./pages/PatientHistory";
import ScrollToTop from "./components/ScrollToTop";
import DoctorSuggestions from "./pages/DoctorSuggestions";

function App() {
  
  /* USER */
  const [user, setUser] =
    useState(
      JSON.parse(
        localStorage.getItem("user")
      )
    );

    const contentRef = useRef(null);
    const role = user?.role;
  /* NEW CHAT */
  const [newChat, setNewChat] =
    useState(0);

  /* SIDEBAR OPEN CLOSE OPERATION*/
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [sidebarWidth, setSidebarWidth] =
    useState(290);

  const [isMobile, setIsMobile] =
  useState(window.innerWidth < 768);  

  /* DARK MODE TOGGLE*/
  const [darkMode, setDarkMode] =
    useState(
      localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {

  const handleResize = () => {

    setIsMobile(
      window.innerWidth < 768
    );

  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );

}, []);
  /* APPLY THEME */
  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add("dark");

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.documentElement.classList.remove("dark");

      localStorage.setItem(
        "theme",
        "light"
      );

    }

  }, [darkMode]);


  useEffect(() => {

  const handleResize = () => {

    if (window.innerWidth < 900) {

      setSidebarWidth(220);

    }

    else {

      setSidebarWidth(290);

    }

  };

  handleResize();

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );

}, []);

  /* NEW CHAT */
  const startNewChat = () => {

    setNewChat(prev => prev + 1);

  };

  /* SIDEBAR SIZE ADJUSTING*/
  const startResizing = (e) => {
    document.body.style.userSelect = "none";

    const startX = e.clientX;

    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent) => {

      const newWidth =
        startWidth +
        (moveEvent.clientX - startX);

      if (
        newWidth >= 200 &&
        newWidth <= 450
      ) {

        setSidebarWidth(newWidth);

      }

    };

    const onMouseUp = () => {

      document.body.style.userSelect = "auto";

      document.removeEventListener(
        "mousemove",
        onMouseMove
      );

      document.removeEventListener(
        "mouseup",
        onMouseUp
      );

    };

    document.addEventListener(
      "mousemove",
      onMouseMove
    );

    document.addEventListener(
      "mouseup",
      onMouseUp
    );

  };

  return (

    <BrowserRouter>

       <ScrollToTop />
      {/* LOGIN/SIGNUP SCREEN */}
      {!user ? (

        <Routes>

          <Route
            path="/login"
            element={
              <Login
                darkMode={darkMode}
              />
            }
          />

          <Route
            path="/signup"
            element={
              <Signup
                darkMode={darkMode}
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate to="/login" />
            }
          />

        </Routes>

      ) : (
        /*RUNS IF USER EXIST*/
        /* MAIN APP */
        <div
          className={`
            h-screen
            flex
            overflow-hidden
            transition-colors
            duration-300
            ${
              darkMode
                ? "bg-[#0f172a]"
                : "bg-[#f7f5fc]"
            }
          `}
        >

          {/* SIDEBAR */}
          <div
            style={{
  width:
    sidebarOpen
      ? (
          isMobile
            ? "100%"
            : `${sidebarWidth}px`
        )
      : "0px"
}}
            className={`
              transition-all
              duration-300
              overflow-y-auto
              overflow-x-hidden
              shrink-0
              relative

              border-r
              ${
                darkMode
                  ? "border-gray-700 bg-[#1e293b]"
                  : "border-gray-200 bg-white"
              }

              h-screen
            `}
          >

            <Sidebar
  startNewChat={startNewChat}
  darkMode={darkMode}
  setSidebarOpen={setSidebarOpen}
/>

            {/* RESIZE HANDLE */}
            {sidebarOpen && (

              <div
                onMouseDown={startResizing}
                className={`
                  absolute
                  top-0
                  right-0
                  w-1
                  h-full
                  cursor-col-resize
                  transition
                  ${
                    darkMode
                    ? "hover:bg-[#2D6658]"
                    : "hover:bg-[#5FAE9D]"
                  }
                  bg-transparent
                `}
              />

            )}

          </div>

          {/* MAIN */}
          <div
            className="
              flex-1
              flex
              flex-col
              h-screen
              overflow-hidden
            "
          >

            {/* TOPBAR */}
            <div
              className={`
                h-[50px]
                shrink-0

                border-b
                ${
                  darkMode
                    ? "border-gray-700 bg-[#1e293b]"
                    : "border-gray-200 bg-white"
                }

                flex
                items-center

                px-6

                transition-colors
                duration-300
              `}
            >

              <button
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
                className={`
                  text-3xl
                  transition
                  ${
                    darkMode
                    ? "text-white hover:text-[#7AB8A8]"
                    : "text-black hover:text-[#2D6658]"
                  }
                `}
              >
                ☰ 
              </button>

            </div>

            {/* PAGE CONTENT */}
            <div
            id="main-content"
            ref={contentRef}
              className={`
                flex-1
                overflow-y-auto
                transition-colors
                duration-300
                ${
                  darkMode
                    ? "bg-[#0f172a]"
                    : "bg-[#f7f5fc]"
                }
              `}
            >

              <Routes>

                {/* CHAT */}
                <Route
                  path="/"
                  element={
                    <Chat
                      newChat={newChat}
                      darkMode={darkMode}
                    />
                  }
                />

                {/* CHECKIN */}
                <Route
                  path="/checkin"
                  element={
                    role === "patient"
                      ? (
                          <CheckIn
                            darkMode={darkMode}
                          />
                        )
                      : (
                          <Navigate to="/" />
                        )
                  }
                />

                {/* MOOD TRACKER */}
                <Route
                  path="/moodtracker"
                  element={
                    <MoodTracker
                      darkMode={darkMode}
                    />
                  }
                />

                {/* JOURNAL */}
                <Route
                  path="/journal"
                  element={
                    role === "patient"
                      ? (
                          <Journal
                            darkMode={darkMode}
                          />
                        )
                      : (
                          <Navigate to="/" />
                        )
                  }
                />

                <Route
                  path="/doctor-suggestions"
                  element={
                    role === "patient"
                      ? (
                          <DoctorSuggestions
                            darkMode={darkMode}
                          />
                        )
                      : (
                          <Navigate to="/" />
                        )
                  }
                />

                {/* HISTORY */}
                <Route
                  path="/history"
                  element={
                    <History
                      darkMode={darkMode}
                    />
                  }
                />

                <Route
                  path="/patients"
                  element={
                    role === "doctor"
                      ? (
                          <Patients  
                            darkMode={darkMode}
                          />
                        )
                      : (
                          <Navigate to="/" />
                        )
                  }
                />

                {/* SELF CARE */}
                <Route
                  path="/selfcare"
                  element={
                    role === "patient"
                  ? (
                      <SelfCare
                        darkMode={darkMode}
                      />
                    )
                  : (
                      <Navigate to="/" />
                    )
                  }
                />

                {/* SETTINGS */}
                <Route
                  path="/settings"
                  element={
                    <Settings
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                    />
                  }
                />

                {/* PATIENT HISTORY */}
                <Route
                  path="/patient-history"
                  element={
                    <PatientHistory
                      darkMode={darkMode}
                    />
                  }
                />
                {/*DOCTOR VIEW OF CHAT*/}
                <Route
                  path="/doctor-chat-view"
                  element={
                    <DoctorChatView
                      darkMode={darkMode}
                    />
                  }
                />

                {/* INVALID ROUTE */}
                <Route
                  path="*"
                  element={
                    <Navigate to="/" />
                  }
                />

              </Routes>

            </div>

          </div>

        </div>

      )}

    </BrowserRouter>

  );
}

export default App;
