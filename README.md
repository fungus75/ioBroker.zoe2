![Logo](admin/zoe.png)
# iobroker.zoe

Einfacher Adapter, um grundlegende Werte vom Renault ZOE ueber iobroker auszulesen.


Manuelle Installation

- Kopiere alle Dateien in das Verzeichnis /opt/iobroker/iobroker.zoe

- Berechtigungen, User und Group anpasssen:
	sudo chmod -R 775  /opt/iobroker/iobroker.zoe
	sudo chown -R iobroker.iobroker  /opt/iobroker/iobroker.zoe

- Abhaengingkeiten installieren:
	cd /opt/iobroker/iobroker.zoe ; sudo npm install .

- ioBroker starten: sudo ioBroker start
  oder iobroker neu starten: sudo iobroker restart


Halbautomatische Installation

- aus dem Linux-Terminal heraus:

```npm install https://github.com/fungus75/ioBroker.zoe```

Konfiguration im ioBroker

- In der WebGui von ioBroker unter "Adapter" eine Instanz von "Zoe" erzeugen.

- In der Adapterkonfiguration muss Benutzername und Passwort von https://www.services.renault-ze.com/ eingetragen sein,
  dafür braucht man einen entsprechenden Service von Renault (MY Z.E.Connect oder Ähnliches)
  Zusätzlich muss noch die Fahrgestellnummer (VIN) eingetragen werden.

- Nach dem Speichern sollten nach ca. 15 Minuten die entsprechenden 
  Objekte erzeugt werden. Siehe in der ioBroker-Gui unter Objekte >> "zoe.0"
  

Dank:
```https://michael-heck.net/index.php/elektromobilitaet/renault-zoe-ins-smarthome-integrieren```

ohne dieser Anleitung haette ich es nicht geschafft. Danke.
  
Hinweis:

- Es können mehrere Instanzen für verschiedene Zoes erzeugt werden.

  Stand: 2019-10-06



