aata-hack
=========

Use nodejs and Raspberry Pi to create a bus alert system. This combines a website for a configuration and a light interface. There is also a map, but that is currently under construction.

## Deploy on a Raspberry Pi
To deploy on a Raspberry Pi, you will need a few things. Namely, three LED lights, ideally different colors, appropriate resistors to avoid burning out said LEDs, and the wiring for connecting everything. Additionally, your Raspberry Pi will need a network connection to get up-to-date bus info. The pins used by this program are set to 11 for 'Go', 13 for 'Set', and 15 for 'Ready'. Ready, Set, Go. Like in racing.

Beyond the hardware, you would also need to set up the code on your Pi. To do this you need to:

1. You can use a keyboard and monitor to login into your Pi. Alternatively, ssh into your Raspberry Pi. More info on that here (https://www.raspberrypi.org/documentation/remote-access/ssh/). 
2. Run `git clone git@github.com:akosel/aata-hack.git`. You can also use https if that is your preference.
3. `cd aata-hack`
4. `npm install`. Node is a dependency, so you may need to install that. (I should have used Python, in hindsight, because that is native to the Pi, but I did not. I am sorry.) Installing node isn't so bad though! Follow this helpful guide for installing node on a Raspberry Pi http://joshondesign.com/2013/10/23/noderpi
5. `grunt build` to make compile all of the stylesheets.
6. `node server.js`. This will run a server on port 8000 on your Pi.
7. In your favorite browser, enter your Pi's ip address (find by running ifconfig and for inet addr for wlan0 interface) and port 8000. For example, 192.168.1.89:8000. 
8. Enter in your bus info in the prompt. And hit enter. This will initialize the web app AND the Pi lights in one go.


## Live Demo
http://aata-map.herokuapp.com
