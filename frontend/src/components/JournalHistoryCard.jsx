import { useLanguage } from "../context/LanguageContext";
function JournalHistoryCard({
  journal,
  darkMode
}) {
const { t } = useLanguage();
return(
    <div
        key={journal.id}
        className={`
            rounded-2xl
            p-5
            shadow-sm
            ${
            darkMode
                ? "bg-[#1f2937]"
                : "bg-white"
            }
        `}
        >
        
        <div className="flex justify-between items-center mb-3">

            <h3 className="text-lg font-semibold">
            {journal.title}
            </h3>

            <p
            className={`text-sm ${
                darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
            >
            {new Date(
                journal.created_at
            ).toLocaleString()}
            </p>

        </div>

        <p
            className={`${
            darkMode
                ? "text-gray-300"
                : "text-gray-600"
            }`}
        >
            {journal.content}
        </p>

    </div>
);

}

export default JournalHistoryCard;