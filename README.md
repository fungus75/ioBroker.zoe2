![Logo](admin/zoe.png)
# iobroker.zoe2
=================
[![Build Status](https://travis-ci.org/fungus75/ioBroker.zoe2.svg?branch=master)](https://travis-ci.org/fungus75/ioBroker.zoe2)

Simple ioBroker-Adapter to get some basic values from Renault ZOE and use it in ioBroker. 

PLEASE NOTE: THIS ADAPTER USES THE SAME API AS THE MY RENAULT APP. BUT YOU MUST HAVE TO SET UP MY RENAULT APP TO WORK BEFORE USING THIS ADAPTER. i.e. on Android: https://play.google.com/store/apps/developer?id=RENAULT+SAS - if you want to use the old api, please use https://github.com/fungus75/ioBroker.zoe instead.

PLEASE NOTE: THIS IS A VERY EARLY STATE OF DEVELOPMENT, USE OF YOUR OWN RISK

If this adapter is not available on the ioBroker-Admin-View, please use the following command to install it (from command-line on your ioBroker-Server):

```npm install https://github.com/fungus75/ioBroker.zoe2/tarball/master/```

Or you can use the GitHub-Button (labeled: install from own URL) in the Adapter-View and enter this URL on the "other"-Tab. This can also be used to update to the current adapter-version:

```https://github.com/fungus75/ioBroker.zoe2/tarball/master/```




After that the adapter should show up in the ioBroker-Admin-View.

### Configuration

- You have to set username, password and VIN as you have done in my renault app
- This locales ("Laenderversionen") currently do work: de_DE
- Maybe you need a My-Z.E.Connect or similar services from Renault to use this
- After saving it took around 15 minutes to create the objects (zoe.0 and so on)

### Features

- Read this parameters from Zoe:
   - charge_level in percent
   - charging as boolean
   - plugged on as boolean
   - remaining range in kilometer
   - remaining time of charging
   - calculated endPoint of charing (charging_finished_at)
   - battery temperature
   - external temperature (not that accurate)
   - chargingPower
   - batteryCapacity
   - batteryAvailableEnergy
   - gpsLatitude and gpsLongitude, works only on newer ZOEs
- Write this parameters:
   - preconNow: starts precon/hvac (write true to that node, or press the button)


Some parameters only work on newer ZOEs.

### Testet with the folowing ZOEs:
- Zoe Phase 2 (Thanks Jack-RK-24)
- Zoe R210 (1st Generation, tested by fungus75)
- Zoe R90 (Thanks arturwolf)

### Please Note!!

Communication with ZOE or Renault-Services is done only during the interval-times with is 10 Minutes.
So if you press preconNow or chargeNow, it will take up to the next interval to send it to ZOE and it will take up to the
very next interval to get the status back.

The new ZOE API from Renault seems to be very lacy. That means that it only shows new values when there is something important.
As far as I found out, the most important thing is battery-level. That means i.E. the external temperature is not updated,
if the car stands at home. Only if i.E. the ZOE charges, the external temperature will be updated. If charging is finished,
still no new update. When driving, the battery level gets lower and lower and therefore it should update very regulary.

### Thanks  

https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-ins-smarthome-integrieren, 
https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-im-smarthome-neue-api-2020,
https://muscatoxblog.blogspot.com/2019/07/delving-into-renaults-new-api.html
and https://github.com/edent/Renault-Zoe-API for your great documentation.



## Changelog

### 0.1.0 (2020-07-03)
- bugfix: https://github.com/fungus75/ioBroker.zoe2/issues/6, thanks to https://github.com/damack

### 0.0.9 (2020-06-25)
- added: getLocation can be turned on/off in config (useful for older ZOEs which do not allow getLocation)

### 0.0.8 (2020-06-18)
- bugfix: https://github.com/fungus75/ioBroker.zoe2/issues/2
- bugfix: https://github.com/fungus75/ioBroker.zoe2/issues/3

### 0.0.7 (2020-06-18)
- bugfix: https://github.com/fungus75/ioBroker.zoe2/issues/2
- added: gpsLatitude
- added: gpsLongitude 

### 0.0.6 (2020-04-30)
- added: chargingPower
- added: batteryCapacity
- added: batteryAvailableEnergy
- changed: Using battery-status v2 API (supplies better values for newer ZOEs, thanks Jack-RK-24 for testing)

### 0.0.5 (2020-04-29)
- added: config-paramter ignore API error (when set, the Adapter tries to ignore some API-Errors)

### 0.0.4 (2020-04-21)
- added: preconNow => starts precon (hvac)

### 0.0.3 (2020-04-16)
- added: totalMileage

### 0.0.2 (2020-04-15)
- first working version for github
- reads out some values (as shown in the Features list)

### 0.0.1 (2020-04-06)
- nonworking version, just to create initial repo on github
- code taken 1:1 from iobroker.zoe
- small adjustments, first access to the new renault api

## License
The MIT License (MIT)

Copyright (c) 2020 RenePilz <rene@pilz.cc>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


