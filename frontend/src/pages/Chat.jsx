import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import { FaPaperclip } from "react-icons/fa";
import { useLanguage } from "../context/LanguageContext";
function Chat({ newChat, darkMode }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const defaultMessages = [];

  const [messages, setMessages] = useState(defaultMessages);

  const [input, setInput] = useState("");

  const [isWaitingForReply, setIsWaitingForReply] = useState(false); // to not let send while waiting for bot reply

  const [typingText, setTypingText] = useState(""); //to show thinking message for bot

  const patientSuggestions = [
    t("chat.suggestion1"),

    t("chat.suggestion2"),

    t("chat.suggestion3"),
  ];

  const [attachments, setAttachments] = useState([]);

  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const [streak, setStreak] = useState(0);

  const fileInputRef = useRef(null);

  const cameraInputRef = useRef(null);

  const textareaRef = useRef(null);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  /* CHAT SESSION CURRENT OPEN*/
  const [sessionId, setSessionId] = useState(null);

  const queryParams = new URLSearchParams(location.search);

  const urlSessionId = queryParams.get("session");

  const messagesEndRef = useRef(null);

  const chatContainerRef = useRef(null);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!urlSessionId) {
      setMessages(defaultMessages);

      setSessionId(null);

      setTimeout(() => {
        textareaRef.current?.focus(); //focus on textarea after new chat
      }, 100);
    }
  }, [newChat, urlSessionId]);

  /* AUTOMATIC SCROLLING*/
  useEffect(() => {
    if (isInitialLoad.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });

      isInitialLoad.current = false;
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchStreak();
  }, []);

  //TO LOAD OLD CHAT MESSAGES
  useEffect(() => {
    if (urlSessionId) {
      loadMessages(urlSessionId);
    } else {
      setMessages(defaultMessages);
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [urlSessionId]);

  const loadMessages = async (session_id) => {
    try {
      const response = await API.get(`/messages/${session_id}`);

      const formattedMessages = response.data.map((msg) => ({
        sender: msg.sender,
        text: msg.message,
        attachments: msg.attachments || [],
      }));

      isInitialLoad.current = true;
      setMessages(formattedMessages);

      setSessionId(session_id);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await API.get(`/streak/${user.id}`);

      setStreak(response.data.streak);
    } catch (error) {
      console.log(error);
    }
  };
  const sendMessage = async () => {
    if (isWaitingForReply) {
      return;
    }
    if (input.trim() === "" && attachments.length === 0) {
      return;
    }
    //nothing is typed so NO SEND

    const currentAttachments = [...attachments];

    const currentInput = input;
    const userMessage = {
      sender: "user",
      text: input,
      attachments: currentAttachments,
    };

    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setAttachments([]);
    setIsWaitingForReply(true);
    setTypingText(t("chat.thinking"));
    textareaRef.current?.focus();

    try {
      /* CREATE NEW SESSION */
      let currentSessionId = sessionId;

      /* CREATE NEW SESSION */
      if (!currentSessionId) {
        let chatTitle = currentInput;

        if (currentInput.trim() === "" && currentAttachments.length > 0) {
          chatTitle = currentAttachments[0].filename;
        }

        const sessionResponse = await API.post("/chat-session", {
          user_id: user.id,
          title: chatTitle,
        });

        currentSessionId = sessionResponse.data.session_id;

        setSessionId(currentSessionId);
      }

      /* SAVE USER MESSAGE IN DB */
      const messageResponse = await API.post("/message", {
        session_id: currentSessionId,
        sender: "user",
        message: currentInput,
      });

      const messageId = messageResponse.data.id;

      for (const file of currentAttachments) {
        await API.put(`/attachment/${file.id}`, {
          message_id: messageId,
        });
      }
      
     /* BOT RESPONSE FROM RAG */

      const botText = messageResponse.data.bot_reply || "";

      setTypingText("");

      let currentText = "";

      let index = 0;

      const typingInterval = setInterval(() => {

        currentText += botText.slice(index, index + 3);

        setTypingText(currentText);

        requestAnimationFrame(() => {

          if (chatContainerRef.current) {

            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;

          }

        });

        index += 3;

        if (index >= botText.length) {

          clearInterval(typingInterval);

          (async () => {

            setTypingText("");

            await loadMessages(currentSessionId);

            if (!sessionId) {
                navigate(`/?session=${currentSessionId}`, {
                    replace: true,
                });
            }

            setIsWaitingForReply(false);

            textareaRef.current?.focus();

        })();

        }

      }, 20);
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await API.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setAttachments((prev) => [...prev, response.data]);
      } catch (error) {
        console.log(error);
      }
    }
    textareaRef.current?.focus();
    e.target.value = "";
  };

  const removeAttachment = async (id) => {
    try {
      await API.delete(`/attachment/${id}`);

      setAttachments((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        ref={cameraInputRef}
        onChange={handleFileUpload}
      />
      <div
        className={`
        h-full
        flex
        flex-col
        transition-colors
        duration-300
        ${darkMode ? "bg-[#0f172a]" : "bg-[#f7f5fc]"}
      `}
      >
        {/* CHAT MESSAGES */}
        <div
          ref={chatContainerRef}
          className={`
          flex-1
          overflow-y-auto
          px-10
          py-8
          transition-colors
          duration-300
          ${darkMode ? "bg-[#0f172a]" : "bg-[#f7f5fc]"}
        `}
        >
          <div className="flex flex-col gap-5 ">
            {messages.length === 0 && !urlSessionId && (
              <div
                className="
              flex
              flex-col
              items-center
              justify-center
              text-center
              min-h-[50vh] 
              md:min-h-[55vh]
            "
              >
                <h1
                  className={`
                text-5xl
                font-bold
                mb-4
                ${darkMode ? "text-white" : "text-gray-900"}
              `}
                >
                  {user.role === "doctor"
                    ? `${t("chat.doctorWelcomeTitle")} ${user.username} 👋`
                    : `${t("chat.welcomeTitle")}, ${user.username} 👋`}
                </h1>

                {user.role === "doctor" ? (
                  <p
                    className={`
                  text-xl
                  max-w-2xl
                  ${darkMode ? "text-gray-300" : "text-gray-600"}
                `}
                  >
                    {t("chat.doctorWelcomeSubtitle")}
                  </p>
                ) : (
                  <>
                    <p
                      className={`
                    text-xl
                    mb-8
                    max-w-2xl
                    ${darkMode ? "text-gray-300" : "text-gray-600"}
                  `}
                    >
                      {t("chat.welcomeSubtitle")}
                    </p>

                    <div className="mt-8 text-center">
                      <p
                        className={`
                      text-2xl
                      font-medium
                      mb-2
                      ${darkMode ? "text-gray-300" : "text-gray-700"}
                    `}
                      >
                        {t("chat.wellnessStreak")}
                      </p>

                      <h2 className="text-6xl font-bold text-[#2D6658] mb-2">
                        {streak} {t("chat.days")}
                      </h2>

                      <p
                        className={`
                      text-xl
                      ${darkMode ? "text-gray-400" : "text-gray-500"}
                    `}
                      >
                        {t("chat.keepGoing")}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`
                max-w-[70%]
                px-6
                py-4
                rounded-3xl
                text-[18px]
                leading-relaxed
                whitespace-pre-wrap
                break-words
                shadow-sm
                transition-all
                duration-300
                ${
                  msg.sender === "user"
                    ? `
                      self-end
                      bg-gradient-to-r
                     from-[#2D6658]
                     to-[#3A7A68]
                      text-white
                      shadow-lg
                    `
                    : `
                      ${
                        darkMode
                          ? "bg-[#1e293b] text-gray-100 shadow-md"
                          : "bg-[#e9e9ee] text-black"
                      }
                    `
                }
              `}
              >
                {msg.text}

                {msg.attachments?.map((file) => (
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
                    hover:opacity-80
                  "
                  >
                    📎 {file.filename}
                  </a>
                ))}
              </div>
            ))}

            {typingText && (
              <div
                className={`
              max-w-[70%]
              px-6
              py-4
              rounded-3xl
              text-[18px]
              leading-relaxed
              whitespace-pre-wrap
              break-words
              shadow-sm
              ${
                darkMode
                  ? "bg-[#1e293b] text-gray-100"
                  : "bg-[#e9e9ee] text-black"
              }
            `}
              >
                {typingText}

                <span className="animate-pulse">|</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* FIXED INPUT AREA */}
        <div
          className={`
          px-10
          py-5
         
          shrink-0
          transition-colors
          duration-300
          ${
            darkMode
              ? "border-gray-700 bg-[#0f172a]"
              : "border-gray-200 bg-[#f7f5fc]"
          }
        `}
        >
          {user.role === "patient" &&
            messages.length === 0 &&
            !urlSessionId && (
              <div className="  flex  gap-3  mb-4  overflow-x-auto  hide-scrollbar md:ml-[92px]">
                {patientSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className={`
                    shrink-0
                    px-4
                    py-2.5
                    rounded-full
                    text-sm
                    font-medium
                    whitespace-nowrap
                    transition-all
                    ${
                      darkMode
                        ? `
                          bg-[#1e293b]
                          text-white
                          hover:bg-[#2D6658]
                        `
                        : `
                          bg-[#DCEFE9]
                          text-[#2D6658]
                          hover:bg-[#C6E6DD]
                        `
                    }
                  `}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className={`
          flex
          items-center
          gap-2
          px-3
          py-2
          rounded-xl
          text-sm
          ${darkMode ? "bg-[#1e293b] text-white" : "bg-white"}
        `}
                >
                  <span>📎 {file.filename}</span>

                  <button
                    onClick={() => removeAttachment(file.id)}
                    className="
            ml-1
            font-bold
            hover:text-red-500
            transition
          "
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-4 relative">
            <button
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`
              p-5
              rounded-2xl
              text-white
              bg-gradient-to-r
              from-[#2D6658]
              to-[#3A7A68]
              hover:from-[#245246]
              hover:to-[#2D6658]
              shrink-0
            `}
            >
              <FaPaperclip fontSize={18} />
            </button>

            {showAttachmentMenu && (
              <div
                className={`
                absolute
                bottom-20
                left-0
                w-52
                rounded-2xl
                shadow-xl
                overflow-hidden
                z-50
                ${
                  darkMode
                    ? "bg-[#1e293b] border border-gray-700"
                    : "bg-white border border-gray-200"
                }
              `}
              >
                <button
                  onClick={() => {
                    fileInputRef.current.click();

                    setShowAttachmentMenu(false);
                  }}
                  className={`
                  w-full
                  text-left
                  px-4
                  py-3
                 ${
                   darkMode
                     ? "text-white hover:bg-[#334155]"
                     : "text-black hover:bg-[#DCEFE9]"
                 }
                `}
                >
                  {t("chat.upload")}
                </button>

                {isMobile && (
                  <button
                    onClick={() => {
                      cameraInputRef.current.click();

                      setShowAttachmentMenu(false);
                    }}
                    className={`
      w-full
      text-left
      px-4
      py-3
      ${
        darkMode
          ? "text-white hover:bg-[#334155]"
          : "text-black hover:bg-[#DCEFE9]"
      }
    `}
                  >
                    {t("chat.takePhoto")}
                  </button>
                )}
              </div>
            )}

            <textarea
              ref={textareaRef}
              autoFocus
              placeholder={t("chat.typeMessage")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className={`
              flex-1
              rounded-2xl
              border
              px-5
              py-4
              text-[17px]
              outline-none
              resize-none
              transition-all
              duration-300
              ${
                darkMode
                  ? `
                    border-gray-600
                    bg-[#1e293b]
                    text-white
                    placeholder-gray-500
                    focus:border-[#2D6658]
                    focus:ring-[#2D6658]/30
                    focus:ring-2

                  `
                  : `
                    border-gray-300
                    bg-white
                    text-black
                    placeholder-gray-600
                    focus:border-[#2D6658]
                    focus:ring-[#DCEFE9]
                    focus:ring-2

                  `
              }
            `}
            />

            <button
              disabled={isWaitingForReply}
              onClick={sendMessage}
              className={`
              px-8
              py-4
              rounded-2xl
              text-white
              text-[17px]
              font-medium
              bg-gradient-to-r
              from-[#2D6658]
              to-[#3A7A68]
              transition-all
              duration-300
              shrink-0
               ${
                 isWaitingForReply
                   ? "opacity-50 cursor-not-allowed"
                   : darkMode
                     ? "hover:opacity-80 shadow-lg shadow-[#2D6658]/30"
                     : "hover:opacity-90 shadow-md"
               }
              ${
                darkMode
                  ? "hover:opacity-80 shadow-lg shadow-[#2D6658]/30"
                  : "hover:opacity-90 shadow-md"
              }
            `}
            >
              {isWaitingForReply ? t("chat.thinking") : t("chat.send")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
