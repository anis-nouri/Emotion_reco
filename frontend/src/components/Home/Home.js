import React from "react";
import { Container, Row, Col , Button} from "react-bootstrap";
import homeLogo from "../../Assets/home-main.svg";
import { Link } from "react-router-dom";

const Home = () => {
  const handlePredictClick = () => {
    // Redirect to another URL
    window.location.href = '/Camera';
  };

  return (
    <section>
      <Container fluid className="home-section" id="home">
        <Container className="home-content">
          <Row>
            <Col md={7} className="home-header">
              <h1 style={{ paddingBottom: 15 }} className="heading">
                Welcome to The Emotion Recognition App{" "}
                <span className="wave" role="img" aria-labelledby="wave">
                  👋🏻
                </span>
              </h1>

              <h1 className="heading-name" style={{ color: '#c770f0' }}>
                Understand emotions like never before.
              </h1>

             
            </Col>

            <Col md={5} style={{ paddingBottom: 20 }}>
              <img
                src={homeLogo}
                alt="home pic"
                className="img-fluid"
                style={{ maxHeight: "450px" }}
              />
            </Col>
          </Row>
        </Container>
        
      </Container>  
      <Button variant="primary" style={{ marginTop: "10px" }} onClick={handlePredictClick} > Click To Predict Your Emotion </Button>

    </section>
  );
}

export default Home;
