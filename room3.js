// node packages
// const fs = require("fs");
const { exec, execSync, spawn } = require('child_process')
// const ensureDir = require('ensure-dir')
const args = require("really-simple-args")();

// const kill  = require('tree-kill');
//var NodeWebcam = require( "node-webcam" );
// const vorpal = require('vorpal')();
var open = require('mac-open');
const Jimp = require('jimp')
const prompts = require('prompts');
 const os = require('os')
 const quit = require('osx-quit')
const png2base64 = require('imgconversion');
 
const cron = require('node-cron');
const watch = require('watch')
const fs = require('fs')

// let artistIDs = 
// throw error in startup if not all flags have been set by user
function missingArg(arg){
  console.log('\n Error: program option missing ' + arg)
  process.exit()
}

const ws = require('ws')
const WebSocket = require('reconnecting-websocket');

const wsOptions = {
	WebSocket: ws, // custom WebSocket constructor
	connectionTimeout: 1000
	
};



// globals
var name;
let interval = 20000
let numIntervals = 6
var counter = 1;
var portraits = __dirname + '/portraits/'
// let Webcam

var artistArray = []
var record
var snapshot
let host;
let artstarArtistObject = {
  id: null,
  email: null,
  start: null,
  end: null,
  location: os.hostname(),
  portrait: null,
  portraitDate: null,
  filename: null,
  portraitIndex: null
}
let interviewImages = {
  /*
  "1": {
    filename: null,
    date: null
    }
  */
}
// let id;

/////////////////// NEW FILE WATCHER ///////////////////

watch.createMonitor('./', function (monitor) {
    monitor.files['./*.jpg'] // Stat object for my zshrc.
    monitor.on("created", function (f, stat) {
      // Handle new files
      let check = f.split('/')[0]
      if (check === 'portraits'){
      	// prevent copying a new file if it exists in the portraits folder
      } else {
      	thisCounter = counter - 1
      	 snapshot = portraits + artstarArtistObject.id + '_' + thisCounter + '.jpg'

      	 //console.log(snapshot)

     	fs.rename(f, snapshot, (err) => {
     		//console.log(err)

		   Jimp.read(snapshot)
		   .then(snap => {
		     return snap
		        .resize(256, 256) // resize
		        .quality(60) // set JPEG quality
		       .greyscale() // set greyscale
		       .write(snapshot); // save
		        
		   })
		   .catch(err => {
		     console.error(err);
		   });
		    //open(snapshot, { a: "Preview" }, function(error) {});



     	})
      }




    })
    monitor.on("changed", function (f, curr, prev) {
      // Handle file changes
    })
    monitor.on("removed", function (f, stat) {
      // Handle removed files
    })
    // monitor.stop(); // Stop watching
  })

/////////////////// INIT ////////////////

// get the length of interval between snapshots
if(args.hasParameter("interval")) {
  interval = args.getParameter("interval")*1000
  console.log('snapshot interval set to ' + args.getParameter("interval") + ' seconds')
} else{
  interval = 20000

  console.log('\nsnapshot interval set to default of 20 seconds')  
}

// get the number of intervals/snapshots
if(args.hasParameter("snapshots")) {
  numIntervals = args.getParameter("snapshots")
  console.log('snapshots set at ' + numIntervals)
} else{
  numIntervals = 6;

  console.log('\nnumber of snapshots/intervals set to default of 6') 
}

////////// webcam settings:
// function webcam(){
//   // Webcam Settings
//   const webcamOptions = {
//     //Picture related

//     width: 1920,
//     height: 1080,
//     quality: 100,

//     //Delay in seconds to take shot
//     //if the platform supports miliseconds
//     //use a float (0.1)
//     //Currently only on windows
//     delay: 0,

//     //Save shots in memory ////Michael: disabled bc am concerned about this memory use stacking up over 12 hour run. 
//     // saveShots: true,

//     // [jpeg, png] support varies
//     // Webcam.OutputTypes
//     output: "jpeg",

//     //Which camera to use
//     //Use Webcam.list() for results
//     //false for default device
//     device: false,

//     // [location, buffer, base64]
//     // Webcam.CallbackReturnTypes
//     callbackReturn: "location",

//     //Logging
//     verbose: false
//   };

//   Webcam = NodeWebcam.create( webcamOptions );
  
//   // Webcam.list( function( list ) {
//   //   console.log(list)
//   // })
// }


let client;

