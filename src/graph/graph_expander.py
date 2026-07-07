from collections import defaultdict


class GraphExpander:

    def expand(
        self,
        graphs,
        entities,
        top_k=10,
    ):

        scores = defaultdict(float)

        #
        # Original entities always stay.
        #
        for entity in entities:
            scores[entity] += 100

        for graph in graphs:

            for entity in entities:

                if not graph.has_node(entity):
                    continue

                #
                # Look at every outgoing edge.
                #
                for neighbor in graph.get_neighbors(entity):

                    node = graph.get_node(neighbor)

                    if node is None:
                        continue

                    score = 0

                    #
                    # Frequently occurring nodes
                    #
                    score += node.get(
                        "frequency",
                        1,
                    )

                    #
                    # Entity type bonus
                    #
                    entity_type = node.get(
                        "entity_type",
                        "general",
                    )

                    priority = {

                        "disorder": 5,
                        "therapy": 5,
                        "medication": 5,
                        "assessment": 4,
                        "symptom": 3,
                        "lifestyle": 2,
                        "general": 1,

                    }

                    score += priority.get(
                        entity_type,
                        1,
                    )

                    scores[neighbor] += score

        ranked = sorted(

            scores.items(),

            key=lambda x: x[1],

            reverse=True,

        )

        return [

            entity

            for entity, _ in ranked[:top_k]

        ]