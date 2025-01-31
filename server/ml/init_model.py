
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import json

def initialize_model():
    model_name = "deepseek-ai/deepseek-coder-6.7b-base"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16)
    
    return {
        "status": "success",
        "message": "DeepSeek model initialized successfully"
    }

if __name__ == "__main__":
    result = initialize_model()
    print(json.dumps(result))
