# MMM-GmailFeed

MMM-GmailFeed is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror) which creates a table filled with the current list of unread gmail messages. This module uses the Gmail RSS feed instead of IMAP.

## Screenshots

End result:
![](example1.png)

Auto-Hide enabled:

- Mail in inbox:
  ![](autoHideShown.png)
- No new mail in inbox:
  ![](autoHideHidden.png)

Notification Mode:
![](notificationMode.png)

## Installation

```bash
git clone https://github.com/shaneapowell/MMM-GmailFeed
cd MMM-GmailFeed
npm install
```

## Configuration

```javascript
{
 module: 'MMM-GmailFeed',
 position: 'bottom_bar',
 config: {
  username: 'yourname@gmail.com',
  password: 'yourpassword',
  updateInterval: 60000,
  maxEmails: 5,
  maxSubjectLength: 38,
  maxFromLength: 15,
  playSound: true,
  autoHide: true,
  displayMode: "table",
 }
}
```

### Config Options

| **Option**                | **Default**     | **Description**                                                                                                                                                                                                                                     |
| ------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `username`                | `""`            | Your full Gmail username. This can be your coprorate email if you are using a gsuite account.                                                                                                                                                       |
| `password`                | `null`          | Your Gmail password. If you are using 2 factor auth, you'll need to generate a unique "App Password". Go to your Google account settings page, look in the "security" section on the left menu. You should find where to add an App Password there. |
| `updateInterval`          | `5 * 60 * 1000` | milliseconds between updates (`5 * 60 * 1000` = 5 minutes)                                                                                                                                                                                          |
| `maxEmails`               | `5`             | The maximum number of emails to show in the table. The table header will still show the full list of unread emails.                                                                                                                                 |
| `maxSubjectLength`        | `40`            | Maximum number of characters to show in the subject column.                                                                                                                                                                                         |
| `maxFromLength`           | `15`            | Maximum number of characters to show in the from column.                                                                                                                                                                                            |
| `playSound`               | `true`          | Play a notification chime when a new email arrives.                                                                                                                                                                                                 |
| `autoHide`                | `false`         | Automatically hide the module when you have no new emails and show the module when you do.                                                                                                                                                          |
| `displayMode`             | `"table"`       | Display module as `"table"` or `"notification"`.                                                                                                                                                                                                    |
| `color`                   | `true`          | If `true`, notification icon will be in color, if `false`, notification icon will be in grayscale.                                                                                                                                                  |
| `showEmailAdressInHeader` | `true`          | Show email adress in header (`true`) or not (`false`).                                                                                                                                                                                              |

## Credentials

You should be able to use your normal gmail username and password. If you have 2FA (2 factor auth) enabled however, it's a bit different. You need to create a unique "App Password".

- Go to your "Manage your Google Account" screen.
- Select the "Security" link on the left side.
- Scroll down to find "App Passwords" and select it.
- In the "select app" pull down, pick Mail.
- In the "select device" pull down, pick Other. Name it what ever you want. I called mine "MagicMirror"
- Click "Generate". That sequence of characters is the "Password" value you should use.

## Chrome Startup Tricks

I run my MagicMirror² on an ancient rpi-1. It works, but it's not fast. I have it configured to auto-login my normal user into non GUI mode. I did it this way to avoid using any window manager or login manager of any sort. My rpi has to little ram for that. At the end of my users .bashrc file I added..

```bash
if [[ -z $DISPLAY ]] && [[ $(tty) = /dev/tty1 ]]; then exec startx; fi
```

I then created a .xinitrc file in my home directory with the following...

```bash
xset s off
xset -dpms
xset s noblank
unclutter -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
chromium-browser --alsa-output-device=default --noerrordialogs --disable-infobars --autoplay-policy=no-user-gesture-required --app=http://10.0.0.2:899
```

The `-alsa-output-device` was necessary to force chrome to use alsa instead of PulseAudio.
The `--app=xxxx` fired it up into a kind of kiosk mode.
The `--autoplay-policy=no-user-gesture-required` was needed to allow sound to function without having to ever touch the mouse or keyboard.

Another thing I did was turn off the swap partition. Chrome will take up all the ram it can get, and more! I found that after 24 hours, my swap partition was 100% full. Disabling the swap partition didn't negativly affect this already slow machine. Chrome works just fine without having access to ALL THE RAM!!

```bash
sudo dphys-swapfile swapoff
sudo systemctl disable dphys-swapfile
```

Lastly, I set the alsamixer to a good volume, and set it to restore on boot.

```bash
alsamixer
sudo alsactl store
```

## Planned Upgrades/Updates

- Please leave comments and suggestions!

## Contributors

- Thanks to <https://github.com/jamescross4> for adding the notification icon and autoHide feature.
- Thanks to <https://github.com/KristjanESPERANTO> for helping keep it up to date with the recent 2.18 of MM.
