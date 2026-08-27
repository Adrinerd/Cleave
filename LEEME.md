# CLEAVE — cómo tenerlo como app en el móvil

Esta carpeta es una **PWA**: una web que se instala en la pantalla de inicio, se abre a pantalla completa con su icono, sin barra de navegador, y **funciona sin cobertura**. No necesitas App Store, ni cuenta de desarrollador, ni pagar nada.

Contenido de la carpeta:

```
index.html                 el juego entero
manifest.webmanifest       nombre, icono, color, pantalla completa
sw.js                      hace que funcione sin conexión
icon-192.png               icono
icon-512.png               icono grande
icon-512-maskable.png      icono adaptativo de Android
apple-touch-icon.png       icono de iPhone
```

**No cambies los nombres de los archivos** y mantenlos todos en la misma carpeta.

---

## Opción 1 · Netlify Drop — 2 minutos, la más rápida

Necesitas un ordenador (arrastrar una carpeta desde el móvil no funciona bien).

1. Descomprime `cleave-app.zip`.
2. Entra en **app.netlify.com/drop**
3. **Arrastra la carpeta `cleave-app` entera** a la zona de la página. No los archivos sueltos: la carpeta.
4. En unos segundos te da una dirección tipo `https://algo-random-123.netlify.app`
5. Crea una cuenta gratis cuando te lo pida, o el sitio caduca en una hora.
6. En *Site settings → Change site name* puedes ponerle `cleave-proto` y queda `https://cleave-proto.netlify.app`

Gratis para siempre con este tráfico.

---

## Opción 2 · GitHub Pages — funciona desde el propio móvil

Más pasos, pero no necesitas ordenador y la dirección es permanente.

1. Crea una cuenta en **github.com** si no la tienes.
2. **New repository** → nombre `cleave` → **Public** → *Create*.
3. **Add file → Upload files** → sube los 7 archivos (puedes seleccionarlos todos desde la app Archivos del móvil) → *Commit changes*.
4. **Settings → Pages** → en *Branch* elige `main` y carpeta `/ (root)` → *Save*.
5. Espera un minuto. Tu dirección será:
   `https://TUUSUARIO.github.io/cleave/`

---

## Opción 3 · Cloudflare Pages o Vercel

Mismo procedimiento que Netlify. Cualquiera vale. Elige la que ya uses.

---

## Instalar en el móvil

Una vez tengas la dirección, abridla los dos en vuestros móviles.

**iPhone (Safari — tiene que ser Safari, no Chrome):**
Botón *Compartir* (el cuadrado con la flecha) → bajar → **Añadir a pantalla de inicio** → *Añadir*.

**Android (Chrome):**
Suele salir solo un aviso de *Instalar app*. Si no: menú de tres puntos → **Instalar aplicación** o *Añadir a pantalla de inicio*.

Ya tienes el icono en la pantalla. Se abre sin barra de navegador y funciona en el metro.

---

## Cuando quieras cambiar algo

Edita `index.html`, **sube el número en la primera línea de `sw.js`** (por ejemplo de `cleave-v3.0.0` a `cleave-v3.0.1`) y vuelve a subir la carpeta. Si no cambias ese número, los móviles que ya la tengan instalada seguirán viendo la versión vieja: el service worker está haciendo su trabajo.

---

## ¿Y una app de verdad en la App Store?

Se puede: se envuelve esta misma carpeta con **Capacitor** (`npm i @capacitor/core @capacitor/cli`, `npx cap add ios`) y sale un proyecto de Xcode.

**Pero no lo hagas ahora.** Necesitas un Mac, Xcode, 99 €/año de Apple y 25 € de Google, y la revisión tarda días. Para un prototipo que solo quieres probar con gente, la PWA hace exactamente lo mismo y la tienes esta tarde. Esto tiene sentido más adelante, si el juego funciona y quieres una versión digital como producto.

---

## Lo que esta misma dirección puede ser luego

Ese hosting es el sitio donde vivirá el **puzzle diario** ("¿qué mitad coges?") del documento de diseño. Empieza a acumular visitas ya, aunque de momento solo esté el prototipo.


---

---

## Modo online (v5 — arquitectura nueva)

**Ya no usa WebRTC.** La versión anterior intentaba conectar los dos móviles directamente, y eso depende de un servidor de señalización público que falla a menudo: si esa parte no responde, no llega ni a intentarlo. Por eso no funcionaba ni en la misma wifi.

Ahora los dos móviles hablan a través de un **relé por WebSocket**, igual que un chat. Es una conexión HTTPS normal: **si te carga la página, conecta**.

### Cómo se juega

1. Uno pulsa **Online → Crear partida**, pone su nombre y le sale un código de 5 letras.
2. Dale a **Enviar enlace** y mándaselo por WhatsApp.
3. El otro abre el enlace, pone su nombre y entra. (También puede teclear el código a mano.)
4. Cada uno reparte su paladar en su propio móvil y empieza.

### Qué lo hace aguantar

- **Tres relés con relevo automático.** Si uno no contesta en 8 segundos, pasa al siguiente solo.
- **El estado queda guardado en el relé.** Si se te bloquea el móvil, pasas de wifi a datos o recargas sin querer, al volver te pones al día solo.
- **Se puede reanudar.** Tu reparto y la sala se guardan 6 horas en el móvil. Al abrir la app te sale el botón para volver a entrar.
- **Los mensajes se reintentan** hasta 5 veces si se pierde alguno.
- **Late cada 7 segundos.** La barra de arriba te dice si el otro sigue ahí.

### Tu paladar

**No sale nunca de tu móvil.** Solo se envía el valor de una carta en el instante en que la revelas — que es cuando pasa a ser pública igualmente. Está comprobado en las pruebas: la instantánea que se sincroniza no contiene los paladares.

El relé es público. El código de sala es lo único que separa vuestra partida de las demás: para un prototipo sobra, pero no es un canal privado.

### Si algo falla

- Botón **Reintentar**: vuelve a probar los tres relés desde cero.
- Los dos tenéis que tener la **misma versión**: si actualizas `index.html`, sube el número de `sw.js` y recargad los dos.
- La partida la lleva quien creó la sala. Si esa persona cierra del todo, se acaba.

### Si algún día quieres uptime garantizado

Los relés son públicos y gratuitos, sin garantía de servicio. Para una prueba abierta con desconocidos, cambia la lista `BROKERS` del `index.html` por un broker propio (**HiveMQ Cloud** tiene plan gratuito con cuenta) o sustituye la sección `/* RED */` por **Firebase Realtime Database**. La interfaz interna es de tres funciones (`netConnect`, `pub`, `onData`), así que el cambio es pequeño.
