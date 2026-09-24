# Desplegar en una Raspberry Pi (con su propia wifi)

Esta guía monta la galería en una Raspberry Pi dedicada, que además crea **su
propia red wifi** — así el día de la boda no depende de tu Mac, ni de que el
sitio tenga internet o wifi propios.

## Por qué esto y no un móvil/microcontrolador

- **ESP32 / ESP32-S3 / Arduino**: no sirven para esto. Son microcontroladores
  con unos pocos cientos de KB de RAM, sin sistema de archivos real ni
  capacidad de correr Docker/Node. Solo pueden hacer tareas muy pequeñas
  (leer un sensor, encender un LED), no guardar y servir cientos de fotos y
  vídeos.
- **Raspberry Pi**: es un ordenador completo (Linux de verdad), con
  suficiente RAM/almacenamiento y con Docker soportado oficialmente. Es lo
  mínimo viable para este trabajo.

## Qué comprar

- **Raspberry Pi 4 o 5**, con 4GB de RAM o más.
- Una **tarjeta microSD de 32GB+** (o mejor, un SSD USB si tu modelo de Pi
  arranca desde USB — más fiable a largo plazo que una SD).
- La **fuente de alimentación oficial** correspondiente a tu modelo.
- No hace falta pantalla ni teclado (todo se configura por SSH).

## 1. Flashear el sistema operativo

1. Descarga [Raspberry Pi Imager](https://www.raspberrypi.com/software/) en
   tu ordenador.
2. Elige **Raspberry Pi OS Lite (64-bit)** (no hace falta la versión con
   escritorio, todo se maneja por terminal).
3. Antes de escribir la tarjeta, pulsa el icono de ⚙️ (opciones avanzadas) y
   configura:
   - Nombre de host: por ejemplo `boda`
   - Activar SSH (con usuario y contraseña, o tu clave SSH)
   - Wifi: pon tu wifi de casa **temporalmente** (la necesitas para instalar
     todo; luego la cambiaremos a modo hotspot)
   - Zona horaria / teclado: España
4. Escribe la imagen, mete la tarjeta en la Pi y enciéndela. Espera 1-2
   minutos a que arranque.

## 2. Conectarte y clonar el proyecto

Desde tu ordenador:

```bash
ssh tu-usuario@boda.local
```

(si `boda.local` no resuelve, usa la IP que te muestre tu router).

Dentro de la Pi:

```bash
sudo apt update && sudo apt upgrade -y
git clone https://github.com/juanlacostaarpide/Web-fotos-boda-j-l.git
cd Web-fotos-boda-j-l
```

## 3. Instalar todo con el script

```bash
bash scripts/pi-install.sh
```

Este script:
- Instala Docker (si no lo tenías).
- Te ayuda a crear el `.env` (contraseña de admin, secreto de sesión).
- Construye la imagen y arranca la galería.

Al terminar te da una URL tipo `http://192.168.1.XX:8080` — pruébala desde
el móvil (aún en la wifi de casa) para confirmar que todo funciona.

## 4. Convertir la Pi en su propio punto de wifi

**Solo cuando ya hayas probado que todo funciona.** A partir de aquí la Pi
deja de poder conectarse a otra wifi como cliente (se convierte ella misma
en el punto de acceso):

```bash
bash scripts/pi-hotspot.sh "BodaJyL" "una-contraseña-de-8-o-mas-caracteres"
```

Esto crea una wifi llamada `BodaJyL` y la Pi pasa a tener la IP fija
`10.42.0.1`. El script te dirá exactamente qué añadir a tu `.env`
(`WIFI_SSID` y `WIFI_PASSWORD`) para que la página `/qr` genere también un
QR de "conéctate a esta wifi" automáticamente, además del QR de la web.

Tras editar el `.env`, reinicia el contenedor para que recoja los cambios:

```bash
docker compose up -d
```

Prueba de nuevo desde el móvil: conéctate a la wifi `BodaJyL` y abre
`http://10.42.0.1:8080`.

## 5. Que arranque solo si se va la luz o se reinicia

No hace falta nada más: Docker se instala configurado para arrancar solo al
encender la Pi, y los contenedores de este proyecto tienen la política
`restart: unless-stopped`, así que se recuperan solos. Aun así, antes de la
boda:

- Deja la Pi **enchufada a corriente** (no a una batería que se pueda
  agotar).
- Comprueba que **nunca se suspende** (Raspberry Pi OS Lite, sin escritorio,
  no se suspende por defecto — no hay que tocar nada).
- Opcional pero recomendable: una **batería portátil (power bank) de
  respaldo** conectada a la Pi por si hay un corte de luz puntual.

## 6. El día de la boda

1. Enchufa la Pi (dale 1-2 minutos a arrancar).
2. Imprime la página `/qr` (con la wifi ya conectada, ábrela desde tu móvil
   o portátil en `http://10.42.0.1:8080/qr`) y colócala en las mesas.
3. Los invitados escanean el primer QR (wifi) y el segundo (la web), sin
   necesitar datos móviles ni el wifi del local.

## Backups

La carpeta `data/` de la Pi es la **única copia** de lo que suban los
invitados. Antes y después del evento, cópiala a otro sitio (un USB, tu
Mac, Google Drive...):

```bash
# desde tu ordenador, con la Pi en la misma red
scp -r tu-usuario@boda.local:~/Web-fotos-boda-j-l/data ./backup-boda
```
