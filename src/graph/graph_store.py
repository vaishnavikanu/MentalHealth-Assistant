import os
import pickle
from typing import Dict, List, Optional

import networkx as nx
from loguru import logger


class GraphStore:

    def __init__(
        self,
        graph_name: str,
        graph_directory: str = "./graphs",
    ):

        self.graph_name = graph_name
        self.graph_directory = graph_directory

        os.makedirs(
            self.graph_directory,
            exist_ok=True,
        )

        self.graph_path = os.path.join(
            self.graph_directory,
            f"{graph_name}.pkl",
        )

        self.graph = nx.DiGraph()

        self.load()

    ##########################################################
    # Persistence
    ##########################################################

    def save(self):

        with open(self.graph_path, "wb") as f:
            pickle.dump(self.graph, f)

        logger.info(
            f"Saved graph '{self.graph_name}' "
            f"({self.graph.number_of_nodes()} nodes, "
            f"{self.graph.number_of_edges()} edges)"
        )

    def load(self):

        if not os.path.exists(self.graph_path):
            return

        with open(self.graph_path, "rb") as f:
            self.graph = pickle.load(f)

        logger.info(
            f"Loaded graph '{self.graph_name}' "
            f"({self.graph.number_of_nodes()} nodes, "
            f"{self.graph.number_of_edges()} edges)"
        )

    ##########################################################
    # Nodes
    ##########################################################

    def add_node(
        self,
        node_id: str,
        label: str,
        entity_type: str = "unknown",
        aliases: Optional[List[str]] = None,
        document_id: Optional[str] = None,
        chunk_id: Optional[str] = None,
    ):

        aliases = aliases or []

        if self.graph.has_node(node_id):

            node = self.graph.nodes[node_id]

            if document_id:
                node["document_ids"].add(document_id)

            if chunk_id:
                node["chunk_ids"].add(chunk_id)

            node["frequency"] += 1

            return

        self.graph.add_node(

            node_id,

            label=label,

            entity_type=entity_type,

            aliases=set(aliases),

            document_ids=set(
                [] if document_id is None else [document_id]
            ),

            chunk_ids=set(
                [] if chunk_id is None else [chunk_id]
            ),

            frequency=1,
        )

    ##########################################################
    # Edges
    ##########################################################

    def add_edge(
        self,
        source,
        target,
        relation="related_to",
        document_id=None,
        chunk_id=None,
        weight=1.0,
    ):

        if self.graph.has_edge(source, target):

            if self.graph.is_multigraph():
                key = next(iter(self.graph[source][target]))
                edge = self.graph.edges[source, target, key]
            else:
                edge = self.graph.edges[source, target]

            edge["weight"] = edge.get("weight", 0) + weight
            edge["frequency"] = edge.get("frequency", 0) + 1

            if document_id is not None:
                edge.setdefault("document_ids", set()).add(document_id)

            if chunk_id is not None:
                edge.setdefault("chunk_ids", set()).add(chunk_id)

            return

        self.graph.add_edge(
            source,
            target,
            relation=relation,
            weight=weight,
            frequency=1,
            document_ids=set(
                [] if document_id is None else [document_id]
            ),
            chunk_ids=set(
                [] if chunk_id is None else [chunk_id]
            ),
        )
    ##########################################################
    # Lookup
    ##########################################################

    def has_node(
        self,
        node_id: str,
    ) -> bool:

        return self.graph.has_node(node_id)

    def get_node(
        self,
        node_id: str,
    ):

        if not self.has_node(node_id):
            return None

        return self.graph.nodes[node_id]

    def get_neighbors(
        self,
        node_id: str,
    ) -> List[str]:

        if not self.has_node(node_id):
            return []

        return list(
            self.graph.neighbors(node_id)
        )

    ##########################################################
    # Statistics
    ##########################################################

    def get_stats(self):

        return {

            "graph_name": self.graph_name,

            "nodes": self.graph.number_of_nodes(),

            "edges": self.graph.number_of_edges(),

        }