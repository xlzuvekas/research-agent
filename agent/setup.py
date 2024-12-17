from setuptools import setup

setup(
   name='matcopvili',
   version='1.0',
   description='.',
   install_requires=[
      'langchain',
      'langgraph',
      'langchain-community',
      'tavily-python',
      'langchain-core~=0.3.15',
      'langchain_openai',
      'langchain_core',
      'pydantic',
      'python-dotenv',
      'json5',
      'copilotkit==0.1.29'
   ], #external packages as dependencies
)