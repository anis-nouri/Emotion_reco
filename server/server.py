from flask import Flask, request
from flask_cors import CORS 
import base64
from PIL import Image
from io import BytesIO
import timm 
import torch
from torch import nn 
from torchvision import transforms
import matplotlib.pyplot as plt
import torch.nn.functional as F



app = Flask(__name__)
CORS(app)

class ResNetModel(nn.Module):
    def __init__(self):
        super(ResNetModel, self).__init__()
        self.eff_net = timm.create_model('resnet34', pretrained=True, num_classes=7)
    
    def forward(self, images, labels=None):
        logits = self.eff_net(images)
        if labels is not None:
            loss = nn.CrossEntropyLoss()(logits, labels)
            return logits, loss
        return logits

model = ResNetModel()

# Load weights from a file
weights_path = 'resnet-weights.pt'
state_dict = torch.load(weights_path,map_location=torch.device('cpu'))
model.load_state_dict(state_dict)

def preprocess_image(image):
    transform = transforms.Compose([
        transforms.Resize((48, 48)),
        transforms.Grayscale(num_output_channels=3),  # Convert to RGB
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485], std=[0.229]),
    ])
    image = transform(image)
    image = image.unsqueeze(0)  # Add batch dimension
    return image

@app.route('/predict', methods=['POST'])
def upload_image():
    try:
        # Access form data from the request
        image = request.form.get('image')  
        base64_data = image.split(",")[1]  
        image = Image.open(BytesIO(base64.b64decode(base64_data)))
        grayscale_image = image.convert('L')
        # Save the grayscale image to a temporary file
        temp_filename = 'temp_grayscale_image.png'
        grayscale_image.save(temp_filename)

        preprocessed_image = preprocess_image(grayscale_image)
        
         # Make predictions using the model
        model.eval()
        with torch.no_grad():
            logits = model(preprocessed_image)

        probabilities = F.softmax(logits, dim=1)


        # Process logits as needed
        predicted_class = torch.argmax(logits).item()
        predicted_probability = probabilities[0, predicted_class].item() * 100 

        # Return prediction results or any relevant information

        return {"prediction": predicted_class, "probability":predicted_probability, "success": True}
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    app.run(debug=True)
