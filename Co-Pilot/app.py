# app.py - Starter version of the AR Patient Training Co-Pilot

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from email_service import email_service

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure database
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')


# Route for checking if the app is running
@app.route('/')
def index():
    return jsonify({
        'name': 'AR-Supported Patient Training Co-Pilot API',
        'version': '0.1.0',
        'status': 'running'
    })

# Simple test route
@app.route('/api/test')
def test():
    return jsonify({
        'message': 'API is working correctly!'
    })


print(f"AWS Access Key ID: {os.getenv('AWS_ACCESS_KEY_ID')[:5]}...")  # Print first 5 chars only for security
print(f"AWS Region: {os.getenv('AWS_REGION')}")


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

    print(f"AWS Access Key ID: {os.getenv('AWS_ACCESS_KEY_ID')[:5]}...")  # Print first 5 chars only for security
    print(f"AWS Region: {os.getenv('AWS_REGION')}")