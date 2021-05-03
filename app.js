import React from "react";
import ReactDOM from "react-dom";
import ReactLoading from "react-loading";
import { markdown } from "markdown";
const fs = require("fs");

import styles from "./styles.css";

import Joints from "./joints";
import GraphicsEngine from "./graphics";
import PoseNet from "./posenet";

/**
 * React Component for runnign neural networks and 3D graphics
 */
class App extends React.Component {
  /**
   * the class constructor
   * @param {args} props for the parent class
   */
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      webcam: true,
    };
  }

  /**
   * One of React's life cycle methods
   * Once the current React component is loaded, this function
   * initializes neural network model, graphics engine, and webcam.
   */
  async componentDidMount() {
    this.joints = new Joints();
    this.graphics_engine = new GraphicsEngine(this.refs.babylon, this.joints);
    this.posenet = new PoseNet(this.joints, this.graphics_engine, this.refs);
    const descContent = fs.readFileSync("./description.md", "utf-8");
    // this.refs.description.innerHTML = markdown.toHTML(descContent);
    await this.posenet.loadNetwork();
    this.setState({ loading: false });
    this.posenet.startPrediction().then((webcam) => {
      this.setState({ webcam });
    });
  }

  /** Asks for webcam access if ti was denied */
  askWebCam() {
    this.posenet.startPrediction();
  }

  /**
   * React Component's render method for rendering HTML components
   */
  render() {
    return (
      <div>
        <div style={{ display: "none" }}>
          <div style={{ display: this.state.loading ? "none" : "block" }}>
            <video ref="video" id="video" playsInline />
            <canvas
              ref="output"
              width={500}
              height={500}
              style={{ display: this.state.webcam ? "block" : "none" }}
            />
            {!this.state.webcam && (
              <WeCamAccess askForAccess={() => this.askWebCam()} />
            )}
          </div>
          <div
            id="loader"
            style={{ display: !this.state.loading ? "none" : "block" }}
          >
            <h3 id="loadTitle">Tensorflow Model loading ...</h3>
            <ReactLoading
              type="cylon"
              color="grey"
              height={"20%"}
              width={"20%"}
              id="reactLoader"
            />
          </div>
        </div>
        <canvas ref="babylon" style={{ width: "100vw", height: "100vh" }} />
      </div>
    );
  }
}

const WeCamAccess = ({ askForAccess }) => (
  <div id="webcamaccess" className="d-flex justify-content-center">
    <h3>The device does not have a webcam OR webcam access was denied</h3>
    <button onClick={askForAccess}>Grant Webcam Access</button>
  </div>
);

ReactDOM.render(<App />, document.getElementById("react-container"));
