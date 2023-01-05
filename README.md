# massiveW
Commands for install:

>-npm install
>
>-node index.js
 
# To run the application in background as a service for linux
>
You can edit file **contactos.service**, and **daemon.sh** changing the directory path from the application, them move the file **contactos.service** 
to directory path **/etc/systemd/system/**, them execute the command  **-systemctl enable contactos** and finally to start the service you can execute de command **systemctl start contactos**.

