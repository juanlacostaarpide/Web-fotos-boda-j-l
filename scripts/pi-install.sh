#!/usr/bin/env bash
# Instala Docker y despliega la galería en una Raspberry Pi recién flasheada.
#
# Requisitos antes de ejecutar esto:
#   - Raspberry Pi OS (64-bit) instalado, con SSH activado
#   - La Pi conectada a INTERNET (wifi de casa o cable de red) — todavía NO
#     en modo hotspot, eso se configura después con pi-hotspot.sh
#   - Este repositorio clonado en la Pi (o ejecuta este script desde dentro)
#
# Uso:
#   cd Web-fotos-boda-j-l
#   bash scripts/pi-install.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> Instalando Docker (si no está ya instalado)..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo "    Docker instalado. Puede que tengas que cerrar sesión y volver a"
  echo "    entrar (o reiniciar) para que el grupo 'docker' surta efecto."
else
  echo "    Docker ya estaba instalado."
fi

sudo systemctl enable --now docker

if [ ! -f .env ]; then
  echo "==> Creando .env desde .env.example (rellénalo antes de continuar)"
  cp .env.example .env
  echo ""
  echo "    Edita ahora .env con:"
  echo "      nano .env"
  echo ""
  echo "    Necesitas al menos: ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET."
  echo "    Genera el hash con:  node server/src/hashPassword.js \"tu-contraseña\""
  echo "    (recuerda escapar cada \$ del hash como \$\$ dentro de .env)"
  echo ""
  read -rp "Pulsa Enter cuando hayas terminado de editar .env..."
fi

echo "==> Construyendo y arrancando la galería (esto puede tardar varios minutos)..."
docker compose up -d --build

echo ""
echo "✅ Listo. La galería está corriendo en el puerto 8080."
echo ""
echo "Compruébalo desde otro dispositivo en la misma red:"
echo "  http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "Cuando lo hayas probado y quieras que la Pi cree su propia wifi para el"
echo "día de la boda (sin depender de internet del local), ejecuta:"
echo "  bash scripts/pi-hotspot.sh"
