// UID del admin (tu cuenta email/password) en CADA uno de los dos proyectos Firebase.
//
// Firebase Auth asigna un UID distinto a la misma persona en cada proyecto, así que
// tras crear tu usuario admin (email/password) en el proyecto de FOTOS y en el de
// VÍDEOS, copia aquí cada UID (Firebase Console → Authentication → Users → columna "User UID").
//
// Estos mismos valores hay que pegarlos también en `firestore.rules`, `storage.photos.rules`
// y `storage.videos.rules` (ver README, sección "5. Configurar tu UID de admin").
export const ADMIN_UID_PHOTOS = 'REEMPLAZA_CON_TU_UID_PROYECTO_FOTOS'
export const ADMIN_UID_VIDEOS = 'REEMPLAZA_CON_TU_UID_PROYECTO_VIDEOS'
