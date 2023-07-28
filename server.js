'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const helmet            = require('helmet');

const app = express();

app.use(helmet());

// Configure Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],              // Allow only resources from the same origin
      scriptSrc: ["'self'"],               // Allow only scripts from the same origin
      styleSrc: ["'self'"],                // Allow only styles from the same origin
      imgSrc: ["'self'"],                  // Allow only images from the same origin
      objectSrc: ["'none'"],               // Don't allow loading of any objects (e.g., Flash)
      fontSrc: ["'self'"],                 // Allow only fonts from the same origin
      mediaSrc: ["'self'"],                // Allow only media (audio/video) from the same origin
      frameSrc: ["'none'"],                // Don't allow loading of any frames/iframes
      connectSrc: ["'self'"],              // Allow only connections to the same origin
      childSrc: ["'self'"],                // Allow only sources for worker, embedded iframe, or similar content
      formAction: ["'self'"],              // Allow only form submissions to the same origin
      frameAncestors: ["'none'"],          // Don't allow embedding in frames/iframes
    },
  })
);


app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
