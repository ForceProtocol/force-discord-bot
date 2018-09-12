const Discord = require('discord.js')
const fs = require('fs')
const ytdl = require('ytdl-core')
const streamOptions = { seek: 0, volume: 1 }

const RapidAPI = new require('rapidapi-connect')
const rapid = new RapidAPI('triforce_tokens_5b904292e4b005bfb67b04c1', '8d97b53e-40bb-496c-8788-1df23c137c00')

var bot = new Discord.Client()

bot.on('ready', function () {
  console.log(
    'TriForce Bot Logged in! Serving in ' + bot.guilds.array().length + ' servers'
  )
  bot.user.setActivity('Intialized!')
  var text = ['TriForce <3', 'TriForce <33', 'TriForce <333', 'TriForce <33']
  var counter = 0
  setInterval(change, 15000)

  function change () {
    bot.user.setActivity(text[counter])
    counter++
    if (counter >= text.length) {
      counter = 0
    }
  }
})

// DATABASE INFORMATION
var dataStorageLocation = 'C:/Users/Administrator/Concord_Services/FORCE-Bot/users/' /* Location of the User-Account DB, very important */

var fiatValue = 0.15

// INVITE BOUNTY
var bountyLength = 604800 // In Seconds
var bountyCheckInterval = 30000 // Milliseconds

var timestamp

function checkBounty () {
  if (lastMsg && lastMsg.guild) {
    lastMsg.guild.fetchInvites().then(invites => lastInvites = invites.array()).catch(console.error)
    console.log('Invite synced successfully, Now reading ' + lastInvites.length + ' in-memory invites')
  }
  fs.readFile('bounty.txt', 'utf8', function (err, contents) {
    if (!err && timestamp !== undefined && lastMsg) {
      var bountyTimestamp = Number(contents)
      if (bountyTimestamp < timestamp) {
        fs.writeFile('bounty.txt', 'none', function (err) {
          if (!err) {
            lastMsg.guild.fetchInvites().then(invites => gatherLeaderboard(lastMsg, invites.array())).catch(console.error)
            setTimeout(function () {
              var channelDebug = lastMsg.guild.channels.find(ch => ch.name === 'bot-testing')
              var channelAnnounce = lastMsg.guild.channels.find(ch => ch.name === '🎁-invite-bounty-🎁')
              const embed = {
                'color': 3144381,
                'footer': {
                  'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                  'text': 'The TriForce Tokens Bot - Invitation and Referral System'
                },
                'author': {
                  'name': 'TriForce Invite Bounty has ended!'
                },
                'fields': [{
                  'name': "This bounty's 5 winners are:",
                  'value': '**1.** <@' + lastInvitesLeaderboard[0].id + '> - **Prize:** 100 FORCE\n**2.** <@' + lastInvitesLeaderboard[1].id + '> - **Prize:** 50 FORCE\n**3.** <@' + lastInvitesLeaderboard[2].id + '> - **Prize:** 25 FORCE\n**4.** <@' + lastInvitesLeaderboard[3].id + '> - **Prize:** 15 FORCE\n**5.** <@' + lastInvitesLeaderboard[4].id + '> - **Prize:** 10 FORCE\n\n__Rewards are being distributed!__',
                  'inline': false
                }]
              }
              setTimeout(function () { channelDebug.send('ftip <@' + lastInvitesLeaderboard[0].id + '> 100'); removeInvites(lastInvitesLeaderboard[0].id, lastInvitesLeaderboard[0].invites) }, 2000)
              setTimeout(function () { channelDebug.send('ftip <@' + lastInvitesLeaderboard[1].id + '> 50'); removeInvites(lastInvitesLeaderboard[1].id, lastInvitesLeaderboard[1].invites) }, 4000)
              setTimeout(function () { channelDebug.send('ftip <@' + lastInvitesLeaderboard[2].id + '> 25'); removeInvites(lastInvitesLeaderboard[2].id, lastInvitesLeaderboard[2].invites) }, 6000)
              setTimeout(function () { channelDebug.send('ftip <@' + lastInvitesLeaderboard[3].id + '> 15'); removeInvites(lastInvitesLeaderboard[3].id, lastInvitesLeaderboard[3].invites) }, 8000)
              setTimeout(function () { channelDebug.send('ftip <@' + lastInvitesLeaderboard[4].id + '> 10'); removeInvites(lastInvitesLeaderboard[4].id, lastInvitesLeaderboard[4].invites) }, 10000)
              setTimeout(function () { channelDebug.send('**__Invite Bounty Payments are complete!__**\nUse `fbountystart` to start a new bounty') }, 12000)
              setTimeout(function () { channelAnnounce.send('**__Invite Bounty Payments are complete!__**\nUse command `fbal` to check your earnings!') }, 12000)
              channelAnnounce.send({ embed })
            }, 5000)
          } else {
            console.log('DB-ERROR: ' + err)
          }
        })
      }
    }
  })
}

function removeInvites (id, invites) {
  fs.readFile(dataStorageLocation + id + '.txt', 'utf8', function (err, data) {
    if (!err) {
      var userData = data.split('::::')
      if (userData[2]) {
        var userInvs = Number(userData[2].replace('invitesRemoved:', ''))
        var removedInvs = 0
        if (invites === 'all') {
          removedInvs = userInvs
        } else {
          removedInvs = invites
          userInvs += invites
        }
        if (userInvs !== undefined && userInvs !== NaN) {
          userData[2] = 'invitesRemoved:' + userInvs.toString()
          fs.writeFile(dataStorageLocation + id + '.txt', userData.join('::::'), function (err) {
            if (!err) {
              var channelLog = lastMsg.guild.channels.find(ch => ch.name === 'triforce-bot-server-log')
              channelLog.send('Deducted **' + removedInvs.toString() + '** from account **' + id + '**')
            }
          })
        }
      }
    }
  })
}

