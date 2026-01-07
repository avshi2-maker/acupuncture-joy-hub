import os
import json
import google.generativeai as genai

def handler(event, context):
    # Standard Headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    }

    if event['httpMethod'] == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        # 1. Check API Key
        key = os.environ.get("GEMINI_API_KEY")
        if not key:
            print("❌ Log: Missing API Key")
            return {'statusCode': 500, 'headers': headers, 'body': 'Missing Server Key'}

        genai.configure(api_key=key)

        # 2. Get Question
        params = event.get('queryStringParameters', {})
        question = params.get('question')
        
        if not question:
            return {'statusCode': 400, 'headers': headers, 'body': 'Please provide a ?question='}

        # 3. Call AI
        # We use the Gemini 3 Flash model you confirmed is working locally
        model = genai.GenerativeModel('gemini-3-flash-preview')
        response = model.generate_content(f"Answer strictly in TCM terms: {question}")

        return {
            'statusCode': 200, 
            'headers': headers, 
            'body': json.dumps({"answer": response.text})
        }

    except Exception as e:
        print(f"❌ Log Error: {str(e)}")
        return {'statusCode': 500, 'headers': headers, 'body': f"Error: {str(e)}"}