// set the server IP address
if(args.hasParameter("server")) {
  serverHost = args.getParameter("server")
  if (serverHost === 'local'){
    host = 'localhost:8082'
    client = new WebSocket('ws://' + host, [], wsOptions);
    console.log('interview program will try to connect to server at ws://localhost:8082')
    //webcam()
  } else if (serverHost = 'remote') {
    host = '192.168.0.185:8082'
    client = new WebSocket('ws://' + host, [], wsOptions); 
    console.log('interview program will try to connect to server at ws://192.168.0.102:8082')
    //webcam()
  } else {
    missingArg('incorrect -server argument: accepts either "remote" (for artstar performance) or "local" (for developer or testing)')
    
    }
  }
 else {
  missingArg('-server flag\n\nset to either:\n-server remote (for artstar performance)\nor\n-server local (for developer or testing)')
  
}

client.addEventListener('open', () => {
	console.log('ws connected to ' + host + '\n\n\n\n')

  client.send(JSON.stringify({
		date: Date.now(),
		data: os.hostname(),
		cmd: 'regCreatorMachine'
  }));
  
  startInterview()

});
 
client.addEventListener('message', event => {
  console.log(`Message from server: ${event.data}`);
});

client.addEventListener('close', () => {
	console.log('ws closed')

});

function reset(){

}





// // get the performer's id
// if(args.hasParameter("id")) {
//   id = args.getParameter("id")
//   console.log('id set to ' + id)
//   // if a folder doesn't yet exist for the performer's name, add it (in the future, we'll need something more unique than a name. this is where an email address is probably better)
//   // ensureDir(portraits + '/' + id).then(() => {
//   // })
// } else{
//   missingArg('-id performer ID must be provided & no spaces!\ni.e.\n\nnode artstar.js -id 24')  
// }

// // get the performer's name
// if(args.hasParameter("email")) {
//   email = args.getParameter("email")
//   console.log('email set to ' + email)
//   // if a folder doesn't yet exist for the performer's name, add it (in the future, we'll need something more unique than a name. this is where an email address is probably better)
  
// } else{
//   console.log('no email address provided')  
// }
// var job = new cron.CronJob('*/5 * * * *', function() {
// 	console.log('Function executed!');
// }, null, false);

var task = cron.schedule('*/' + args.getParameter("interval") + ' * * * * *', () =>  {
  console.log(cron, '\n\n\n', '*/' + args.getParameter("interval") + ' * * * * *')
  console.log(counter)
  if(counter > numIntervals){
    task.stop()
    console.log('interview over, order the coffee table book')
    console.log(interviewImages)

    Object.keys(interviewImages).forEach(function(key) {
      var val = interviewImages[key].filename;
      // open(val, { a: "Preview" }, function(error) {
      // });

    });
    //open(snapshot, { a: "Preview" }, function(error) {});
    selectPortrait()
  } else {
    takePortrait()


    counter++

    
  }

}, {
  scheduled: false
});
 

function startInterview(){
  quit('Preview').then(() => { 
  });
  artstarArtistObject.start = Date.now()
  counter = 1
  interviewImages = {}
  const questions = [
    {
      type: 'number',
      name: 'id',
      message: 'Enter the artist\'s ID #'
    },
    {
      type: 'text',
      name: 'email',
      message: 'Enter their email address (optional)'
    }
  ];
   
  (async () => {
    const response = await prompts(questions);
    if (response.id){
      artstarArtistObject.id = response.id
    } else {
      artstarArtistObject.id = null
      // throw error
      return startInterview()
    }
    if (response.email){
      artstarArtistObject.email = response.email
    } else {
      artstarArtistObject.email = null
    }
    // artstarArtistObject = {
    //   id: null,
    //   email: null,
    //   start: null,
    //   end: null,
    //   location: os.hostname(),
    //   portrait: null,
    //   portraitDate: null
    // }
    console.log(artstarArtistObject)
    task.start();
    })();
}

function takePortrait(){
  /////////////// Sound recorder ///////////////////////
  // recordingFile = portraits + '/' + name + '/' + Date.now() + '.mp3'
  snapshot = portraits + artstarArtistObject.id + '_' + counter + '.jpeg'
  
  console.log(snapshot)
  // snapshot =  artstarArtistObject.id + '_' + counter + '.jpeg'
  interviewImages[counter] = {
    filename: snapshot,
    date: Date.now()
  }

  // // start recording audio
  // record = spawn('sox', ['-d', recordingFile]);
  // console.log('started recording ' + recordingFile)
  // take a photo
  // Webcam.capture( snapshot, function( err, data ) {
    exec('./imagesnap -d "HD Pro Webcam C920" ' + snapshot, (stdout,stderr,err) =>{
      console.log('captured snapshot ' + snapshot, 'converting to greyscale...')
      console.log('\n\n', stdout, '\n\n', stderr, '\n\n', err)

    artistArray.push(snapshot)
    //open(snapshot, { a: "Preview" }, function(error) {});
  });

}




