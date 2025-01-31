import json
import sys
import os

def init_model():
    try:
        # First try importing the required packages
        import numpy as np
        from sklearn.preprocessing import StandardScaler
        from sentence_transformers import SentenceTransformer

        # Initialize the model with simpler configuration
        model = SentenceTransformer('paraphrase-MiniLM-L3-v2')
        device = "cpu"  # Force CPU usage for reliability
        model.to(device)

        # Test if model is working by encoding a simple text
        test_embedding = model.encode("Test sentence", convert_to_tensor=False)
        if test_embedding is None or len(test_embedding) == 0:
            raise ValueError("Model initialization test failed")

        return {
            "status": "success",
            "message": f"Model initialized successfully on {device}",
            "embedding_size": len(test_embedding)
        }

    except ImportError as e:
        return {"status": "error", "message": f"Import error: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Initialization error: {str(e)}"}

if __name__ == "__main__":
    result = init_model()
    print(json.dumps(result))