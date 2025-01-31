
import numpy as np
from sentence_transformers import SentenceTransformer
import json

class RAGSystem:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.document_store = []
        self.embeddings = []

    def add_document(self, content: str, metadata: dict = None):
        self.document_store.append({"content": content, "metadata": metadata})
        embedding = self.model.encode(content)
        self.embeddings.append(embedding)

    def search(self, query: str, top_k: int = 3):
        query_embedding = self.model.encode(query)
        scores = []
        
        for doc_embedding in self.embeddings:
            similarity = np.dot(query_embedding, doc_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(doc_embedding)
            )
            scores.append(similarity)
            
        top_indices = np.argsort(scores)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            results.append({
                **self.document_store[idx],
                "score": float(scores[idx])
            })
            
        return results

rag_system = RAGSystem()
