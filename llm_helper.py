from langchain_groq.chat_models import ChatGroq
import os
from dotenv import load_dotenv
import sys
from langchain.schema import HumanMessage

# Load environment variables from .env file
load_dotenv()

class StartupTrendsLLM:
    """A class that uses Groq LLM for startup trends analysis"""
    
    def __init__(self):
        self.llm = self._initialize_llm()
    
    def _initialize_llm(self):
        """Initialize the Groq LLM"""
        api_key = os.environ.get('GROQ_API_KEY')
        
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables. Please set it in the .env file.")
        
        # Initialize ChatGroq with direct parameters
        llm = ChatGroq(
            groq_api_key=api_key,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=1000,  # Setting reasonable limits to avoid token issues
        )
        
        return llm
    
    def analyze_trends(self, user_query: str) -> str:
        """Analyze startup trends based on the given query"""
        try:
            # Create a prompt with the query
            prompt = f"""
            You are a startup trends analyst specialized in researching tech startups and trends.
            
            Please analyze the following query about startup trends or technologies:
            
            Query: {user_query}
            
            Provide an insightful analysis based on your knowledge of recent tech trends, 
            startup companies, and technologies. Include examples of specific startups, 
            technologies, or market trends that are relevant.
            
            Your analysis should include:
            1. A brief overview of the relevant startup landscape or technology area
            2. 2-3 notable examples of startups or technologies in this space
            3. Key trends, challenges, or opportunities in this area
            4. A brief conclusion with potential future developments
            
            Format your response in a clear, structured manner with appropriate headings and paragraphs.
            """
            
            # Get response from LLM
            response = self.llm.invoke(prompt)
            
            if hasattr(response, 'content'):
                return response.content
            else:
                return str(response)
                
        except Exception as e:
            return f"Error analyzing trends: {str(e)}"

# Function to get the LLM instance
def get_llm():
    """Get a StartupTrendsLLM instance"""
    return StartupTrendsLLM()

if __name__ == "__main__":
    try:
        analyzer = get_llm()
        response = analyzer.analyze_trends("What are the latest trends in AI startups?")
        print(response)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)