#!/bin/bash

if [ "$1" = "api" ];then
    xttitle api-dsky
    unclutter -idle 3 -root &>/dev/null &
    while true; do
    	wmctrl -a api-dsky
	    killall chromium-browser &>/dev/null
        cd ~/DSKY/Programs/api-dsky
	    npm start -- \
            -s /dev/ttyUSB0 \
            --callback 'chromium-browser --start-fullscreen --incognito http://localhost:3000 && sleep 5 && wmctrl -a chromium' \
            --shutdown 'shutdown -h now' $EXTRAPARAMS
    done
elif [ "$1" = "cron" ]; then
    pgrep chromium | xargs kill -9
    if [ $? -eq 0 ]; then
        export DISPLAY=:0
        chromium-browser --start-fullscreen --incognito http://localhost:3000 &
        sleep 5
        wmctrl -a chromium
    fi
else
    xttitle web-dsky
    x-terminal-emulator -e "~/DSKY/orangepi.sh api" &>/dev/null &
    cd ~/DSKY/Programs/web-dsky
    npm start
fi