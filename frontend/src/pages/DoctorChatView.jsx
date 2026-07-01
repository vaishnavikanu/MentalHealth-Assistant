import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";
function DoctorChatView({ darkMode }) {
  const location = useLocation();

  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);

  const queryParams = new URLSearchParams(location.search);

  const sessionId = queryParams.get("session");

  useEffect(() => {
    const container = document.getElementById("main-content");

    if (container) {
      container.scrollTo({
        top: 0,
      });
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [sessionId]);

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/messages/${sessionId}`);

      setMessages(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`
        min-h-full
        p-8
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f5f5f7] text-black"}
      `}
    >
      <h1 className="text-5xl font-bold mb-8">{t("doctorChat.title")}</h1>
      <p className={`mb-8 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
        {t("doctorChat.subtitle")}
      </p>

      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`
    p-3
    rounded-2xl
    max-w-[75%]
    text-xl
    leading-relaxed
    ${
      message.sender === "user"
        ? "ml-auto bg-[#2D6658] text-white"
        : darkMode
          ? "bg-[#1f2937]"
          : "bg-white"
    }
  `}
          >
            {message.message}

            {message.attachments?.map((file) => (
              <a
                key={file.id}
                href={`http://localhost:8000/${file.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
        block
        mt-2
        text-sm
        underline
      "
              >
                📎 {file.filename}
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorChatView;
