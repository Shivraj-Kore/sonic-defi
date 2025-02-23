from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import ast
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the Chrome extension

# Initialize Groq Client
GROQ_API_KEY = "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"
groq_client = Groq(api_key=GROQ_API_KEY)

MODEL_NAME = "llama-3.3-70b-versatile"

@app.route("/analyze", methods=["POST"])
def analyze_text():
    data = request.json
    selected_text = data.get("text", "")

    if not selected_text:
        return jsonify({"error": "No text provided"}), 400

    # Prepare prompts
    system_prompt = {
                "role": "system",
                "content": '''You are an AI that is used to determine whether someone is trying to send money or request for money .
                - you need to give reply of only whether to send money or receive money
                - what coin the money is to be sent 
                - amount of money
                - who to send money to 

                - the currency should be in having their token symbol name in all small for example Bitcoin = btc , ethereum = eth , sonic = sss
                all this should be in a python list format for example : ["send", "eth", 0.5, "@JohnDoe] or ["send", "btc", 0.01, "@JonhsonMayer"] or ["send", "sss", 0.4, "@OmkarJ639"]

                '''
                }
    
    
    user_prompt = {
                "role": "user",
                "content": f'give python array for : "{selected_text}"?'
                }

    try:
        print(f"Processing text: {selected_text}")

        # Call Groq API using SDK
        response = groq_client.chat.completions.create(
            model=MODEL_NAME,
            messages=[system_prompt, user_prompt],
            max_tokens=256,
            temperature=0
        )

        # Extract AI response
        ai_response = response.choices[0].message.content if response.choices else "No response from AI."

        finalresponse = ast.literal_eval(ai_response)
        return jsonify({"result": finalresponse})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
