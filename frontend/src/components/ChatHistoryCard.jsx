import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function ChatHistoryCard({
  chat,
  darkMode,
  patientId,
  deleteChat,
  navigateTo
}) {

  const navigate = useNavigate();
  const { t } = useLanguage();

  return (

    // paste your removed card here
    <div       
        key={chat.id}
        onClick={() =>
            navigate(
            `${navigateTo}?session=${chat.id}`
            )
        }
        className={`
            rounded-2xl
            p-4
            cursor-pointer
            transition
            shadow-sm
            ${
            darkMode
                ? "bg-[#1f2937] hover:bg-[#374151]"
                : "bg-white hover:bg-gray-100"
            }
        `}
        >

        <div className="flex justify-between items-start">

            <div>

            <h3 className="text-xl font-semibold mb-2">
                {chat.title}
            </h3>

            <p
                className={`${
                darkMode
                    ? "text-gray-300"
                    : "text-gray-500"
                }`}
            >
            {patientId
            ? t("history.readChat")
            : t("history.continueChat")}
            </p>

            </div>

            <div className="flex flex-col items-end gap-2">

            <p
                className={`text-sm ${
                darkMode
                    ? "text-gray-400"
                    : "text-gray-400"
                }`}
            >
                {new Date(
                chat.updated_at
                ).toLocaleString()}
            </p>

            {!patientId && (

                <button
                onClick={(e) => {

                    e.stopPropagation();

                    deleteChat(chat.id);

                }}
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

            )}

            </div>

        </div>

    </div>

  );

}

export default ChatHistoryCard;
