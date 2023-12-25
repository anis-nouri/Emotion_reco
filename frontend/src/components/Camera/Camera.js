import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import Particle from "../Particle";

function Camera() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isCameraPaused, setIsCameraPaused] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    initCamera();
  }, []);

  const handlePredictClick = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (videoElement && canvasElement) {
      // Draw the current frame from the video onto the canvas
      const context = canvasElement.getContext("2d");
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      // Pause the video to freeze the current frame
      videoElement.pause();
      setIsCameraPaused(true);

      // Get the image data from the canvas
      const imageData = canvasElement.toDataURL("image/png");

      // Send the image data to the backend (you need to implement this part)
      sendImageToBackend(imageData);
    }
  };

  const handleRetakeClick = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const predictionDiv = document.getElementById('predictionDiv');


    if (videoElement && canvasElement && predictionDiv) {
      // Resume the video stream
      videoElement.play();
      setIsCameraPaused(false);
      predictionDiv.innerHTML = '';
    }
  };

  const sendImageToBackend = (imageData) => {
    // Create a FormData object to send the image file
    const formData = new FormData();
    formData.append('image', imageData);
  
    // Make a POST request to the Flask endpoint
    fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.text())
      .then(message => {
        // Handle the response from the server
        console.log('Server response:', message);
        
        const emotionMapping = {
          0: ' 😡 Angry',
          1: ' 😷 Disgust',
          2: ' 😨 Fear',
          3: ' 😊 Happy',
          4: ' 😐 Neutral',
          5: ' 😢 Sad',
          6: ' 😲 Surprise',
        };

        const predictionDiv = document.getElementById('predictionDiv');
        if (predictionDiv) {
          // Assume 'message' contains the numerical prediction
          const jsonResponse = JSON.parse(message);
  
          if (jsonResponse.success) {
            const numericalPrediction = jsonResponse.prediction;
            const predictedEmotion = emotionMapping[numericalPrediction];
  
            // Display the predicted emotion inside the predictionDiv
            predictionDiv.innerHTML += `<p style="color: #fff; text-align: center; font-size: 18px;">Prediction: <strong> <br>${predictedEmotion}</strong></p>`;
          } else {
            // Handle the case when success is false
            console.error('Prediction failed:', jsonResponse.error);
          }
        }
      })
      .catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Error sending image data:', error);
      });
  };
  

  return (
    <Container fluid className="project-section">
      <Container>
        <h1 className="project-heading">
         <strong className="purple">Curious about your digital mood?</strong>
        </h1>
        <p style={{ color: "white" }}>
         click, predict, and let's turn those pixels into emotions! Click to unveil the vibe. 📸😊</p>
        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          <Col md={8} className="project-card">
            {/* Container for the video with a box on the right */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <video
                ref={videoRef}
                width="75%"
                height="auto"
                autoPlay
                playsInline
                muted
                id="cameraFeed"
                style={{ border: "2px solid #fff", borderRadius: "8px" }}
              />

              {/* Box on the right */}
              <div
                style={{
                  width: "20%", // Adjust width as needed
                  backgroundColor: "#333",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <p style={{ color: "#fff", textAlign: "center" }}>Prediction</p>
                &nbsp;
                &nbsp;
                <div id="predictionDiv">
 
                  </div>

                {isCameraPaused ? (
                  <Button
                    variant="success"
                    onClick={handleRetakeClick}
                    style={{ marginTop: "10px" }}
                  >
                    Retake
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handlePredictClick}
                    style={{ marginTop: "10px" }}
                  >
                    Predict
                  </Button>
                  
                )}
              </div>
            </div>
          </Col>
        </Row>
        {/* Canvas element for capturing video frame */}
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </Container>
    </Container>
  );
}

export default Camera;
