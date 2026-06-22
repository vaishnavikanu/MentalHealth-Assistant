import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.utils.config import config
from src.utils.logging import setup_logging
from src.pipeline.rag_pipeline import RAGPipeline
from loguru import logger


def create_sample_data():
    import os
    os.makedirs("data/curated_kb", exist_ok=True)
    os.makedirs("data/user_content/users/patient_001", exist_ok=True)
    os.makedirs("data/user_content/clinicians/clinician_001", exist_ok=True)

    curated_content = """# DSM-5 Major Depressive Disorder Criteria

## Diagnostic Criteria
A. Five (or more) of the following symptoms have been present during the same 2-week period and represent a change from previous functioning; at least one of the symptoms is either (1) depressed mood or (2) loss of interest or pleasure.

1. Depressed mood most of the day, nearly every day.
2. Markedly diminished interest or pleasure in all, or almost all, activities most of the day.
3. Significant weight loss when not dieting or weight gain, or decrease or increase in appetite nearly every day.
4. Insomnia or hypersomnia nearly every day.
5. Psychomotor agitation or retardation nearly every day.
6. Fatigue or loss of energy nearly every day.
7. Feelings of worthlessness or excessive or inappropriate guilt.
8. Diminished ability to think or concentrate, or indecisiveness.
9. Recurrent thoughts of death, recurrent suicidal ideation without a specific plan, or a suicide attempt.

## CBT for Depression

Cognitive Behavioral Therapy (CBT) is a first-line treatment for depression. It focuses on identifying and changing negative thought patterns and behaviors.

### Core Components:
1. **Cognitive Restructuring**: Identifying automatic negative thoughts and challenging cognitive distortions
2. **Behavioral Activation**: Increasing engagement in rewarding activities
3. **Problem-Solving Skills**: Developing coping strategies for life stressors
4. **Relapse Prevention**: Creating a plan for maintaining gains

### Evidence Base:
Multiple RCTs demonstrate CBT efficacy for mild to moderate depression. Combined with medication for severe cases.

## Anxiety Disorders Overview

### Generalized Anxiety Disorder (GAD)
Excessive anxiety and worry occurring more days than not for at least 6 months, about a number of events or activities.

### Treatment:
- CBT is first-line psychotherapy
- SSRIs/SNRIs are first-line pharmacotherapy
- Combination therapy for severe cases
"""

    with open("data/curated_kb/dsm5_depression.txt", "w") as f:
        f.write(curated_content)

    patient_content = """Today I've been feeling really down. I woke up and didn't want to get out of bed. 
Nothing seems enjoyable anymore, even things I used to love like reading and walking my dog.
I've been having trouble sleeping - either can't fall asleep or wake up at 3am and can't go back.
My appetite is gone, I've lost 5 pounds in two weeks without trying.
I feel worthless and like a burden to my family. Hard to concentrate at work.
I keep thinking about death, not that I'd do anything, but the thoughts are there.
"""

    with open("data/user_content/users/patient_001/journal_week1.txt", "w") as f:
        f.write(patient_content)

    clinician_content = """Patient: patient_001
Date: 2024-01-15
Presenting Problem: Depressive symptoms x 3 weeks
PHQ-9 Score: 17 (moderately severe)
GAD-7 Score: 12 (moderate anxiety)

Assessment:
- Meets DSM-5 criteria for MDD, single episode, moderate severity
- Comorbid GAD symptoms
- No SI with plan/intent reported
- Good insight, motivated for treatment

Treatment Plan:
1. Start Sertraline 50mg daily, titrate to 100mg at 2 weeks
2. Refer for CBT - weekly sessions
3. Safety plan completed
4. Follow-up in 2 weeks
5. Monitor for activation syndrome
"""

    with open("data/user_content/clinicians/clinician_001/patient_001_intake.txt", "w") as f:
        f.write(clinician_content)

    print("Sample data created successfully!")


def run_example_queries(pipeline: RAGPipeline):
    print("\n" + "="*60)
    print("EXAMPLE QUERIES")
    print("="*60)

    patient_queries = [
        "I've been feeling really sad and hopeless lately. What can help?",
        "I can't sleep and have no appetite. Is this normal?",
        "How do I know if I need professional help?",
    ]

    clinician_queries = [
        "What are the DSM-5 criteria for Major Depressive Disorder?",
        "First-line treatment options for moderate MDD with comorbid anxiety?",
        "CBT protocol for depression - key components and session structure?",
    ]

    print("\n--- PATIENT QUERIES ---")
    for query in patient_queries:
        print(f"\nQ: {query}")
        result = pipeline.query(query, role="patient", user_id="patient_001")
        print(f"A: {result.response[:300]}...")
        print(f"  Latency: {result.latency_ms:.0f}ms, Retrieved: {len(result.retrieved_chunks)} chunks")

    print("\n--- CLINICIAN QUERIES ---")
    for query in clinician_queries:
        print(f"\nQ: {query}")
        result = pipeline.query(query, role="clinician", user_id="clinician_001")
        print(f"A: {result.response[:300]}...")
        print(f"  Latency: {result.latency_ms:.0f}ms, Retrieved: {len(result.retrieved_chunks)} chunks")

def run_interactive_mode(pipeline: RAGPipeline):
    print("\n" + "="*60)
    print("INTERACTIVE MODE (type 'exit' to quit)")
    print("="*60)

    while True:
        role = input("\nEnter role (patient/clinician): ").strip()
        if role.lower() == "exit":
            break

        user_id = input("Enter user_id: ").strip()
        if user_id.lower() == "exit":
            break

        query = input("Enter query: ").strip()
        if query.lower() == "exit":
            break

        try:
            result = pipeline.query(query, role=role, user_id=user_id)

            print("\n--- RESPONSE ---")
            print(result.response)

            print("\n--- STATS ---")
            print(f"Latency: {result.latency_ms:.0f}ms")
            print(f"Retrieved chunks: {len(result.retrieved_chunks)}")

            print("\n--- RETRIEVED CONTEXT ---")
            for item in result.retrieved_chunks:
                try:
                    print("-", item.chunk.text[:120])
                except:
                    print("-", str(item)[:120])

        except Exception as e:
            print(f"\nError: {e}")


def main():
    setup_logging()
    config.load("configs/config.yaml")

    logger.info("Starting RAG System")

    create_sample_data()

    pipeline = RAGPipeline(use_mock_generator=True)

    print("Building indexes...")
    pipeline.build_indexes()

    print("Ingesting user data...")
    pipeline.ingest_user_data("patient_001")

    print("Ingesting clinician data...")
    pipeline.ingest_clinician_data("clinician_001")

    print("\n" + "="*60)
    print("SELECT MODE")
    print("="*60)
    print("1. Run example queries")
    print("2. Interactive mode")

    choice = input("Enter choice (1/2): ").strip()

    if choice == "1":
        run_example_queries(pipeline)
    elif choice == "2":
        run_interactive_mode(pipeline)
    else:
        print("Invalid choice, running example queries by default.")
        run_example_queries(pipeline)

    

    print("\n" + "="*60)
    print("SYSTEM STATS")
    print("="*60)
    stats = pipeline.get_stats()
    for name, store_stats in stats["stores"].items():
        print(f"{name}: {store_stats['total_vectors']} vectors, {store_stats['unique_parents']} parents")

    logger.info("RAG System demo complete")


if __name__ == "__main__":
    main()