
import json
import sys

try:
    import torch
    if not torch.__version__:
        raise ImportError("PyTorch not properly installed")
        
    from transformers import AutoTokenizer
    from sentence_transformers import SentenceTransformer
    
    # Initialize simpler model with specific device placement
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = SentenceTransformer('all-MiniLM-L6-v2').to(device)
    print(json.dumps({"status": "success", "message": f"Model initialized successfully on {device}"}))
except ImportError as e:
    print(json.dumps({"status": "error", "message": f"Import error: {str(e)}"}))
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Initialization error: {str(e)}"}))