bot.on('guildMemberAdd', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'welcome-channel👋🏼')
  const channelDebug = member.guild.channels.find(ch => ch.name === 'triforce-bot-server-log')
  const channelTesting = member.guild.channels.find(ch => ch.name === 'bot-testing')
  if (member.guild.name === 'TriForce Tokens™') {
    if (member.user.username.toLowerCase().includes('webchain')) {
      channelTesting.send('Automatically Banned **' + member.guild.username + '**')
      member.ban()
      return
    }
  }
  member.addRole('477842664755298306')
  if (!channel || member.guild.name !== 'TriForce Tokens™') return
  member.guild.fetchInvites().then(invites => checkJoinedInvites(member, channelDebug, channel, invites.array())).catch(console.error)
})

bot.on('guildMemberRemove', member => {
  const channel = member.guild.channels.find(ch => ch.name === 'bye-bitch')
  const channelDebug = member.guild.channels.find(ch => ch.name === 'triforce-bot-server-log')
  if (!channel || member.guild.name !== 'TriForce Tokens™') return
  member.guild.fetchInvites().then(invites => checkLeftInvites(member, channelDebug, channel, invites.array())).catch(console.error)
  channel.send('**' + member.user.username + '** left 👋🏻')
})

var lastInvites = undefined

function checkLeftInvites (member, channelDebug, channel, invites) {
  channelDebug.send("User '" + member.user.username + "' has left, scanning Database for Inviter")
  fs.readFile(dataStorageLocation + member.user.id + '.txt', 'utf8', function (err, data) {
    if (!err) {
      var userData = data.split('::::')
      if (userData[3]) {
        var inviter = userData[3].replace('inviter:', '')
        console.log('Inviter: ' + inviter)
        if (inviter !== 'none') {
          console.log('Inviter passed')
          fs.readFile(dataStorageLocation + inviter + '.txt', 'utf8', function (err, data) {
            if (!err) {
              userData = data.split('::::')
              if (userData[2]) {
                var removedInvites = Number(userData[2].replace('invitesRemoved:', ''))
                console.log('removedInvites = ' + removedInvites)
                removedInvites++
                if (removedInvites > 0) {
                  var contentz = data.replace(userData[2], 'invitesRemoved:' + removedInvites.toString())
                  fs.writeFile(dataStorageLocation + inviter + '.txt', contentz, function (err) {
                    if (!err) {
                      channelDebug.send('Invite removed from ' + userData[0] + "'s database account because **" + member.user.username + '** left')
                    } else {
                      console.log(err)
                    }
                  })
                } else {
                  console.log('err - invitesRemoved = ' + removedInvites)
                }
              }
            } else {
              channelDebug.send(err)
              console.log(err)
            }
          })
        } else {
          channelDebug.send("'" + member.user.username + "' joined before i started tracking joins, so i cannot find their Inviter/Referrer")
        }
      } else {
        channelDebug.send("'" + member.user.username + "' doesn't have an eligible Database Account, so i cannot find their Inviter/Referrer")
      }
    } else {
      channelDebug.send("'" + member.user.username + "' doesn't have a Database Account, so i cannot find their Inviter/Referrer")
      console.log(err)
    }
  })
}
function checkJoinedInvites (member, channelDebug, channel, invites) {
  channelDebug.send('Scanning ' + invites.length + '/' + lastInvites.length + ' Invites for **' + member.user.username + "**'s inviter...")
  let i,
    len = invites.length
  for (i = 0; i < len; i++) {
    if (lastInvites[i]) {
      if (invites[i].uses > lastInvites[i].uses) {
        writeInviter(member, channelDebug, channel, invites[i].inviter)
        lastInvites = invites
      }
    }
  }
}

function writeInviter (member, channelDebug, channel, inviter) {
  setTimeout(function () {
    fs.readFile(dataStorageLocation + member.user.id + '.txt', 'utf8', function (err, data) {
      if (!err) {
        var contentz = data.replace('inviter:none', 'inviter:' + inviter.id)
        fs.writeFile(dataStorageLocation + member.user.id + '.txt', contentz, function (err) {
          channelDebug.send('Inviter added to **' + member.user.username + "**'s database account: " + inviter.id + ' (' + inviter.username + ')')
          fs.readFile(dataStorageLocation + inviter.id + '.txt', 'utf8', function (err, data) {
            if (!err) {
              var userData = data.split('::::')
              member.guild.fetchInvites().then(invites => sendJoinMsg(member, channel, userData, invites.array())).catch(console.error)
            } else {
              channelDebug.send('**' + inviter.username + "** doesn't have a Database account, skipping database edit, invite-tracking and welcoming " + member.user)
              channel.send('Hey <@' + member.user.id + '>! Welcome to **' + member.guild.name + '**!')
            }
          })
        })
      } else {
        channelDebug.send("Couldn't generate **" + member.user.username + "**'s Account within tracking-time, skipping tracking and welcoming user")
        channel.send('Hey <@' + member.user.id + '>! Welcome to **' + member.guild.name + '**!')
      }
    })
  }, 15)
}

