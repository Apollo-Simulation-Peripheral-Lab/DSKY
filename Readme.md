# DSKY Replica
> This project is still a work-in-progress

This projects aims to create an affordable and easy to manufacture, yet as realistic as possible replica of the DSKY used in the Apollo program to interface with the Apollo Guidance Computer (AGC).

## Quick start

**Do you want a DSKY but can't build one? Buy one [here](https://shop.ortizma.com)**

**Do you just want to have a DSKY display in your web browser?**
  - Make sure you have NodeJS > 18
  - Run start.bat and answer the prompts

**Do you want to build the whole DSKY replica?**
  - Print the .3mf meshes found in the '3D Models' folder. 
    - **You will need to choose whether you want to use an LCD board or a phone as the display**
    - Currently supported phones are:
      - iPhone 12 Mini
      - iPhone 13
    - Currently supported LCD displays are:
      - 40-Pin 5" LCD display using HDMI driver board
  - Build the PCB's:
    - Order the PCB gerber files that you can find in the Boards folder
    - Order the PCB components that you can find in the .csv files in the Boards folder
    - Order the LCD Board if you chose to use one
  - Assemble the parts and PCB's
  - Flash the Firmware:
    - Install PlatformIO into VSCode
    - File -> Open Workspace from File -> DSKY.code-workspace
    - Within PlatformIO's menu, flash the firmware into your Arduino Nano
  - Make sure you have NodeJS > 18
  - Run start.bat in your PC

## Repository contents:
* **Documentation**: Useful information to better understand how the different pieces of the puzzle talk to each other
* **3D Models**:
  * **Common Models:** Meshes you need to print regardless of what display you want to use.
  * **iPhone 12 Mini version:** Meshes to print if you want to use an iPhone 12 Mini as the substitute for the EL display.
  * **HDMI version:** Meshes to print if you want to use a 5.0" 800x480, 40-pin LCD Display as the substitute for the EL display, with an adapter board with mini-hdmi input.
  * **Assembly.7z:** Compressed file, contains:
    * Assembly file in Autodesk Fusion format
    * STEP file of the assembly
  * **Printable Key faces:** PDF File to be printed with an inkjet printer and then laid on top of the plastic keys.
* **Firmware:** PlatformIO project containing the firmware to be flashed on the Arduino Nano board.
* **Programs:** Software required to interface with AGC simulators.
  * **api-dsky**: Will relay data to the chosen serial port, and also make it available via websocket on port 3001
    * Requirements: 
      * NodeJS >18
      * On linux: ``libx11-dev``, ``libxtst-dev`` and ``libpng++-dev``
    * Running: 
      * Open a terminal in this location 
      * Run ``npm install`` 
      * Run ``npm start``
  * **web-dsky**: Web Application that uses 'api-dsky's websocket to render the EL display
    * Requirements: NodeJS >18
    * Running (production mode): 
      * Open a terminal in this location 
      * Run ``npm install``
      * Run ``npm run build``
      * Run ``npm start``
      * Go to: ``http://{your computer's LAN IP}:3000``
    * Running (development mode): 
      * Open a terminal in this location 
      * Run ``npm install``
      * Run ``npm run dev``
      * Go to: ``http://{your computer's LAN IP}:3000``
  * **python-dsky**: Experiment to read Reentry's data using python
  * **click-generator**: Python program that procedurally generates relay clicking sequences to emulate the DSKY's relay boxes
* **Boards**
  * Alarm Lights PCB
  * Main PCB

## Repositories used as reference:
* [AGC_DSKY_Replica](https://github.com/ManoDaSilva/AGC_DSKY_Replica) by ManoDaSilva
* [agc-mechanical-cad](https://github.com/rrainey/agc-mechanical-cad) by rrainey
* [dsky-fonts](https://github.com/ehdorrii/dsky-fonts) by ehdorrii