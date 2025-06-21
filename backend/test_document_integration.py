#!/usr/bin/env python3
"""
Test script for document processing in chat messages
"""
import asyncio
import sys
import os
sys.path.append('.')

async def test_document_processing():
    try:
        # Test if we can import all services
        from services.document_service import document_service
        from services.openai_service import openai_service
        from services.chat_service import chat_service
        
        print("✓ All services imported successfully")
        
        # Test document service methods
        sample_text = """
        MEDICAL REPORT
        Patient: John Doe
        Date: 2025-01-15
        
        Blood Pressure: 140/90 mmHg (High)
        Cholesterol: 250 mg/dL (Elevated)
        Blood Sugar: 110 mg/dL (Normal)
        
        Recommendations:
        1. Reduce sodium intake
        2. Exercise regularly
        3. Follow up in 3 months
        """
        
        # Test text chunking
        chunks = document_service.chunk_text(sample_text)
        print(f"✓ Text chunking: {len(chunks)} chunks created")
        
        # Test summary creation  
        summary = document_service.create_document_summary(sample_text, max_length=100)
        print(f"✓ Summary creation: {len(summary)} characters")
        
        print("\n📄 Document Processing Test Complete!")
        print("The document processing functionality is ready to use.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_document_processing())
