#!/usr/bin/env bash
# Configura la Raspberry Pi para que cree SU PROPIA red wifi (hotspot),
# usando NetworkManager (Raspberry Pi OS Bookworm o más reciente).
#
# A partir de aquí la Pi deja de poder conectarse como cliente a otra wifi
# por el mismo interfaz (wlan0) — por eso esto se hace AL FINAL, después de
# instalar todo con pi-install.sh mientras aún tenías internet.
#
# Uso:
#   bash scripts/pi-hotspot.sh "NombreDeLaWifi" "contraseña-de-8-caracteres-o-mas"

set -euo pipefail

SSID="${1:-}"
PASSWORD="${2:-}"

if [ -z "$SSID" ] || [ -z "$PASSWORD" ]; then
  echo "Uso: bash scripts/pi-hotspot.sh \"NombreDeLaWifi\" \"contraseña\""
  echo "(la contraseña debe tener al menos 8 caracteres)"
  exit 1
fi

if [ "${#PASSWORD}" -lt 8 ]; then
  echo "La contraseña debe tener al menos 8 caracteres."
  exit 1
fi

CON_NAME="BodaHotspot"

echo "==> Creando el punto de acceso wifi '$SSID'..."
sudo nmcli con delete "$CON_NAME" >/dev/null 2>&1 || true
sudo nmcli con add type wifi ifname wlan0 con-name "$CON_NAME" autoconnect yes ssid "$SSID"
sudo nmcli con modify "$CON_NAME" 802-11-wireless.mode ap 802-11-wireless.band bg
sudo nmcli con modify "$CON_NAME" wifi-sec.key-mgmt wpa-psk
sudo nmcli con modify "$CON_NAME" wifi-sec.psk "$PASSWORD"
sudo nmcli con modify "$CON_NAME" ipv4.method shared
sudo nmcli con up "$CON_NAME"

echo ""
echo "✅ Wifi '$SSID' creada. La Pi es ahora http://10.42.0.1:8080"
echo ""
echo "Para que la página /qr genere el QR de conexión a esta wifi automático,"
echo "añade esto a tu .env y reinicia el contenedor (docker compose up -d):"
echo ""
echo "  WIFI_SSID=$SSID"
echo "  WIFI_PASSWORD=$PASSWORD"
echo ""
echo "Prueba ahora mismo: conecta tu móvil a la wifi '$SSID' y abre"
echo "http://10.42.0.1:8080 en el navegador."
