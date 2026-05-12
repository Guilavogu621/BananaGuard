import tensorflow as tf
import json
import os

def test_model_loading():
    model_path = "ai_model/model/bananaguard_model.h5"
    classes_path = "ai_model/model/bananaguard_classes_fr.json"
    
    print(f"Checking if model exists at {model_path}...")
    if not os.path.exists(model_path):
        print("Model file not found!")
        return
    
    print(f"Checking if classes file exists at {classes_path}...")
    if not os.path.exists(classes_path):
        print("Classes file not found!")
        return
        
    print("Loading model...")
    try:
        model = tf.keras.models.load_model(model_path)
        print("Model loaded successfully!")
        model.summary()
    except Exception as e:
        print(f"Error loading model: {e}")
        
    print("Loading classes...")
    try:
        with open(classes_path, 'r', encoding='utf-8') as f:
            classes = json.load(f)
        print(f"Classes loaded: {classes}")
    except Exception as e:
        print(f"Error loading classes: {e}")

if __name__ == "__main__":
    test_model_loading()
