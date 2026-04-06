# RAG Project

This is a basic Retrieval-Augmented Generation (RAG) application using LangChain, ChromaDB, and OpenAI models. It allows you to run a chat interface that answers questions based entirely on your own local text documents.

## Features
- **Document Ingestion:** Reads `.txt` files from the `docs/` directory.
- **Vector Database:** Uses Chroma to store document embeddings locally in the `db/` folder.
- **Embeddings & LLM:** Powered by OpenAI (`text-embedding-3-small` for embeddings and `gpt-4o` for chat).
- **Context-Aware Chat:** Maintains conversation history for follow-up questions.

## Setup Instructions

1. **Virtual Environment (Optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

2. **Install Dependencies:**
   Make sure you have all the necessary packages installed:
   ```bash
   pip install langchain-chroma langchain-core langchain-openai langchain-community langchain-text-splitters python-dotenv chromadb
   ```

3. **Environment Variables:**
   Create a `.env` file in the root of the project and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Usage

### 1. Ingest Documents
Place your text files (e.g., `Google.txt`, `Microsoft.txt`) inside the `docs/` directory. Then, run the ingestion script to process the documents and create the local vector database:

```bash
python ingestion.py
```
*(Note: This creates a `db/` folder containing the Chroma vector store. If you update your documents, you must delete the `db/` folder before re-running the script to reflect the changes.)*

### 2. Chat with your Documents
Once the database is initialized, start the interactive chat experience:

```bash
python context_RAG.py
```
Type the questions at the prompt. The model will retrieve relevant context from your documents and use it to answer your questions. Type `quit` to exit.
