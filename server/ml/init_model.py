
import torch
from transformers import AutoTokenizer, AutoModel
from sentence_transformers import SentenceTransformer
import json

# Initialize the model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Return success
print(json.dumps({"status": "success", "message": "Model initialized successfully"}))
