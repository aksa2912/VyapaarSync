import requests
import os

# Replace this with the actual path to your PDF file
file_path = "D:\Downloads\ai_select_for_sharing_1795134101914.pdf" 

if not os.path.exists(file_path):
    print(f"File not found at {file_path}. Please update the path.")
else:
    url = "http://localhost:8000/api/extract-document"
    
    # We open the file in binary mode
    with open(file_path, "rb") as f:
        files = {"file": (os.path.basename(file_path), f, "application/pdf")}
        data = {"doc_type": "purchase_order"}
        
        print("Sending request to backend...")
        response = requests.post(url, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())