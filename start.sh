# cat > php_shell.sh <<CONTENT
  #!/bin/sh
  systemctl restart contactos.service
  rm -r /.wwebjs_auth 
CONTENT
