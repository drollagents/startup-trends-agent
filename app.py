from flask import Flask, render_template, request, jsonify
import os
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask application
def create_app():
    # Initialize Flask app with explicit static folder path
    static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    app = Flask(__name__, 
                static_folder=static_folder,
                static_url_path='/static')
    
    # Import LLM module here to ensure .env is loaded first
    from llm_helper import get_llm

    # Define routes
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/research', methods=['POST'])
    def research():
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Invalid JSON data'}), 400
                
            query = data.get('query', '')
            
            if not query:
                return jsonify({'error': 'No query provided'}), 400
            
            print(f"Received query: {query}")
            
            # Get LLM instance
            try:
                trends_llm = get_llm()
                print("LLM initialized successfully")
            except Exception as e:
                print(f"LLM initialization error: {str(e)}")
                return jsonify({'error': f"LLM connection error: {str(e)}"}), 500
            
            # Process the query
            try:
                print("Analyzing startup trends...")
                result = trends_llm.analyze_trends(query)
                print(f"Response generated successfully: {len(result)} chars")
                return jsonify({'response': result})
            except Exception as e:
                error_details = traceback.format_exc()
                print(f"Error processing query: {str(e)}\n{error_details}")
                return jsonify({'error': f"Error processing query: {str(e)}"}), 500
                
        except Exception as e:
            # Log any other unexpected errors
            error_details = traceback.format_exc()
            print(f"Unexpected error: {str(e)}\n{error_details}")
            return jsonify({'error': f"An unexpected error occurred: {str(e)}"}), 500
    
    return app

# Create the Flask app
app = create_app()

if __name__ == '__main__':
    # Run the Flask app with debug to see detailed error messages
    app.run(debug=True, port=5001)