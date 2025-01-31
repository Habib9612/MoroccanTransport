import json
import sys
import os

def init_model():
    try:
        import torch
        from transformers import AutoTokenizer
        from sentence_transformers import SentenceTransformer

        # Initialize simpler model with specific device placement
        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = SentenceTransformer('all-MiniLM-L6-v2')
        model.to(device)

        # Verify model initialization
        if model is None:
            raise ValueError("Model initialization failed")

        return {"status": "success", "message": f"Model initialized successfully on {device}"}

    except ImportError as e:
        return {"status": "error", "message": f"Import error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Initialization error: {str(e)}"}

if __name__ == "__main__":
    result = init_model()
    print(json.dumps(result))