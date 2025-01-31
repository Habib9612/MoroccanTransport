
from sentence_transformers import SentenceTransformer
import json

try:
    # Initialize simpler model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print(json.dumps({"status": "success", "message": "Model initialized successfully"}))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))
