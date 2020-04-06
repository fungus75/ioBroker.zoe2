![Logo](admin/zoe.png)
# iobroker.zoe
=================

Simple ioBroker-Adapter to get some basic values from Renault ZOE and use it in ioBroker. 

PLEASE NOTE: THIS ADAPTER USES THE SAME API AS THE MY RENAULT APP. BUT YOU MUST HAVE TO SET UP MY RENAULT APP TO WORK BEFORE USING THIS ADAPTER. i.e. on Android: https://play.google.com/store/apps/developer?id=RENAULT+SAS

PLEASE NOTE: THIS IS A VERY EARLY STATE OF DEVELOPMENT, USE OF YOUR OWN RISK

If this adapter is not available on the ioBroker-Admin-View, please use the following command to install it (from command-line on your ioBroker-Server):

```npm install https://github.com/fungus75/ioBroker.zoe2/tarball/master/```

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
   - Status of last precon (date, type and result)
- Write to Zoe:
   - Precon Now
   - Charge Now

### Please Note!!

Communication with ZOE or Renault-Services is done only during the interval-times with is 10 Minutes.
So if you press preconNow or chargeNow, it will take up to the next interval to send it to ZOE and it will take up to the
very next interval to get the status back.

### Thanks  

https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-ins-smarthome-integrieren, https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-im-smarthome-neue-api-2020
and https://github.com/edent/Renault-Zoe-API for your great documentation.



## Changelog

### 0.0.1 (2020-04-06)
- nonworking version, just to create initial repo on github
- code taken 1:1 from iobroker.zoe

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


