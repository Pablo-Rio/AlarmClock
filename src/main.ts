import "./css/reset.scss";
import "./css/style.scss";

// Toggle commented out code to run alternate demo.
import Demo from "./Demo";
import Time from "./Time";
// import Demo from './Shader';

window.addEventListener("DOMContentLoaded", () => {
  const time = new Time();
  new Demo(time);
});