function selectPortrait(){
  const questions = [
    {
      type: 'number',
      name: 'portraitNumber',
      message: 'enter the portrait number (just the number after the _ symbol)'
    },
    {
      type: 'text',
      name: 'title',
      message: 'enter a title for the portrait'
    }
    // {
    //   type: 'text',
    //   name: 'email',
    //   message: 'Enter their email address (optional)'
    // }
  ];
   
  (async () => {
    const response = await prompts(questions);
    if (!response.portraitNumber){
      console.log('error: enter a portrait number')

      return selectPortrait()
    } else if (response.portraitNumber > numIntervals){
      console.log('error: portrait number does not exist')
      // throw error
      return selectPortrait()
    } else {
      //console.log(interviewImages[response.portraitNumber])
      artstarArtistObject.portraitIndex = response.portraitNumber
      //artstarArtistObject.filename = interviewImages[response.portraitNumber].filename
      artstarArtistObject.portraitDate = interviewImages[response.portraitNumber].date
      artstarArtistObject.title = response.title
      artstarArtistObject.end = Date.now()
      console.log(artstarArtistObject, '\n\nsent artist profile and portrait to artstar leaderboard\n.\n.\n.\n.\n\n');

      artstarArtistObject.portrait = png2base64.imgtobase64(interviewImages[response.portraitNumber].filename);
      

          client.send(JSON.stringify({
            cmd:'newStar',
            data: artstarArtistObject,
            date: Date.now()
          }))
          startInterview()
    
        
          // artistObject = { portrait: portrait64, quote: quote, fileID: fileID, artistNN: artistNN }
          // newStar

      

      // artstarArtistObject.portrait = 
      //  = {
      //   id: null,
      //   email: null,
      //   start: null,
      //   end: null,
      //   location: os.hostname(),
      //   portrait: null,
      //   portraitDate: null
      // }

    }
    // artstarArtistObject = {
    //   id: null,
    //   email: null,
    //   start: null,
    //   end: null,
    //   location: os.hostname(),
    //   portrait: null,
    //   portraitDate: null
    // }
    // console.log(artstarArtistObject)
    // task.start();
    })();
}

// function getTitle(){

  
// }


 //////////////// TO DO USE CRON IN NODE TO RUN THE SNAPSHOT TIMER, THIS WAY YOU CAN START AND STOP THE TIMER AND USE THE PROMPT TO ASK FOR THE PHOTO UTC AND SEND TO WS SERVER
 
/*

// Run this at each snapshot interval
setTimeout(function run() {
  // // stop recording the previous audio file
  // console.log('ended recording ' + recordingFile)
  // kill(record.pid);

  // update file name with current UTC stamp
  utc = Date.now()
  // // update audio filename
  // recordingFile = portraits + '/' + name + '/' + fileName + '.mp3'
  // // start recording next audio file
  // record = spawn('sox', ['-d', recordingFile]);
  // console.log('started recording ' + recordingFile)
  // update photo filename
  snapshot = portraits + id + '_' + utc + '.jpeg'
  // take the photo
  Webcam.capture( snapshot, function( err, data ) {
    console.log('captured snapshot ' + snapshot, 'converting to greyscale...')
    // Open portrait with preview
    Jimp.read(snapshot)
    .then(snap => {
      return snap
        // .resize(256, 256) // resize
        // .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(snapshot); // save
        
    })
    .catch(err => {
      console.error(err);
    })
    artistArray.push(snapshot)

    //open(snapshot, { a: "Preview" }, function(error) {});
  });
  // increase the threshold counter
  counter++
  // stop the script if numIntervals reached
  if(counter >= numIntervals){
    // kill(record.pid);
    console.log('artstar interview completed. order the coffee table book')
    
    // before process.exit(), open all 6 photos in finder. Then when they know the number they want, print the photo and then return to this script and, using vorpal, enter the number in to send the portrait to the master laptop. 
    // vorpal
    //   .command(portraitNumber, 'Outputs "bar".')
    //   .action(function(args, callback) {
    //     this.log('bar');
    //     callback();
    // });
  
    // vorpal
    //   .delimiter('myapp$')
    //   .show();
    for(i = 0; i === artistArray.length; i++){
      open(artistArray[i], { a: "Preview" }, function(error) {});

    }
    console.log(artistArray)
      process.exit();
  }
  setTimeout(run, interval);
}, interval)
 
 
 
*/