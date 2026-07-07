from itertools import combinations


class RelationExtractor:

    def __init__(self):

        #
        # Relation Rules
        #
        self.rules = {

            ("therapy", "disorder"):
                "treated_by",

            ("medication", "disorder"):
                "medication_for",

            ("assessment", "disorder"):
                "assessment_for",

            ("symptom", "disorder"):
                "symptom_of",

            ("lifestyle", "disorder"):
                "helps_manage",

            ("general", "disorder"):
                "related_to",

            ("general", "symptom"):
                "related_to",

            ("therapy", "symptom"):
                "improves",

            ("medication", "symptom"):
                "reduces",

            ("therapy", "therapy"):
                "related_to",

            ("medication", "medication"):
                "related_to",

            ("disorder", "disorder"):
                "comorbid_with",

            ("symptom", "symptom"):
                "co_occurs_with",
        }

    ###########################################################

    def _relation(
        self,
        type1,
        type2,
    ):

        if (type1, type2) in self.rules:

            return self.rules[
                (type1, type2)
            ]

        if (type2, type1) in self.rules:

            return self.rules[
                (type2, type1)
            ]

        return "related_to"

    ###########################################################

    def extract(
        self,
        entities,
    ):

        relations = []

        seen = set()

        for e1, e2 in combinations(
            entities,
            2,
        ):

            relation = self._relation(

                e1["type"],

                e2["type"],

            )

            edge = (

                e1["entity"],

                e2["entity"],

                relation,

            )

            if edge in seen:
                continue

            seen.add(edge)

            relations.append(

                {

                    "source": e1["entity"],

                    "target": e2["entity"],

                    "relation": relation,

                    "weight": 1.0,

                }

            )

        return relations