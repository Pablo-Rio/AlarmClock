import "./css/reset.scss";
import "./css/style.scss";

// Toggle commented out code to run alternate demo.
import App from "./App";
import Time from "./Time";
// import Demo from './Shader';

window.addEventListener("DOMContentLoaded", () => {
  const time = new Time();
  new App(time);
});
