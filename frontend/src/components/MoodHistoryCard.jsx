import { useLanguage } from "../context/LanguageContext";

function MoodHistoryCard({
    mood,
    darkMode
}) {

const { t } = useLanguage();

return(

    <div
        key={mood.id}
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

            <h3 className="text-5xl font-semibold">
            {mood.mood}
            </h3>

            <p
            className={`text-sm ${
                darkMode
                ? "text-gray-400"
                : "text-gray-400"
            }`}
            >
            {new Date(
                mood.created_at
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
            {mood.note}
        </p>

    </div>
);

}

export default MoodHistoryCard;
