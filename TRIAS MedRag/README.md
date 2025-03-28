# TRIAS MedRAG

## Overview
TRIAS MedRAG is a Retrieval-Augmented Generation (RAG) system developed during the Würzburg Healthcare Hackathon. The system is designed to assist healthcare professionals by retrieving relevant medical information from a knowledge base and generating accurate, contextual responses to medical queries.

## Features
- **Medical Knowledge Retrieval**: Efficiently searches through medical documents and extracts relevant information
- **Context-Aware Responses**: Generates responses that consider the specific medical context of the query
- **Multi-Source Integration**: Combines information from various medical sources to provide comprehensive answers
- **User-Friendly Interface**: Simple interface for healthcare professionals to interact with the system

## Technical Architecture
- **Frontend**: React-based user interface for query input and response display
- **Backend**: FastAPI server handling request processing and orchestration
- **Retrieval System**: Vector database with medical document embeddings
- **Generation Component**: LLM-based text generation using retrieved context
- **Knowledge Base**: Curated collection of medical literature, guidelines, and research papers