function sendJoinMsg (member, channel, userData, invites) {
  var i
  var len = invites.length
  var invitesNum = 0
  var inviterName
  for (i = 0; i < len; i++) {
    if (invites[i] && invites[i].inviter && invites[i].inviter.id == userData[0]) {
      invitesNum += invites[i].uses
      inviterName = invites[i].inviter.username
    }
  }
  setTimeout(function () {
    var removedInvites = Number(userData[2].replace('invitesRemoved:', ''))
    var validInvites = invitesNum - removedInvites
    var invMsg = ''
    if (validInvites > 0 && inviterName && inviterName !== undefined) {
      invMsg = ' - Invited by **' + inviterName + '** (**' + validInvites.toString() + '** Invites)'
    }
    channel.send('Hey <@' + member.user.id + '>! Welcome to **' + member.guild.name + '**!' + invMsg)
  }, 5)
}

var lastMsg,
  activeUsers = [],
  isRaining = 0

bot.on('message', msg => {
  // MSG PARTS
  if (msg.guild && msg.guild.name === 'TriForce Tokens™') {
    var channelDebug = msg.guild.channels.find(ch => ch.name === 'triforce-bot-server-log')
    if (lastMsg === undefined) {
      setInterval(checkBounty, bountyCheckInterval)
      setInterval(function () {
        var botChannel = lastMsg.guild.channels.find(ch => ch.name === 'bot-spam👍🏼')
        botChannel.send('**Sending Auto-Rain!** - Next will be in 3 hours')
        var variableRain = activeUsers.length * 0.025
        variableRain += 0.5
        if (variableRain > 1) {
          variableRain = 1
        }
        botChannel.send('frain ' + variableRain.toFixed(2))
      }, 10800000) // 3 Hours between auto-rains
      channelDebug.send('Bounty Tracking activated on **' + msg.author.username + "**'s message being loaded into memory first, checking bounty conditions on a **" + bountyCheckInterval.toString() + 'ms** interval, current bounty length is **' + bountyLength.toString() + ' seconds**')
    }
    lastMsg = msg
  }
  var msgParts = msg.content.split(' '),
    command = msgParts[0].toLowerCase(),
    parameters = msgParts.splice(1, msgParts.length)

  // USER INFORMATION
  var username = msg.author.username,
    userID = msg.author.id,
    balance = undefined,
    userData = []

  timestamp = Number((new Date().getTime() / 1000).toFixed(0))

  if (lastInvites === undefined) {
    msg.guild.fetchInvites().then(invites => lastInvites = invites.array()).catch(console.error)
    console.log('lastInvites saved!')
  }

  fs.readFile(dataStorageLocation + userID + '.txt', 'utf8', function (err, data) {
    if (err) {
      fs.writeFile(dataStorageLocation + userID + '.txt', userID + '::::bal:0::::invitesRemoved:0::::inviter:none', function (err) {
        if (err) {
          msg.reply('Database error - Please alert Developer immediately')
        } else {
          console.log('Database Account created for ' + msg.author.username + ' at ' + new Date())
          userData = [userID, 'bal:0', 'invitesRemoved:0']
          balance = Number(userData[1].replace('bal:', ''))
        }
      })
    } else {
      userData = data.split('::::')
      balance = Number(userData[1].replace('bal:', ''))
      if (userData.length !== 4) {									// VERY IMPORTANT LINE DURING DATABASE UPGRADES, REMEMBER TO INCREMENT THIS ON UPDATES!!!
        if (userData.length === 2) {
          userData.push('invitesRemoved:0')
          fs.writeFile(dataStorageLocation + userID + '.txt', userID + '::::' + userData[1] + '::::' + userData[2], function (err) {
            if (err) {
              msg.reply('Database error - Please alert Developer immediately')
            } else {
              console.log('Database Account UPGRADED for ' + msg.author.username + ' at ' + new Date())
            }
          })
        }
        if (userData.length === 3) {
          userData.push('inviter:none')
          fs.writeFile(dataStorageLocation + userID + '.txt', userID + '::::' + userData[1] + '::::' + userData[2] + '::::' + userData[3], function (err) {
            if (err) {
              msg.reply('Database error - Please alert Developer immediately')
            } else {
              console.log('Database Account UPGRADED for ' + msg.author.username + ' at ' + new Date())
            }
          })
        }
      }
    }
  })
  setTimeout(function () {
    // ACTIVITY TRACKING && Rains
    var ia,
      isInList = 0,
      activeLength = activeUsers.length
    for (ia = 0; ia < activeLength; ia++) {
      if (activeUsers[ia] === msg.author) {
        isInList = 1
      }
    }
    setTimeout(function () {
      if (isInList === 0 && msg.author.bot === false) {
        activeUsers.push(msg.author)
      }
    }, 20)

    if (command === 'factiveusers') {
      if (parameters[0]) {
        if (parameters[0] === 'advanced' || parameters[0] === 'adv') {
          var variableRain = activeUsers.length * 0.025
          variableRain += 0.5
          if (variableRain > 1) {
            variableRain = 1
          }
          msg.channel.send('There are **' + activeUsers.length.toString() + '** active TriForce users, with the Variable Auto-rain currently being **' + variableRain.toFixed(2) + '** FORCE')
          for (var i = 0; i < activeUsers.length; i++) {
            var displayI = i + 1
            if (activeUsers[i]) {
              msg.channel.send('Active TriForce user ' + displayI.toString() + ': ' + activeUsers[i].username)
            }
          }
        }
      } else {
        var variableRain = activeUsers.length * 0.025
        variableRain += 0.5
        if (variableRain > 1) {
          variableRain = 1
        }
        msg.channel.send('There are **' + activeUsers.length.toString() + '** active TriForce users, with the Variable Auto-rain currently being **' + variableRain.toFixed(2) + '** FORCE')
      }
  	}
    if (command === 'frain') {
      if (parameters[0] && Number(parameters[0]) >= 0.1) {
        if (balance >= Number(parameters[0])) {
          if (isRaining === 0) {
            var ir = 0,
              irLength = activeUsers.length,
              rainMsg = msg,
              rainData = userData,
              rainAmount = (Number(parameters[0]) / irLength),
              rainBalance = balance + rainAmount
            isRaining = 1
            msg.channel.send('Raining **' + rainAmount.toFixed(4) + ' FORCE** ($' + (rainAmount * fiatValue).toFixed(4) + ') to **' + irLength.toString() + '** Active TriForce Members!\n(' + activeUsers + ')')
            var queue = setInterval(function () {
              var timeTillTransaction = ir * 500
              if (activeUsers[ir]) {
                sendFunds(rainMsg, rainMsg.author.id, activeUsers[ir].id, rainAmount, rainData, rainBalance, 'rain')
                rainBalance -= rainAmount
                ir++
              } else {
                clearInterval(queue)
                msg.channel.send('Rain Finished!')
                isRaining = 0
              }
            }, 500)
          } else {
            msg.reply('A rain is already in progress! Please wait for the `Rain Finished!` message')
          }
        } else {
          msg.reply('Not enough FORCE to rain! You have **' + balance.toString() + ' FORCE**')
        }
      } else {
        msg.reply('You forgot the number! Type `frain <number-of-FORCE>`, also: The minimum rain size is **0.1 FORCE**')
      }
    }

    if (command === 'fstats' && msg.guild) {		// RANDOM/FUN COMMANDS
      fs.readdir(dataStorageLocation, (err, files) => {
        msg.channel.send('**' + msg.guild.name + ' Server Stats**\n\nOwner: ' + msg.guild.owner.user.username + '\nCreated at ' + msg.guild.createdAt + '\nID: ' + msg.guild.id + '\n' + msg.guild.memberCount.toString() + ' members are in the server\n' + files.length + ' members are registered in the Database')
      })
    }
    if (command === 'favatar') {
      bot.user.setAvatar(parameters[0])
        .then(user => console.log(`New avatar set!`))
        .catch(console.error)
    }
    if (msg.content.toLowerCase().includes('pete')) {
      msg.react('485174721546027008')
    }
    if (command === 'fhelp') {
      const embed = {
        'color': 3144381,
        'footer': {
          'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
          'text': 'The TriForce Tokens Bot - Such a fancy help menu, right!?'
        },
        'author': {
          'name': 'TriForce Help Menu'
  					},
  					'fields': [{
          'name': 'User-Account Commands',
          'value': "**fbal** - Shows your Discord Account's FORCE Balance\n**ftip <@username> <amount>** - Tips a User FORCE from your Discord Balance\n**frain <amount>** - Distributes (Rains) FORCE to all recently-active Discord users",
          'inline': false
    				},
        {
          'name': 'Music Commands',
          'value': "**fjoin** - Connects the bot to the Voice Channel you are inside\n**fplay <youtube-url>** or **fplay <song-name>** - Plays a YouTube Video's audio via the Voice Channel\n**fleave** - Disconnects the bot from your Voice Channel",
          'inline': false
    				},
        {
          'name': 'Invite/Bounty Commands',
          'value': '**finvites** - Shows your Personal Discord Invites statistics\n**ftop** or **fleaderboard** - Shows the Global ' + msg.guild.name + ' Invite Leaderboard, the top 5 on this leaderboard are eligible for Bounty rewards',
          'inline': false
    				},
        {
          'name': 'Twitch Commands',
          'value': '**ftwitchlookup <twitch-username>** - Searches for the specified Twitch channel, displaying statistics and stream-information if live\n**ftwitch** - [Verified-Streamers-Only!] Searches for your own channel on Twitch, quicker and easier than **ftwitchlookup**',
          'inline': false
    				}]
      }
      msg.channel.send({ embed })
    }
    if (command === 'flambo') {
      msg.reply({files: ['https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.stickpng.com%2Fassets%2Fimages%2F580b585b2edbce24c47b2c83.png']})
    }
    if (command === 'freboot' && userID === '176518088575942656') {
      msg.reply('Rebooting!')
      setTimeout(function () { process.exit() }, 250)
    }

    if (msg.guild) {								// USER-BASED COMMANDS
      if (command === 'fbal') {
        if (!parameters[0]) {
          const embed = {
            'color': 3144381,
            'footer': {
              'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
              'text': 'USD Value based on nominal token offering value $0.15'
            },
            'thumbnail': {
              'url': msg.author.avatarURL
            },
            'author': {
              'name': msg.author.username + "'s Discord FORCE Balance"
  					},
  					'fields': [{
              'name': 'Balance:',
              'value': Number(balance.toFixed(8)).toPrecision() + ' FORCE ($' + (balance * fiatValue).toFixed(2) + ')',
              'inline': false
    				}]
          }
          msg.channel.send({ embed })
        } else {
          if (parameters[0] && userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
            var checkUser = parameters[0].replace('<@', '').replace('!', '').replace('>', '')
            if (checkUser.length === 18) {
              fs.readFile(dataStorageLocation + checkUser + '.txt', 'utf8', function (err, dataa) {
                if (!err) {
                  userDataa = dataa.split('::::')
                  balancee = Number(userDataa[1].replace('bal:', ''))
                  msg.reply('Their balance is **' + Number(balancee.toFixed(8)).toPrecision() + ' FORCE**')
                } else {
                  fs.writeFile(dataStorageLocation + checkUser + '.txt', checkUser + '::::bal:0::::invitesRemoved:0::::inviter:none', function (err) {
                    if (!err) {
                      msg.reply("User doesn't have an account - I have generated them a new account")
                    }
                  })
                }
              })
            }
          }
        }
      }
      if (command === 'ftip') {
        if (parameters[1] && Number(parameters[1]) > 0 && parameters[0].length >= 18) {
          var userTo = parameters[0].replace('<@', '').replace('>', '').replace('!', '')
          if (userTo !== msg.author.id) {
            sendFunds(msg, userID, userTo, Number(parameters[1]), userData, balance, 'tip')
          } else {
            msg.reply('Nope')
          }
        } else {
          msg.reply('oops, something was typed wrong!\nTry typing `ftip @username amount`, for example: `ftip @Eupharia113 100`')
        }
      }
      if (command === 'fallinvites') {
        msg.guild.fetchInvites()
          .then(invites => sendInvites(msg, invites.array()))
          .catch(console.error)
      }
      if (command === 'finvites') {
        msg.guild.fetchInvites().then(invites => sendInvite(msg, userData, invites.array())).catch(console.error)
      }
      if (command === 'fleaderboard' || command === 'ftop') {
        msg.guild.fetchInvites().then(invites => gatherLeaderboard(msg, invites.array())).catch(console.error)
      }
      if (command === 'fbounty') {
        fs.readFile('bounty.txt', 'utf8', function (err, contents) {
          if (!err && timestamp !== undefined && lastMsg && contents !== 'none') {
            var bountyTimestamp = Number(contents)
            var bountySeconds = bountyTimestamp - timestamp
            const embed = {
              'color': 3144381,
              'footer': {
                'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                'text': 'The TriForce Tokens Bot - Invitation and Referral System'
              },
              'author': {
                'name': 'TriForce Invite Bounty'
              },
              'fields': [{
                'name': 'Time until Finished',
                'value': (bountySeconds / 86400).toFixed(2) + ' Days',
                'inline': false
              }]
            }
            msg.channel.send({ embed })
          } else if (!err) {
            msg.reply('No bounties are active currently!')
          } else if (err) {
            fs.writeFile('bounty.txt', 'none', function (err) {
              if (!err) {
                msg.reply('No bounties are active currently!')
              }
            })
          }
        })
      }
    }
    if (command === 'ftwitch') {
      fs.readFile(dataStorageLocation + userID + 'twitch.txt', 'utf8', function (err, contents) {
        if (!err) {
          rapid.call('TwitchTV', 'getSingleStream', {
            'channel': contents,
            'clientId': 'd6g6o112aam5s8q2di888us9o3kuyh'
          }).on('success', (payload) => {
            if (payload.stream && payload.stream !== null && payload.stream !== undefined) {
              const embed = {
                'color': 3144381,
                'footer': {
                  'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                  'text': 'TriForce Tokens - Twitch Integrated Gaming Service'
                },
                'thumbnail': {
                  'url': payload.stream.channel.logo
                },
                'author': {
                  'name': 'Your Twitch Channel (' + payload.stream.channel.display_name + ')'
                },
                'fields': [{
                  'name': 'Followers:',
                  'value': payload.stream.channel.followers,
                  'inline': true
                }, {
                  'name': 'Total Views:',
                  'value': payload.stream.channel.views,
                  'inline': true
                }, {
                  'name': 'Game Information:',
                  'value': 'Currently playing **' + payload.stream.channel.game + '** on your stream',
                  'inline': false
                }, {
                  'name': 'Stream Information:',
                  'value': '[' + payload.stream.channel.status + '](' + payload.stream.channel.url + ')\nCurrently with **' + payload.stream.viewers + ' Live Viewers** and an Average Stream FPS of **' + payload.stream.average_fps + ' FPS**',
                  'inline': false
                }]
              }
              msg.channel.send({ embed })
            } else {
              rapid.call('TwitchTV', 'getChannel', {
                'channel': contents,
                'clientId': 'd6g6o112aam5s8q2di888us9o3kuyh'

              }).on('success', (payload) => {
                const embed = {
                  'color': 3144381,
                  'footer': {
                    'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                    'text': 'TriForce Tokens - Twitch Integrated Gaming Service'
                  },
                  'thumbnail': {
                    'url': payload.logo
                  },
                  'author': {
                    'name': 'Your Twitch Channel (' + payload.display_name + ')'
                  },
                  'fields': [{
                    'name': 'Followers:',
                    'value': payload.followers,
                    'inline': true
                  }, {
                    'name': 'Total Views:',
                    'value': payload.views,
                    'inline': true
                  }, {
                    'name': 'Game Information:',
                    'value': 'Last Played **' + payload.game + '** on your stream',
                    'inline': false
                  }, {
                    'name': 'Stream:',
                    'value': "You aren't streaming right now, here's your latest Stream:\n [" + payload.status + '](' + payload.url + ')',
                    'inline': false
                  }]
                }
                msg.channel.send({ embed })
              }).on('error', (payload) => {
                msg.reply("Channel **'" + contents + "'** doesn't seem to exist")
              })
            }
          }).on('error', (payload) => {
            msg.reply("Channel **'" + contents + "'** doesn't seem to exist, or the Twitch API is having issues!")
          })
        } else {
          msg.reply("Looks like you don't have a Streamer Profile setup, no worries! Use command `ftwitchlookup <twitch-username>` to see your channel's stats, otherwise, you can contact Euphy to have a Streamer Profile setup manually")
        }
      })
    }
    if (command === 'ftwitchlookup') {
      rapid.call('TwitchTV', 'getSingleStream', {
        'channel': parameters[0],
        'clientId': 'd6g6o112aam5s8q2di888us9o3kuyh'

      }).on('success', (payload) => {
        if (payload.stream && payload.stream !== null && payload.stream !== undefined) {
          const embed = {
            'color': 3144381,
            'footer': {
              'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
              'text': 'TriForce Tokens - Twitch Integrated Gaming Service'
            },
            'thumbnail': {
              'url': payload.stream.channel.logo
            },
            'author': {
              'name': payload.stream.channel.display_name + "'s Twitch Channel"
            },
            'fields': [{
              'name': 'Followers:',
              'value': payload.stream.channel.followers,
              'inline': true
            }, {
              'name': 'Total Views:',
              'value': payload.stream.channel.views,
              'inline': true
            }, {
              'name': 'Game Information:',
              'value': 'Currently playing **' + payload.stream.channel.game + '** on their stream',
              'inline': false
            }, {
              'name': 'Stream Information:',
              'value': '[' + payload.stream.channel.status + '](' + payload.stream.channel.url + ')\nCurrently with **' + payload.stream.viewers + ' Live Viewers** and an Average Stream FPS of **' + payload.stream.average_fps + ' FPS**',
              'inline': false
            }]
          }
          msg.channel.send({ embed })
        } else {
          rapid.call('TwitchTV', 'getChannel', {
            'channel': parameters[0],
            'clientId': 'd6g6o112aam5s8q2di888us9o3kuyh'

          }).on('success', (payload) => {
            const embed = {
              'color': 3144381,
              'footer': {
                'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                'text': 'TriForce Tokens - Twitch Integrated Gaming Service'
              },
              'thumbnail': {
                'url': payload.logo
              },
              'author': {
                'name': payload.display_name + "'s Twitch Channel"
              },
              'fields': [{
                'name': 'Followers:',
                'value': payload.followers,
                'inline': true
              }, {
                'name': 'Total Views:',
                'value': payload.views,
                'inline': true
              }, {
                'name': 'Game Information:',
                'value': 'Last Played **' + payload.game + '** on their stream',
                'inline': false
              }, {
                'name': 'Stream:',
                'value': payload.display_name + " isn't streaming right now, here's their latest Stream:\n [" + payload.status + '](' + payload.url + ')',
                'inline': false
              }]
            }
            msg.channel.send({ embed })
          }).on('error', (payload) => {
            msg.reply("Channel **'" + parameters[0] + "'** doesn't seem to exist")
          })
        }
      }).on('error', (payload) => {
        msg.reply("Channel **'" + parameters[0] + "'** doesn't seem to exist, or the Twitch API is having issues!")
      })
    }

    if (command === 'fkick') {								// ADMIN-ONLY COMMANDS
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        const user = msg.mentions.users.first()
        if (user) {
          const member = msg.guild.member(user)
          if (member) {
            member.kick('Kicked via TriForce Bot by ' + username).then(() => {
              msg.reply('**Kicked** ' + member.user.username)
            }).catch(err => {
              msg.reply('Error - Couldn\'t kick ' + member.user.username + '\n```\n' + err + '```')
              console.error(err)
            })
          } else {
            msg.reply('That user isn\'t in this server!')
          }
        } else {
          msg.reply('You didn\'t mention the user to kick!')
        }
      }
    }
    if (command === 'fban') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        const user = msg.mentions.users.first()
        if (user) {
          const member = msg.guild.member(user)
          if (member) {
            member.ban('Banned via TriForce Bot by ' + username).then(() => {
              msg.reply('**Banned** ' + member.user.username)
            }).catch(err => {
              msg.reply('Error - Couldn\'t ban ' + member.user.username + '\n```\n' + err + '```')
              console.error(err)
            })
          } else {
            msg.reply('That user isn\'t in this server!')
          }
        } else {
          msg.reply('You didn\'t mention the user to ban!')
        }
      }
    }
    if (command === 'fclear') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        if (parameters[0]) {
          var clearN = Number(parameters[0]) + 1
          if (clearN < 100) {
            async function clear () {
              msg.delete(100)
              const fetched = await msg.channel.fetchMessages({limit: clearN})
              msg.channel.bulkDelete(fetched)
            }
            clear()
          } else {
            msg.reply('The maximum clear-size is 98 messages!')
          }
        }
      }
    }
    if (command === 'fsay') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        if (parameters[0]) {
          msg.channel.send(msg.content.replace('fsay ', ''))
          msg.delete(500)
        }
      }
    }
    if (command === 'fid') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        if (parameters[0]) {
          msg.channel.send('```\n' + msg.content.replace('fid ', '') + '```')
        }
      }
    }
    if (command === 'freact') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        if (parameters[0]) {
          msg.react(parameters[0])
        }
      }
    }
    if (command === 'ftest') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        var channelWelcome = msg.guild.channels.find(ch => ch.name === 'welcome-channel👋🏼')
        var channelBye = msg.guild.channels.find(ch => ch.name === 'bye-bitch')
        var channelDebug = msg.guild.channels.find(ch => ch.name === 'triforce-bot-server-log')
        channelWelcome.send('test').then(message => message.delete(4000))
        channelBye.send('test').then(message => message.delete(4000))
        channelDebug.send('test').then(message => message.delete(4000))
      }
    }
    if (command === 'fbountystart') {
      if (userID === '458543519519342594' || userID === '176518088575942656' || userID === '362909367508533250' || userID === '373621597699047424') {
        var bountyTimestampy = timestamp + bountyLength
        fs.writeFile('bounty.txt', bountyTimestampy.toFixed(0), function (err) {
          if (!err) {
            var bountySeconds = bountyTimestampy - timestamp
            const embed = {
              'color': 3144381,
              'footer': {
                'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
                'text': 'The TriForce Tokens Bot - Invitation and Referral System'
              },
              'author': {
                'name': 'TriForce Bounty Started!'
              },
              'fields': [{
                'name': 'Bounty will end and payout in:',
                'value': (bountySeconds / 86400).toFixed(2) + ' Days',
                'inline': false
              }]
            }
            msg.channel.send({ embed })
          } else {
            console.log('DB-ERROR: ' + err)
          }
        })
      }
    }
    if (command === 'faddstreamer') {
      if (parameters[1] && userID === '176518088575942656') {
        fs.writeFile(dataStorageLocation + parameters[0] + 'twitch.txt', parameters[1], function (err) {
          if (!err) {
            msg.channel.send('<@' + parameters[0] + '> now has a Streamer Profile linked to **' + parameters[1] + '**')
          } else {
            msg.reply('Error writing file: ' + err)
          }
        })
      }
    }

    if (msg.content.includes('http') && userID !== '176518088575942656' && userID !== '164178179802660865' && userID !== '458543519519342594' && userID !== '373621597699047424' && userID !== '482548204185845782' && userID !== '362909367508533250' && userID !== '340981780792213504' && userID !== '366601136305864704' && userID !== '166382231680450560' && userID !== '425630354263638018' && userID !== '108332416086605824' && userID !== '302050872383242240') { // AUTO-MODERATION
      var whitelistedQueries = ['youtube.com', 'youtu.be', 'youtube', 'triforce', 'force', 'raidparty', 'concord', 'eximius', 'cxd', 'github', 'google', 'twitch', 'steam', 'twitter', 't.co', 'discord', 'levelup', 'thegamewallstudios', 'giphy', 'tenor', 'bitcoin', 'btc', 'imgur', 'reddit'],
        whitelistLength = whitelistedQueries.length,
        checkNum = 0
      for (var i = 0; i < whitelistLength; i++) {
        if (msg.content.toLowerCase().includes(whitelistedQueries[i])) {
          checkNum++
        }
      }
      setTimeout(function () {
        if (checkNum === 0) {
          msg.reply('**Message Deleted**, URL detected was not in the whitelist')
          msg.delete(250)
        }
      }, 25)
    }
  }, 20)
})

