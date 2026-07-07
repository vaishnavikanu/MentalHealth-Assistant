import pandas as pd

from evaluation.prepare.base import BasePreprocessor


class CounselChatPreprocessor(BasePreprocessor):

    def prepare(self):

        df = pd.read_csv(
            "evaluation/raw/counselchat/counselchat.csv"
        )

        processed = []

        for idx, row in df.iterrows():

            question = ""

            if pd.notna(row.get("questionTitle")):
                question += str(row["questionTitle"]).strip()

            if pd.notna(row.get("questionText")):
                question += "\n\n" + str(row["questionText"]).strip()

            answer = str(
                row.get("answerText", "")
            ).strip()

            if len(question) < 10:
                continue

            if len(answer) < 10:
                continue

            processed.append(

                {

                    "id": str(idx),

                    "question": question,

                    "answer": answer,

                    "role": "patient",

                    "language": "en",

                    "metadata": {

                        "dataset": "CounselChat",

                        "topic": row.get("topic", ""),

                    },

                }

            )

        self.save(
            "counselchat",
            processed,
        )


if __name__ == "__main__":

    CounselChatPreprocessor().prepare()