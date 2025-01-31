
from sentence_transformers import SentenceTransformer
import json
import sys

try:
    import torch
    # Initialize simpler model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print(json.dumps({"status": "success", "message": "Model initialized successfully"}))
except ImportError as e:
    print(json.dumps({"status": "error", "message": "Missing dependencies: " + str(e)}))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))
