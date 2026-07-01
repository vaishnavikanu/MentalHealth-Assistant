import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
function SelfCare({ darkMode }) {
  const { t } = useLanguage();
  //ARRAY OF AFFIRMATION
  const affirmations = [
    t("selfCare.aff1"),
    t("selfCare.aff2"),
    t("selfCare.aff3"),
    t("selfCare.aff4"),
    t("selfCare.aff5"),
    t("selfCare.aff6"),
    t("selfCare.aff7"),
    t("selfCare.aff8"),
    t("selfCare.aff9"),
    t("selfCare.aff10"),
    t("selfCare.aff11"),
    t("selfCare.aff12"),
    t("selfCare.aff13"),
    t("selfCare.aff14"),
    t("selfCare.aff15"),
  ];

  const groundingSteps = [
    t("selfCare.step1"),
    t("selfCare.step2"),
    t("selfCare.step3"),
    t("selfCare.step4"),
    t("selfCare.step5"),
  ];
  //THESE ARE TO KNOW WHETHER THE POPUP IS OPEN OR CLOSE
  const [showBreathing, setShowBreathing] = useState(false);

  const [showMeditation, setShowMeditation] = useState(false);

  const [showGrounding, setShowGrounding] = useState(false);

  const [showSleep, setShowSleep] = useState(false);

  const [showGratitude, setShowGratitude] = useState(false);

  const [showAffirmation, setShowAffirmation] = useState(false);
  //TELLS WHICH ONE TO DISPLAY CURRENTLY
  const [affirmation, setAffirmation] = useState("");
  //FOR MEDITATION
  const [timeLeft, setTimeLeft] = useState(60);

  // RANDOM AFFIRMATION
  const generateAffirmation = () => {
    const random =
      affirmations[
        Math.floor(
          Math.random() * //GENERATES RANDOM NUMBER B/W 0,1
            affirmations.length,
        )
      ];

    setAffirmation(random);

    setShowAffirmation(true);
  };

  // MEDITATION TIMER
  useEffect(() => {
    let timer;

    if (showMeditation && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    // SOUND
    if (showMeditation && timeLeft === 0) {
      let count = 0;

      const interval = setInterval(() => {
        const audio = new Audio(
          "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        );

        audio.play();

        count++;

        if (count === 4) {
          clearInterval(interval); //STOPS THE BEEP
        }
      }, 700);
    }

    return () => clearTimeout(timer);
  }, [showMeditation, timeLeft]);
  //STYLING OF CARDS AND BUTTON TO REUSE THEM
  const cardStyle = `
    rounded-[28px]
    p-6
    text-center
    shadow-sm
    transition
    h-[180px]
    flex
    flex-col
  `;

  const buttonStyle = `
    bg-[#2D6658]
    hover:bg-[#245247]
    transition
    text-white
    px-7
    py-2.5
    rounded-2xl
    text-[17px]
    font-medium
  `;

  return (
    //ENTIRE PAGE DIV
    <div
      className={`
        h-full
        overflow-y-auto
        px-7
        py-5
        pb-20
        ${darkMode ? "bg-[#111827] text-white" : "bg-[#f7f5fc] text-black"}
      `}
    >
      {/* TITLE */}
      <h1 className="text-5xl font-bold mb-1">{t("selfCare.title")}</h1>

      <p
        className={`text-lg mb-6 ${
          darkMode ? "text-gray-300" : "text-gray-500"
        }`}
      >
        {t("selfCare.subtitle")}
      </p>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* BREATHING */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">
            {t("selfCare.breathing")}
          </h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.breathingDesc")}
          </p>

          <button
            onClick={() => setShowBreathing(true)}
            className={buttonStyle}
          >
            {t("selfCare.start")}
          </button>
        </div>

        {/* MEDITATION */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">
            {t("selfCare.meditation")}
          </h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.meditationDesc")}
          </p>

          <button
            onClick={() => {
              setShowMeditation(true);

              setTimeLeft(60);
            }}
            className={buttonStyle}
          >
            {t("selfCare.start")}
          </button>
        </div>

        {/* GROUNDING */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">
            {t("selfCare.grounding")}
          </h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.groundingDesc")}
          </p>

          <button
            onClick={() => setShowGrounding(true)}
            className={buttonStyle}
          >
            {t("selfCare.start")}
          </button>
        </div>

        {/* AFFIRMATION */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">
            {t("selfCare.affirmation")}
          </h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.affirmationDesc")}
          </p>

          <button onClick={generateAffirmation} className={buttonStyle}>
            {t("selfCare.show")}
          </button>
        </div>

        {/* GRATITUDE */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">
            {t("selfCare.gratitude")}
          </h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.gratitudeDesc")}
          </p>

          <button
            onClick={() => setShowGratitude(true)}
            className={buttonStyle}
          >
            {t("selfCare.start")}
          </button>
        </div>

        {/* SLEEP */}
        <div
          className={`
            ${cardStyle}
            ${darkMode ? "bg-[#1f2937]" : "bg-white"}
          `}
        >
          <h2 className="text-[22px] font-bold mb-4">{t("selfCare.sleep")}</h2>

          <p
            className={`text-[16px] flex-1 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {t("selfCare.sleepDesc")}
          </p>

          <button onClick={() => setShowSleep(true)} className={buttonStyle}>
            {t("selfCare.start")}
          </button>
        </div>
      </div>

      {/* BREATHING POPUP */}
      {showBreathing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          {" "}
          {/*BG 40% OPACITY,Z-5 MEANS POPUP 
        ON TOP OF EVERYTHINGS*/}
          <div
            className={`
              w-[92vw]
              max-w-[430px]
              rounded-[24px]
              p-4 md:p-5
              relative
              text-center
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowBreathing(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400" //POSITION RELATIVE TO POPUP BOX
            >
              ×
            </button>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("selfCare.breathing")}
            </h2>

            <div
              className="
              w-36 h-36
              sm:w-44 sm:h-44
              md:w-52 md:h-52
              mx-auto
              rounded-full
              bg-[#DCEFE9]
              flex
              items-center
              justify-center
              text-2xl
              sm:text-3xl
              md:text-4xl
              text-[#2D6658]
              mb-4
              animate-pulse
            "
            >
              {t("selfCare.breathe")}
            </div>

            <p
              className={`text-base md:text-xl leading-relaxed ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("selfCare.breatheText")}
            </p>
          </div>
        </div>
      )}

      {/* MEDITATION POPUP */}
      {showMeditation && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`
              w-[92vw] 
              max-w-[420px]
              rounded-[30px]
              p-4
              relative
              text-center
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowMeditation(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("selfCare.meditation")}
            </h2>

            <div className="text-4xl md:text-6xl font-bold text-[#69a78f] mb-6">
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, "0")}{" "}
              {/*CONVERTING INTO CLOCK FORMAT*/}
            </div>

            <p
              className={`text-lg ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("selfCare.meditationText")}
            </p>
          </div>
        </div>
      )}

      {/* GROUNDING POPUP */}
      {showGrounding && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`
              w-[92vw] 
              max-w-[460px]
              rounded-[30px]
              p-4
              relative
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowGrounding(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-center mb-5">
              {t("selfCare.grounding")}
            </h2>

            <div className="flex flex-col gap-3 text-base md:text-xl">
              {/*CREATES DIV FOR EACH POINT*/}
              {groundingSteps.map((step, index) => (
                <div
                  key={index}
                  className={`
                    rounded-2xl
                    px-3.5
                    py-3
                    ${darkMode ? "bg-[#374151]" : "bg-[#f3f4f6]"}
                  `}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SLEEP POPUP */}
      {showSleep && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`
              w-[92vw] 
              max-w-[430px]
              rounded-[30px]
              p-8
              relative
              text-center
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowSleep(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-6">{t("selfCare.sleep")}</h2>

            <p
              className={`text-[18px] leading-relaxed whitespace-pre-line ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {t("selfCare.sleepText")}
            </p>
          </div>
        </div>
      )}

      {/* AFFIRMATION POPUP */}
      {showAffirmation && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`
              w-[92vw] 
              max-w-[500px]
              rounded-[32px]
              p-5
              relative
              text-center
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowAffirmation(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-6">
              {t("selfCare.affirmation")}
            </h2>

            <p
              className={`text-[18px] leading-relaxed ${
                darkMode ? "text-gray-200" : "text-gray-600"
              }`}
            >
              {affirmation}
            </p>
          </div>
        </div>
      )}

      {/* GRATITUDE POPUP */}
      {showGratitude && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div
            className={`
              w-[92vw] 
              max-w-[520px]
              rounded-[32px]
              p-5
              relative
              text-center
              max-h-[85vh]
              overflow-y-auto
              ${darkMode ? "bg-[#1f2937]" : "bg-white"}
            `}
          >
            <button
              onClick={() => setShowGratitude(false)}
              className="absolute right-5 top-4 text-3xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-5">
              {t("selfCare.gratitude")}
            </h2>

            <p
              className={`text-2xl mb-2 ${
                darkMode ? "text-gray-200" : "text-gray-600"
              }`}
            >
              {t("selfCare.thinkAbout")}
            </p>

            <div className="flex flex-col gap-4 text-[19px]">
              <div>• {t("selfCare.goodToday")}</div>

              <div>• {t("selfCare.someone")}</div>

              <div>• {t("selfCare.proud")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelfCare;
