
import json
import sys
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

try:
    # Initialize DeepSeek Code model
    model_name = "deepseek-ai/deepseek-coder-1.3b-base"
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True).to(device)
    
    print(json.dumps({"status": "success", "message": f"DeepSeek Code model initialized successfully on {device}"}))
except ImportError as e:
    print(json.dumps({"status": "error", "message": f"Import error: {str(e)}"}))
except Exception as e:
    print(json.dumps({"status": "error", "message": f"Initialization error: {str(e)}"}))
