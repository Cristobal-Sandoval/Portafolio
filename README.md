# Portafolio Profesional: Retro Windows XP & MSN Messenger

¡Bienvenido a mi portafolio interactivo de desarrollo de software! Este sitio está inspirado en la estética nostálgica y el diseño visual de **Windows XP (Luna Theme)** y el mítico cliente de mensajería **MSN Messenger 7.5**.

## 🚀 Tecnologías Utilizadas

El proyecto fue desarrollado desde cero con un enfoque de optimización y fidelidad visual:
*   **Vite**: Entorno de desarrollo ultrarrápido y empaquetador de producción.
*   **HTML5 Semántico**: Para una estructura accesible, limpia y amigable con el SEO.
*   **CSS3 Vanilla**: Implementación directa de gradientes, bordes 3D, relieves (insets), tipografías clásicas (Tahoma, Trebuchet MS) y variables personalizadas para el cambio de wallpapers.
*   **JavaScript (ES6+)**: Lógica dinámica para el arrastre (drag-and-drop), sistema de apilamiento en capas (z-index focus) e interactividad del chat.

---

## 💻 Características Principales

1.  **Entorno Windows XP Realista**:
    *   Fondo de pantalla clásico **Bliss (Felicidad)** oficial.
    *   Menú Inicio funcional con accesos directos y submenú "Todos los programas".
    *   Barra de tareas dinámica que refleja las ventanas abiertas con botones interactivos.
    *   Sistema interactivo de **Propiedades de Pantalla** que permite cambiar el fondo del escritorio en tiempo real.
    *   Ventanas de tamaño fijo sin maximizar (estilo Messenger) para mantener la estética XP consistente.
2.  **Manejo Avanzado de Ventanas (Stacking & Dragging)**:
    *   Ventanas arrastrables mediante su barra de título con detección de bordes.
    *   Sistema de foco tridimensional en capas (`z-index` incremental) que trae la ventana al frente al hacer clic.
3.  **MSN Messenger 7.5 de Alta Fidelidad (Pixel-Perfect)**:
    *   Barra de herramientas superior en forma de ola con punto de estado y botones clásicos.
    *   Historial y encabezado de conversación integrados en un panel redondeado.
    *   Botonera stacked de `Enviar` y `Buscar`.
    *   Avatares detallados con pestañas inferiores desplegables.
    *   Pie publicitario nostálgico (*Ad Banner*).
4.  **Adobe Reader CV Integrado**:
    *   Visualizador simulado de currículum en formato PDF con controles de zoom proporcional desde 75% hasta 200% (150% por defecto en Desktop y 100% por defecto en Mobile con soporte de desplazamiento horizontal).
    *   Botón de descarga nativo enlazado directamente a tu archivo `/CV.pdf`.
5.  **Winamp Player Retro**:
    *   Reproductor de audio con auténtico diseño Winamp (chasis gris-púrpura metalizado con perillas y botonera circular plateada 3D).
    *   Visualizador osciloscopio procedimental que responde en tiempo real a la música.
    *   Playlist shuffle/repeat, barra de progreso a lo ancho de la pantalla y volumen integrado.
    *   6 canciones estilo trance ambiental de Kevin MacLeod alojadas localmente para evitar restricciones de CORS (`public/sounds/`).

---

## 🛠️ Instalación y Uso Local

Para correr el proyecto localmente en tu máquina, sigue estos pasos:

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/Cristobal-Sandoval/Portafolio.git
    cd Portafolio
    ```
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```
    *Abre el enlace provisto por Vite (normalmente [http://localhost:5173](http://localhost:5173)) en tu navegador.*
4.  **Compilar para producción**:
    ```bash
    npm run build
    ```
    *Los archivos listos para desplegar en tu hosting (como Vercel o Netlify) se generarán en la carpeta `dist/`.*

---

Desarrollado con dedicación y nostalgia por **Cristóbal Sandoval**.
