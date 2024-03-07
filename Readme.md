# DSKY Replica
> This project is still a work-in-progress

This projects aims to create an affordable and easy to manufacture, yet as realistic as possible replica of the DSKY used in the Apollo program to interface with the Apollo Guidance Computer (AGC).

## Repository contents:
* **3D Models**:
  * **Common Models:** Meshes you need to print regardless of what display you want to use.
  * **iPhone 12 Mini version:** Meshes to print if you want to use an iPhone 12 Mini as the substitute for the EL display.
  * **LCD version:** Meshes to print if you want to use an LCD Display (TODO: Choose model) as the substitute for the EL display.
  * **Assembly.7z:** Compressed file, contains:
    * Assembly file in Autodesk Fusion format
    * STEP file of the assembly
  * **Printable Key faces:** PDF File to be printed with an inkjet printer and then laid on top of the plastic keys.
* **Firmware:** PlatformIO project containing the firmware to be flashed on the Arduino Nano board.
* **Programs:** Software required to interface with AGC simulators
  * **api-dsky**: Will relay data to the chosen serial port, and also make it available via websocket on port 3001
    * Requirements: NodeJS >18
    * Running: 
      * Open a terminal in this location 
      * Run ``npm install`` 
      * Run ``npm start``
  * **web-dsky**: Web Application that uses 'api-dsky's websocket to render the EL display
    * Requirements: NodeJS >18
    * Running: 
      * Open a terminal in this location 
      * Run ``npm install``
      * Run ``npm run build``
      * Run ``npm start``
      * Go to: ``http://{your computer's LAN IP}:3000``
  * **python-dsky**: Experiment to read Reentry's data using python
* **Boards**
  * Alarm Lights PCB
  * Main PCB

## Repositories used as reference:
* [AGC_DSKY_Replica](https://github.com/ManoDaSilva/AGC_DSKY_Replica) by ManoDaSilva
* [agc-mechanical-cad](https://github.com/rrainey/agc-mechanical-cad) by rrainey
* [dsky-fonts](https://github.com/ehdorrii/dsky-fonts) by ehdorrii