function sendInvites (msg, invites) {
  var i
  var len = invites.length
  var inviteList = '**' + msg.guild.name + ' Global Invites**\n\n'
  for (i = 0; i < len; i++) {
    if (invites[i].inviter && invites[i].uses >= 1) {
      var pushy = invites[i].inviter.username + "'s Invite with code `" + invites[i].code + '` has been used **' + invites[i].uses + '** times\n'
      inviteList += pushy
    }
  }
  setTimeout(function () {
    msg.channel.send(inviteList)
  }, 25)
}
function sendInvite (msg, userData, invites) {
  var i
  var len = invites.length
  var invitesNum = 0
  for (i = 0; i < len; i++) {
    if (invites[i] && invites[i].inviter && invites[i].inviter.id == msg.author.id) {
      invitesNum += invites[i].uses
    }
  }
  setTimeout(function () {
    var removedInvites = Number(userData[2].replace('invitesRemoved:', ''))
    var validInvites = invitesNum - removedInvites
    const embed = {
      'color': 3144381,
      'footer': {
        'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
        'text': 'The TriForce Tokens Bot - Invitation and Referral System'
      },
      'author': {
        'name': msg.author.username + "'s TriForce Invite Stats"
  					},
  					'fields': [{
        'name': 'Valid Invites:',
        'value': validInvites.toString(),
        'inline': true
    				},
      {
        'name': 'Total Invites:',
        'value': invitesNum.toString(),
        'inline': true
    				},
      {
        'name': 'Leaves:',
        'value': removedInvites.toString(),
        'inline': true
    				}]
    }
    msg.channel.send({ embed })
  }, 25)
}

