const Discord = require('discord.js')
const ytdl = require('ytdl-core')
var search = require('youtube-search')
const streamOptions = { seek: 0, volume: 1 }

var bot = new Discord.Client()

bot.on('ready', function () {
  console.log(
    'TriForce-Music Logged in! Serving in ' + bot.guilds.array().length + ' servers'
  )
})

var opts = {
  maxResults: 1,
  key: 'AIzaSyBNasg0yGmWJB-LRYv5v4lW5X4ORcYHvYY'
}

bot.on('message', msg => {
  // MSG PARTS
  var msgParts = msg.content.split(' '),
    command = msgParts[0].toLowerCase(),
    parameters = msgParts.splice(1, msgParts.length)
  if (msg.guild) { 								// MUSIC BOT COMMANDS
    if (command === 'fjoin') {
      if (msg.member.voiceChannel) {
        msg.member.voiceChannel.join()
          .then(connection => {
            msg.reply('Connected to **' + msg.member.voiceChannel.name + '**!')
          })
          .catch(console.log)
      } else {
        msg.reply('You need to join a voice channel first!')
      }
    }
    if (command === 'fleave') {
      if (msg.member.voiceChannel) {
        msg.reply('Disconnected from **' + msg.member.voiceChannel.name + '**!')
        msg.member.voiceChannel.leave()
      }
    }
    if (command === 'fplay') {
      if (parameters[0] && parameters[0].startsWith('http')) {
        msg.member.voiceChannel.join()
          .then(connection => {
            msg.channel.send('Playing! :notes:')
            const stream = ytdl(parameters[0], { filter: 'audioonly' })
            const dispatcher = connection.playStream(stream, streamOptions)
          })
          .catch(console.error)
      } else {
        if (parameters[0]) {
          search(msg.content.replace('fplay ', ''), opts, function (err, results) {
            if (err) return msg.reply("Couldn't find that song on YouTube!")
            msg.member.voiceChannel.join()
              .then(connection => {
                msg.channel.send('Playing **' + results[0].title + '**! :notes: `Link: ' + results[0].link + '`')
                const stream = ytdl(results[0].link, { filter: 'audioonly' })
                const dispatcher = connection.playStream(stream, streamOptions)
              })
              .catch(console.error)
          })
        }
      }
    }
    if (command === 'fmusicreboot') {
      msg.reply('Rebooting Music Module!')
      setTimeout(function () { process.exit() }, 250)
    }
  }
})

bot.login('NDgzNjA2ODM4MDg5MjIwMDk2.DmV6Uw.6CUW744zT_yQlqlOmiZOuB8Xuok')
