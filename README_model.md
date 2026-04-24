# BananaGuard — Modèle IA

## Responsable

Mariama Lafou

## Résultats

| Métrique              | Valeur                          |
| ---------------------- | ------------------------------- |
| Modèle                | MobileNetV2 (Transfer Learning) |
| Framework              | TensorFlow / Keras 2.19         |
| Accuracy entraînement | 99.1%                           |
| Accuracy validation    | 95.6%                           |
| Accuracy test          | 96.4%                           |

## Dataset utilisé

- 1 600 images, 4 classes
- Split : 70% train / 15% val / 15% test
- Augmentation : rotation, zoom, flip, luminosité

## Fichiers

- bananaguard_model.h5 → modèle entraîné
- bananaguard_classes_fr.json → classes + traitements en français
- bananaguard_classes.json → mapping brut des classes

## Comment utiliser

```python
import tensorflow as tf
import json

model = tf.keras.models.load_model('bananaguard_model.h5')

with open('bananaguard_classes_fr.json') as f:
    classes = json.load(f)
```