var lastInvitesLeaderboard

function gatherLeaderboard (msg, invites) {
  var i = 0
  var ii = 0
  var invLength = invites.length
  var sortedUsers = []
  var userInvites = 0
  var timer = setInterval(function () {
    if (invites[i] && JSON.stringify(sortedUsers).includes(invites[i].inviter.id) == false) {
      fs.readFile(dataStorageLocation + invites[i].inviter.id + '.txt', 'utf8', function (err, data) {
        if (!err) {
          var userData = data.split('::::')
          if (userData[2]) {
            var invitesNum = invites[i].uses - Number(userData[2].replace('invitesRemoved:', ''))
            if (msg.author.id === userData[0]) {
              userInvites = invites[i].uses - Number(userData[2].replace('invitesRemoved:', ''))
            }
          } else {
            var invitesNum = invites[i].uses
            if (msg.author.id === userData[0]) {
              userInvites = invites[i].uses
            }
          }
          var user = {id: invites[i].inviter.id, name: invites[i].inviter.username, invites: invitesNum}
          if (user.id !== '176518088575942656' && user.id !== '315905683902038017' && user.id !== '283031595722473473' && user.id !== '153981101868580864' && user.id !== '164178179802660865' && user.id !== '458543519519342594' && user.id !== '373621597699047424' && user.id !== '482548204185845782' && user.id !== '362909367508533250' && user.id !== '340981780792213504' && user.id !== '366601136305864704' && user.id !== '166382231680450560' && user.id !== '425630354263638018' && user.id !== '108332416086605824' && user.id !== '302050872383242240') {
					  sortedUsers.push(user)
          }
          i++
        } else {
          var user = {id: invites[i].inviter.id, name: invites[i].inviter.username, invites: invites[i].uses}
          if (user.id !== '176518088575942656' && user.id !== '315905683902038017' && user.id !== '283031595722473473' && user.id !== '153981101868580864' && user.id !== '164178179802660865' && user.id !== '458543519519342594' && user.id !== '373621597699047424' && user.id !== '482548204185845782' && user.id !== '362909367508533250' && user.id !== '340981780792213504' && user.id !== '366601136305864704' && user.id !== '166382231680450560' && user.id !== '425630354263638018' && user.id !== '108332416086605824' && user.id !== '302050872383242240') {
					  sortedUsers.push(user)
          }
          i++
        }
      })
    } else if (invites[i] && JSON.stringify(sortedUsers).includes(invites[i].inviter.id) == true) {
      for (ii = 0; ii < invLength; ii++) {
        if (sortedUsers[ii] && invites[i] && invites[i].inviter.id === sortedUsers[ii].id) {
          sortedUsers[ii].invites += invites[i].uses
          if (msg.author.id === invites[i].inviter.id) {
            userInvites = invites[i].uses
          }
          console.log('Adding ' + invites[i].uses + ' to ' + sortedUsers[ii].id + '/' + invites[i].inviter.id + "'s leaderboard")
          i++
        }
      }
    } else if (!invites[i]) {
      var message = ''
      var iii = 0
      var userPosition = 0
      var sortedLength = sortedUsers.length
      lastInvitesLeaderboard = []
      sortedUsers = sortedUsers.sort(function (a, b) { return b.invites - a.invites })
      for (iii = 0; iii < sortedLength; iii++) {
        if (sortedUsers[iii]) {
          if (iii < 10) {
            message += '\n**' + (iii + 1).toString() + '.** ' + sortedUsers[iii].name + ' - **' + sortedUsers[iii].invites + '** Invites'
            lastInvitesLeaderboard.push({id: sortedUsers[iii].id, invites: sortedUsers[iii].invites})
          }
          if (sortedUsers[iii].id === msg.author.id) {
            userPosition = iii + 1
          }
        }
      }
      if (lastMsg.content.toLowerCase().startsWith('ftop') || lastMsg.content.toLowerCase().startsWith('fleaderboard')) {
			  const embed = {
          'color': 3144381,
          'footer': {
            'icon_url': 'https://cdn.discordapp.com/emojis/467170811300675614.png',
            'text': 'The TriForce Tokens Bot - Invitation and Referral System'
          },
          'author': {
            'name': msg.guild.name + ' Invites Leaderboard'
  					},
  					'fields': [{
            'name': 'Leaderboard:',
            'value': message,
            'inline': false
    				},
          {
            'name': '­­­­­­­­­\nYour Leaderboard Position:',
            'value': '**' + userPosition.toString() + '** <a:partyPete:485174721546027008>',
            'inline': false
    				}]
        }
        msg.channel.send({ embed })
      }
      console.log('SortedUsers: ' + JSON.stringify(sortedUsers))
      clearInterval(timer)
    }
  }, 25)
}

