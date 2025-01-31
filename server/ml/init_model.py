
import json
import sys

try:
    import torch
    from sentence_transformers import SentenceTransformer
    
    # Verify torch is installed correctly
    if not torch.__version__:
        raise ImportError("PyTorch version not found")
        
    # Initialize simpler model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print(json.dumps({"status": "success", "message": "Model initialized successfully"}))
except ImportError as e:
    print(json.dumps({"status": "error", "message": f"Missing dependencies: {str(e)}"}))
except Exception as e:
    print(json.dumps({"status": "error", "message": str(e)}))
