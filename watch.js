const watch = require('watch')
const fs = require('fs')
counter = 1
watch.createMonitor('./', function (monitor) {
    monitor.files['./*.jpg'] // Stat object for my zshrc.
    monitor.on("created", function (f, stat) {
      // Handle new files
      let check = f.split('/')[0]
      if (check === 'portraits'){
      	// prevent copying a new file if it exists in the portraits folder
      } else {
      	 console.log(__dirname + '/portraits/4_' + counter + '.jpg', f, stat)

     	fs.rename(f, __dirname + '/portraits/4_' + counter + '.jpg', (err) => {
     		console.log(err)
     		counter++

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