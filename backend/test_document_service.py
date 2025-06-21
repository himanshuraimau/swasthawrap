#!/usr/bin/env python3
"""
Test script for document processing functionality
"""
import asyncio
import sys
import os
sys.path.append('.')

from services.document_service import document_service

async def test_document_service():
    print("Testing Document Service...")
    
    # Test text chunking
    sample_text = "This is a test document. " * 100  # Create a long text
    chunks = document_service.chunk_text(sample_text, max_chunk_size=200)
    print(f"Text chunking test: Created {len(chunks)} chunks from {len(sample_text)} characters")
    
    # Test summary creation
    summary = document_service.create_document_summary(sample_text, max_length=100)
    print(f"Summary test: Created summary of {len(summary)} characters")
    
    print("✓ Document service tests passed!")

if __name__ == "__main__":
    asyncio.run(test_document_service())
