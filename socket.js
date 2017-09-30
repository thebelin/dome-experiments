// modules
const async = require('async'),
  cv = require('opencv');

// camera properties
const camWidth = 320,
  camHeight = 240,
  camFps = 10,
  camInterval = 1000 / camFps;

// Set an object of routines to run on the captured data
const routines = {
  // Cascade (uses all the facial detection routines in a cascade until something is returned)
  cascade: {
    path: cv.FACE_CASCADE,
    rectColor: [0, 255, 0],
    rectThickness: 2,
  }
};

// initialize camera
const camera = new cv.VideoCapture(0);
camera.setWidth(camWidth);
camera.setHeight(camHeight);

// Call this with the socketio object for the app
module.exports = (socket) => {
  setInterval(() => {
    camera.read((err, im) => {
      if (err) throw err;
      if (im == null)
        throw "null image";
      
      // Object Holds the discovered metadata
      var face = {};

      // Run each of the detection routines specified
      Object.keys(routines).forEach(routine => async.waterfall([
        // Detect faces according to face detection routine at path  
        done => im.detectObject(routines[routine].path, {}, (err, faces) => {
          if (err) throw err;
          
          for (var i = 0; i < faces.length; i++) {
            face[routine] = faces[i];
            im.rectangle(
              [face[routine].x, face[routine].y],
              [face[routine].width, face[routine].height],
              routines[routine].rectColor,
              routines[routine].rectThickness);
          }
          done(null, im, face);
        }),

        // Emit the marked up image
        (im, face, done) =>
          socket.emit('frame', { buffer: im.toBuffer(), face: face })
      ]));
  })}, camInterval);
};
