from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, UnidentifiedImageError
import torch
from torchvision import datasets, transforms
from torchvision.models import efficientnet_b1
import os
import requests
import json

# Configuración
IMG_SIZE = (224, 224)
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
MODEL_PATH = 'model/modelo_102_B1.pth'

# Cargar CLASSES y NOMBRE_COMUN_A_CIENTIFICO desde archivos JSON externos
with open('classes.json', 'r', encoding='utf-8') as f:
    CLASSES = json.load(f)

with open('nombre_comun_a_cientifico.json', 'r', encoding='utf-8') as f:
    NOMBRE_COMUN_A_CIENTIFICO = json.load(f)

# Diccionario inverso: nombre_cientifico -> nombre_comun
CIENTIFICO_A_NOMBRE_COMUN = {v: k for k, v in NOMBRE_COMUN_A_CIENTIFICO.items()}

EBIRD_API_KEY = "gb7uk3cug8e8"  # Reemplaza con tu API Key de eBird

app = Flask(__name__)
CORS(app)

# Preprocesamiento
transform = transforms.Compose([
    transforms.Resize(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Crear un diccionario para mapear índices a clases
# y viceversa
idx_to_class = {i: name for i, name in enumerate(CLASSES)}

# Cargar modelo EfficientNet_B0
model = efficientnet_b1(weights=None)
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, len(idx_to_class))
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model = model.to(DEVICE)
model.eval()

def load_ebird_taxonomy():
    """Descarga y cachea la taxonomía de eBird localmente (solo si no existe el archivo)."""
    taxonomy_path = 'ebird_taxonomy.json'
    if os.path.exists(taxonomy_path):
        with open(taxonomy_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json"
    headers = {"X-eBirdApiToken": EBIRD_API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        with open(taxonomy_path, 'w', encoding='utf-8') as f:
            json.dump(data, f)
        return data
    return []

EBIRD_TAXONOMY = load_ebird_taxonomy()

# Diccionario para mapear nombre científico a speciesCode y nombre común
EBIRD_SCI_TO_INFO = {bird['sciName'].lower(): {
    'speciesCode': bird.get('speciesCode'),
    'comName': bird.get('comName')
} for bird in EBIRD_TAXONOMY}

def get_ebird_taxon_info(scientific_name_or_class):
    # Permite recibir el string completo de la clase predicha
    # y extraer correctamente el nombre científico incluso si hay sufijo de género
    parts = scientific_name_or_class.split("_")
    if parts[-1] in ["hembra", "macho"]:
        sci_name = "_".join(parts[-3:-1])
    else:
        sci_name = "_".join(parts[-2:])
    sci_name = sci_name.replace("_", " ")
    for bird in EBIRD_TAXONOMY:
        if bird.get("sciName", "").lower() == sci_name:
            return {
                "comName": bird.get("comName"),
                "sciName": bird.get("sciName"),
                "category": bird.get("category"),
                "order": bird.get("order"),
                "familyComName": bird.get("familyComName"),
                "familySciName": bird.get("familySciName"),
                "speciesCode": bird.get("speciesCode"),
            }
    return None

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró el archivo'}), 400

    file = request.files['file']
    try:
        image = Image.open(file.stream).convert('RGB')
    except UnidentifiedImageError:
        return jsonify({'error': 'El archivo no es una imagen válida o el formato no está soportado.'}), 400

    img_t = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(img_t)
        probabilities = torch.softmax(output, dim=1)
        max_prob, pred = torch.max(probabilities, 1)
        predicted_class_idx = pred.item()
        max_prob_value = max_prob.item()
        threshold = 0.65  # Puedes ajustar este valor

        if max_prob_value < threshold:
            predicted_class = "no se identifica ave"
            predicted_class_idx = -1
            ebird_info = None
        else:
            predicted_class = idx_to_class[predicted_class_idx]
            ebird_info = get_ebird_taxon_info(predicted_class)

    return jsonify({
        'class': predicted_class,
        'index': predicted_class_idx,
        'confidence': max_prob_value,
        'ebird_info': ebird_info
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)