function sendFunds (msg, from, to, amount, userData, balance, type) {
  if (msg.guild) {
    if (msg.author.id === userData[0] && msg.author.id !== to) {
      var virtBal = balance - amount
      if (balance >= amount && amount <= balance && virtBal >= 0) {
        fs.readFile(dataStorageLocation + to + '.txt', 'utf8', function (err, data) {
          if (!err) {
            var toData = data.split('::::')
            var toBal = Number(toData[1].replace('bal:', ''))
            toBal += amount
            balance -= amount
            fs.writeFile(dataStorageLocation + to + '.txt', to + '::::bal:' + toBal.toFixed(8) + '::::' + toData[2] + '::::' + toData[3], function (err) { // MAKE SURE TO EDIT THESE AFTER DATABASE UPGRADES, OR NEW DATA WILL BE REMOVED!!!
              if (!err) {
                fs.writeFile(dataStorageLocation + from + '.txt', from + '::::bal:' + balance.toFixed(8) + '::::' + userData[2] + '::::' + userData[3], function (err) {
                  if (!err) {
                    if (type === 'tip') {
										  msg.channel.send('<@' + from + '> sent **' + Number(amount.toFixed(8)).toPrecision() + ' FORCE** ($' + Number((amount * fiatValue).toFixed(2)).toPrecision() + ') to <@' + to + '>')
                    }
                  } else {
                    console.log(err)
                    msg.reply('Error - Printed Error details into Developer console')
                  }
                })
              } else {
                console.log(err)
                msg.reply('Error - Printed Error details into Developer console')
              }
            })
          } else {
            fs.writeFile(dataStorageLocation + to + '.txt', to + '::::bal:0::::invitesRemoved:0::::inviter:none', function (err) {
              if (!err) {
                msg.reply('oops, <@' + to + '> isn\'t registered in the Database - i have just generated them an Account, send your tip again please!')
              }
            })
          }
        })
      } else {
        msg.reply('Not enough FORCE to send! You have **' + Number(balance.toFixed(8)).toPrecision() + ' FORCE**')
      }
    }
  }
}

bot.login('NDgzNjA2ODM4MDg5MjIwMDk2.DmV6Uw.6CUW744zT_yQlqlOmiZOuB8Xuok')
