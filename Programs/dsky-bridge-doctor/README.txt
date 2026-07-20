DSKY Bridge Doctor
==================

What this is
------------
A small diagnostic tool that figures out why your physical DSKY can't
connect ("bridge") to the DSKY software running on this PC.

It checks BOTH sides:
  * this PC (its network addresses, what it advertises, its WebSocket port)
  * the physical DSKY / Orange Pi (over the network), including whether the
    DSKY can actually reach this PC, plus its live logs.


How to run it
-------------
1. Make sure the DSKY software (next-dsky) is RUNNING on this PC, exactly
   like when you use it in the browser. Do NOT close it.

2. Make sure this PC and the physical DSKY are on the SAME Wi-Fi / network.

3. Double-click:   RUN-DOCTOR.bat

4. Wait ~30 seconds. Your DSKY screen may blink or restart for about 15
   seconds near the end - that is expected and it recovers by itself.

5. When it finishes, a file called  doctor-report.txt  is created in this
   folder. Send that file back to us.


If it can't find the DSKY automatically
---------------------------------------
Open a terminal in this folder and run, replacing the IP with your DSKY's
address (find it on the DSKY under Menu -> About, or in your router):

    node doctor.js --pi 192.168.1.42


Notes
-----
* Needs Node.js installed (https://nodejs.org). The .bat will tell you if
  it's missing.
* Everything the tool needs is already inside this folder (the node_modules
  folder). No internet is required to run it.
* The tool only reads information and runs read-only checks. It does not
  change any settings on your PC or DSKY.
