Step 1: Image SD Card
	Raspberry Pi Imager
		Raspberry Pi OS List (32 bit)
		
Step 2: Update & Configure RPI
	Login: pi; raspberry
	sudo raspi-config
		System Options
			Wireless LAN
				Select the country in which the Pi is to be used
				Please enter SSID
				Password
		Interface Options
			SSH
				Would you like to enable SSH? <Yes>
		<Finish>
		Would you like to reboot now? <Yes>
		
	ssh pi@raspberrypi (note: may need to remove cached host key fingerprint... C:\Users\thartford\.ssh\known_hosts)
		sudo raspi-config
			System Options
				Hostname: kiosk
				Password
			Update
			System Options
				Boot / Auto Login
					Console Autologin
			Display Options
				Underscan
					Would you like to enable compensation for displays with overscan? <No>?
				Pixel Doubling (?)
	
	ssh pi@kiosk
		sudo raspi-config
			Display Options
				VNC Resolution - doesn't work!
			Localisation Options
				Keyboard
					Generic 104-key PC
					English (US)
					English (US) - English (US, alt. intl.)
					The default for the keyboard layout
					No compose key
		sudo apt-get update
		sudo apt-get upgrade	
	
Step 3: Install & Configure Kiosk (startx) (https://desertbot.io/blog/raspberry-pi-touchscreen-kiosk-setup, https://die-antwort.eu/techblog/2017-12-setup-raspberry-pi-for-kiosk-mode/)
	Install minimum GUI components
		sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
		sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
	Install browser
		sudo apt-get install --no-install-recommends chromium-browser
	Edit Openbox config
		sudo nano /etc/xdg/openbox/autostart
			xset -dpms            # turn off display power management system
			xset s noblank        # turn off screen blanking
			xset s off            # turn off screen saver
			# Remove exit errors from the config files that could trigger a warning
			sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/'Local State'
			sed -i 's/"exited_cleanly":false/"exited_cleanly":true/; s/"exit_type":"[^"]\+"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences
			# Run Chromium in kiosk mode
			chromium-browser  --noerrdialogs --disable-infobars --kiosk $KIOSK_URL
			--check-for-update-interval=31536000
			
		sudo nano /etc/xdg/openbox/environment
			export KIOSK_URL=https://desertbot.io
			
		See if ~/.bash_profile already exists:
			ls -la ~/.bash_profile
		If NOT, then create an empty version:
			touch ~/.bash_profile
		Edit ~/.bash_profile:
			sudo nano ~/.bash_profile
		Add this line to start the X server on boot. Because I am using a touch screen I'm passing in the flag to remove the cursor.
			[[ -z $DISPLAY && $XDG_VTNR -eq 1 ]] && startx -- -nocursor
		Save and exit the file by pressing Ctrl-o, enter, Ctrl-X.
		From the command line run:
			source ~/.bash_profile
		If you had no errors, reboot
			sudo reboot				

Step 4: Install & Configure GitHub
	sudo apt install git
	mkdir git
	cd git
	git clone https://github.com/MentalWhiteNoise/dynamic_kiosk.git
	cd dynamic_kiosk
	git config --global user.name "MentalWhiteNoise"
	git config --global user.email "mentalwhitenoise@users.noreply.github.com"
		

Step 5: Install & Configure Packages, including Puppeteer
	sudo apt-get install nodejs
	sudo apt-get install npm
	nodejs -v
	npm -v
	POSSIBLY: sudo apt install chromium-browser chromium-codecs-ffmpeg
		Or just sudo apt install chromium-codecs-ffmpeg
	Server
		cd ~/git/dynamic_kiosk/api
		sudo npm install
		node .
		
		verify getting []
		Stop node
		
		Copy FTP files over
		node .
		verify values.
		
		install puppeteer?
			sudo export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
			sudo npm install -g puppeteer
	Client
		cd ~/git/dynamic_kiosk/dynamic-kiosk
		sudo npm install
		cd src
		sudo npm start
		verify site responding
		
		sudo npm run build
		node .
		
		verify site responding
	
Step 6: Schedule to auto-start
	sudo nano /etc/rc.local
	Add lines before exit:
		su pi -c 'node /home/pi/git/dynamic_kiosk/api/ < /dev/null &'
		su pi -c 'node /home/pi/git/dynamic_kiosk/dynamic-kiosk/server.js < /dev/null &'

	sudo nano /etc/xdg/openbox/environment
		export KIOSK_URL=http://localhost