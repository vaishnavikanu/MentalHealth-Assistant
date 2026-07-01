import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

function MoodCalendar({ moods, darkMode }) {

  const { t } = useLanguage();

  const today = new Date();

  const [currentMonth, setCurrentMonth] =
    useState(today.getMonth());

  const [currentYear, setCurrentYear] =
    useState(today.getFullYear());

   const monthNames = [
        t("months.january"),
        t("months.february"),
        t("months.march"),
        t("months.april"),
        t("months.may"),
        t("months.june"),
        t("months.july"),
        t("months.august"),
        t("months.september"),
        t("months.october"),
        t("months.november"),
        t("months.december")
    ]; 

    const firstDay =
        new Date(
            currentYear,
            currentMonth,
            1
        ).getDay();

    const totalDays =
        new Date(
            currentYear,
            currentMonth + 1,
            0
        ).getDate();

    const calendarDays = [];

    for (let i = 0;i < firstDay;i++) {
        calendarDays.push(null);
    }
    for (let day = 1;day <= totalDays;day++) {
        calendarDays.push(day);
    }
    while (calendarDays.length < 42) {
        calendarDays.push(null);
    }
    const moodScores = {

        "😍": 100,
        "😊": 80,
        "😴": 60,
        "😰": 40,
        "😡": 20,
        "😔": 0

    };

    const legend = [

        {
            emoji: "😊",
            label: t("moods.happy")
        },

        {
            emoji: "😔",
            label: t("moods.sad")
        },

        {
            emoji: "😡",
            label: t("moods.angry")
        },

        {
            emoji: "😰",
            label: t("moods.anxious")
        },

        {
            emoji: "😴",
            label: t("moods.tired")
        },

        {
            emoji: "😍",
            label: t("moods.loved")
        }

    ];

    const averageMood = {};

    moods.forEach((item) => {

        const date = new Date(item.created_at);

        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {

            const day = date.getDate();

            if (!averageMood[day]) {
                averageMood[day] = [];
            }
            averageMood[day].push(moodScores[item.mood]);
        }
    });

    const moodMap = {};

    Object.keys(averageMood).forEach((day) => {

        const values = averageMood[day];

        const average = values.reduce((a, b) => a + b,0) / values.length;

        if (average >= 90)
            moodMap[day] = "😍";

        else if (average >= 70)
            moodMap[day] = "😊";

        else if (average >= 50)
            moodMap[day] = "😴";

        else if (average >= 30)
            moodMap[day] = "😰";

        else if (average >= 10)
            moodMap[day] = "😡";

        else
            moodMap[day] = "😔";

    });

  return (

    <div
      className={`
        rounded-3xl
        p-4.5
        h-full
        shadow-sm
        ${
          darkMode
            ? "bg-[#1f2937]"
            : "bg-white"
        }
      `}
    >

      {/* TITLE */}

      <h2 className="text-2xl font-semibold mb-6 ">

        {t("checkin.moodCalendar")}

      </h2>

      {/* Month Header */}

      <div className="flex justify-between items-center mb-3">

        <button
            onClick={() => {

                if (currentMonth === 0) {

                setCurrentMonth(11);

                setCurrentYear(currentYear - 1);

                }

                else {

                setCurrentMonth(currentMonth - 1);

                }

            }}
            >

            ❮

        </button>

        <h3 className="font-semibold text-base md:text-xl text-[#5eae96]">

        {monthNames[currentMonth]} {currentYear}

        </h3>

        <button
            onClick={() => {

                if (currentMonth === 11) {

                setCurrentMonth(0);

                setCurrentYear(currentYear + 1);

                }

                else {

                setCurrentMonth(currentMonth + 1);

                }

            }}
            >

            ❯

        </button>

      </div>

      {/* Week Days */}

      <div className="grid grid-cols-7 text-center mb-3 text-sm md:text-base font-medium">

        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>

      </div>

      {/* Calendar Placeholder */}

      <div
        className="
          grid
          grid-cols-7
          gap-y-0 gap-x-1.5
          flex-1
        "
      >

        {calendarDays.map((day, index) => (

          <div
            key={index}
            className={`
              h-14
              w-12
              sm:h-11
              sm:w-10
              md:h-12
              md:w-11
              lg:h-13.5
              lg:w-12
              flex
              items-center
              justify-center
              text-3xl
              sm:text-2xl
              md:text-4xl
              relative
              group
            `}
          >

            <>
            {day ? (moodMap[day] || (

                <span
                    className={`text-xl ${
                        darkMode
                            ? "text-gray-600"
                            : "text-gray-300"
                    }`}
                >
                    •
                </span>

            )) : (

            <span
                className={`text-xl ${
                    darkMode
                        ? "text-gray-700"
                        : "text-gray-300"
                }`}
            >
                •
            </span>

            )}

            {day && (

                <div
                className={`
                    absolute
                    -top-10
                    left-1/2
                    -translate-x-1/2
                    px-2
                    py-1
                    rounded-lg
                    text-xs
                    whitespace-nowrap
                    opacity-0
                    group-hover:opacity-100
                    transition
                    pointer-events-none
                    z-50
                    ${
                    darkMode
                        ? "bg-gray-800 text-white"
                        : "bg-black text-white"
                    }
                `}
                >

              {  new Date(currentYear, currentMonth, day).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                })}

                </div>

            )}
            </>

          </div>

        ))}

      </div>

        <div
        className={`
            mt-4
            pt-4
            border-t
            ${
            darkMode
                ? "border-gray-700"
                : "border-gray-200"
            }
        `}
        >

        <div
            className="
            flex
            flex-wrap
            justify-center
            gap-x-6
            gap-y-1
            text-sm
            "
        >

            {legend.map((item, index) => (

            <div
                key={index}
                className="flex items-center gap-2"
            >

                <span className="text-xl">

                {item.emoji}

                </span>

                <span
                className={`
                    ${
                    darkMode
                        ? "text-gray-300"
                        : "text-gray-700"
                    }
                `}
                >

                {item.label}

                </span>

            </div>

            ))}

        </div>

        </div>

    </div>

  );

}

export default MoodCalendar;