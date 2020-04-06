![Logo](admin/zoe.png)
# iobroker.zoe
=================

Simple ioBroker-Adapter to get some basic values from Renault ZOE and use it in ioBroker. 

PLEASE NOTE: THIS ADAPTER USES THE OLD API (www.services.renault-ze.com); if you want to use the current Renault-Api please try https://github.com/fungus75/ioBroker.zoe2 instead.

If this adapter is not available on the ioBroker-Admin-View, please use the following command to install it (from command-line on your ioBroker-Server):

```npm install https://github.com/fungus75/ioBroker.zoe/tarball/master/```

After that the adapter should show up in the ioBroker-Admin-View.

### Configuration

- You have to set username, password and VIN as you have done in https://www.services.renault-ze.com/
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

```https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-ins-smarthome-integrieren```
and ```https://github.com/edent/Renault-Zoe-API``` for your great documentation.



## Changelog

### 0.0.3 (2019-10-27)
- added: precon and charging-buttons
- added: read and display last status of precon

### 0.0.2 (2019-10-13)
- added: calculation of endtime for charging (charging_finished_at)

### 0.0.1 (2019-10-06)
- first "version" that goes to github for testing
- works "productive" on my own system

## License
The MIT License (MIT)

Copyright (c) 2019 RenePilz <rene@pilz.cc>

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


