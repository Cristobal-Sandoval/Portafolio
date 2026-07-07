// Windows XP Interactive Logic - Cristóbal Sandoval Portfolio

document.addEventListener("DOMContentLoaded", () => {
  // --- SOUNDS ---
  const startupSound = new Audio('/sounds/startup.mp3');
  const errorSound = new Audio('/sounds/error.wav');
  const clickSound = new Audio('/sounds/click.wav');

  function playStartup() {
    startupSound.currentTime = 0;
    startupSound.play().catch(err => console.log("Audio play blocked by browser:", err));
  }

  // Set sound volume
  startupSound.volume = 0.85;

  function playClick() {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }

  function playError() {
    errorSound.currentTime = 0;
    errorSound.play().catch(() => {});
  }

  // --- STATE & DOM ELEMENTS ---
  const desktop = document.getElementById("desktop");
  const windowsList = document.querySelectorAll(".window");
  const desktopIcons = document.querySelectorAll(".desktop-icon");
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const clockElement = document.getElementById("clock");
  const activeTasksContainer = document.getElementById("active-tasks");
  const shutdownScreen = document.getElementById("shutdown-screen");
  
  // Wallpaper changer elements
  const propertiesWindow = document.getElementById("win-properties");
  const crtScreenPreview = document.getElementById("crt-screen-preview");
  const wallpaperSelect = document.getElementById("wallpaper-select");
  const btnApplyWallpaper = document.getElementById("btn-apply-wallpaper");
  const btnOkWallpaper = document.getElementById("btn-ok-wallpaper");
  const btnCancelWallpaper = document.getElementById("btn-cancel-wallpaper");
  
  // Context Menu
  const contextMenu = document.getElementById("desktop-context-menu");

  let zIndexCounter = 100;
  const windowRegistry = {}; 

  // Wallpaper database definitions (Authentic Windows XP files)
  const wallpaperBackgrounds = {
    bliss: "url('/wallpapers/bliss.jpg')",
    autumn: "url('/wallpapers/autumn.jpg')",
    ascent: "url('/wallpapers/ascent.jpg')",
    azul: "url('/wallpapers/azul_classic.jpg')"
  };

  // Set default crt screen preview and desktop background from localStorage
  const savedWallpaper = localStorage.getItem("desktop-wallpaper") || "bliss";
  if (desktop && wallpaperBackgrounds[savedWallpaper]) {
    desktop.style.backgroundImage = wallpaperBackgrounds[savedWallpaper];
    desktop.style.backgroundSize = "cover";
  }
  if (wallpaperSelect) {
    wallpaperSelect.value = savedWallpaper;
  }
  if (crtScreenPreview && wallpaperBackgrounds[savedWallpaper]) {
    crtScreenPreview.style.backgroundImage = wallpaperBackgrounds[savedWallpaper];
    crtScreenPreview.style.backgroundSize = "cover";
  }

  // Detect mobile device
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Initialize Window Registry
  windowsList.forEach(win => {
    const winId = win.id;
    windowRegistry[winId] = {
      minimized: true,
      maximized: false,
      prevTop: win.style.top,
      prevLeft: win.style.left,
      prevWidth: win.style.width,
      prevHeight: win.style.height
    };
    win.classList.add("hidden");
  });

  // --- 1. CARGA DIRECTA Y ONE-TIME STARTUP SOUND ON INTERACTION ---
  let startupSoundPlayed = false;
  
  function triggerStartupSound() {
    if (!startupSoundPlayed) {
      playStartup();
      startupSoundPlayed = true;
      // Remover listeners una vez activado
      document.removeEventListener("click", triggerStartupSound);
      document.removeEventListener("touchstart", triggerStartupSound);
      document.removeEventListener("keydown", triggerStartupSound);
    }
  }

  // Registrar listeners de interacción para desbloquear audio
  document.addEventListener("click", triggerStartupSound);
  document.addEventListener("touchstart", triggerStartupSound);
  document.addEventListener("keydown", triggerStartupSound);

  // Mostrar el escritorio y barra de tareas inmediatamente al cargar
  if (desktop) {
    desktop.classList.remove("hidden");
  }
  if (startButton && startButton.parentElement) {
    startButton.parentElement.classList.remove("hidden"); // Mostrar barra de tareas
  }

  // Abrir y distribuir automáticamente las tres ventanas principales al iniciar
  distributeInitialWindows();

  // Configurar las posiciones de las ventanas en PC y abrirlas ordenadamente al iniciar
  function distributeInitialWindows() {
    const aboutWin = document.getElementById("win-about");
    const projectsWin = document.getElementById("win-projects");
    const contactWin = document.getElementById("win-contact");

    if (aboutWin && projectsWin && contactWin) {
      if (!isMobile) {
        // Mi Información (Bio) - Superior izquierda
        aboutWin.style.top = "40px";
        aboutWin.style.left = "60px";
        aboutWin.style.width = "440px";
        aboutWin.style.height = "auto";
        
        // Mis Proyectos - Derecha (amplia y alineada con la barra de tareas)
        projectsWin.style.top = "40px";
        projectsWin.style.left = "530px";
        projectsWin.style.width = "760px";
        projectsWin.style.height = "480px";
        
        // MSN Messenger - Abajo al centro/izquierda
        contactWin.style.top = "380px";
        contactWin.style.left = "120px";
        contactWin.style.width = "550px";
        contactWin.style.height = "auto";
      }

      // Abrir las tres ventanas ordenadamente al iniciar (Mi Información, Proyectos, Contacto)
      openWindowWithoutClickSound("win-contact");
      openWindowWithoutClickSound("win-projects");
      openWindowWithoutClickSound("win-about");
    }
  }

  // Abrir ventana sin reproducir el sonido de clic de navegación normal de apertura
  function openWindowWithoutClickSound(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    win.classList.remove("hidden");
    windowRegistry[winId].minimized = false;
    
    // Enfocar
    windowsList.forEach(w => w.classList.remove("active-window"));
    zIndexCounter += 1;
    win.style.zIndex = zIndexCounter;
    win.classList.add("active-window");

    syncTaskbarButtons();
  }

  // --- 2. RELOJ EXACTO DEL SYSTEM TRAY ---
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    clockElement.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // --- 3. MENÚ DE INICIO ---
  startButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    const isHidden = startMenu.classList.toggle("hidden");
    startButton.classList.toggle("active");
    startButton.setAttribute("aria-expanded", !isHidden);
  });

  // Cerrar menús al hacer clic en el escritorio
  document.addEventListener("click", () => {
    startMenu.classList.add("hidden");
    startButton?.classList.remove("active");
    startButton?.setAttribute("aria-expanded", "false");
    contextMenu.classList.add("hidden");
    desktopIcons.forEach(icon => icon.classList.remove("selected"));
  });

  startMenu?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // --- 4. SELECCIÓN DE ICONOS DE ESCRITORIO ---
  desktopIcons.forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      contextMenu.classList.add("hidden");
      desktopIcons.forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
    });

    icon.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      const targetWindowId = icon.getAttribute("data-window");
      openWindow(targetWindowId);
    });
    
    icon.addEventListener("touchend", (e) => {
      if (icon.classList.contains("selected")) {
        e.preventDefault();
        const targetWindowId = icon.getAttribute("data-window");
        openWindow(targetWindowId);
      }
    });
  });

  // --- 5. GESTIÓN DE VENTANAS ---
  function focusWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    windowsList.forEach(w => w.classList.remove("active-window"));
    
    zIndexCounter += 1;
    win.style.zIndex = zIndexCounter;
    win.classList.add("active-window");
    
    const taskBtns = activeTasksContainer.querySelectorAll(".task-item");
    taskBtns.forEach(btn => {
      if (btn.getAttribute("data-window") === winId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function openWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    playClick();
    win.classList.remove("hidden");
    windowRegistry[winId].minimized = false;
    
    focusWindow(winId);
    syncTaskbarButtons();
  }

  // Forzar foco directo cuando se hace clic desde tareas o enlaces
  window.openWindowExternal = function(winId) {
    openWindow(winId);
  };

  function minimizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    playClick();
    win.classList.add("hidden");
    windowRegistry[winId].minimized = true;
    win.classList.remove("active-window");
    
    const taskBtn = activeTasksContainer.querySelector(`.task-item[data-window="${winId}"]`);
    if (taskBtn) {
      taskBtn.classList.remove("active");
    }
  }

  function toggleMaximizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    playClick();
    const state = windowRegistry[winId];
    if (state.maximized) {
      win.style.top = state.prevTop;
      win.style.left = state.prevLeft;
      win.style.width = state.prevWidth;
      win.style.height = state.prevHeight;
      win.classList.remove("maximized");
      state.maximized = false;
    } else {
      state.prevTop = win.style.top;
      state.prevLeft = win.style.left;
      state.prevWidth = win.style.width;
      state.prevHeight = win.style.height;

      win.style.top = "0";
      win.style.left = "0";
      win.style.width = "100vw";
      win.style.height = "calc(100vh - 40px)";
      win.classList.add("maximized");
      state.maximized = true;
    }
  }

  function closeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;

    playClick();
    win.classList.add("hidden");
    windowRegistry[winId].minimized = true;
    syncTaskbarButtons();
  }

  function syncTaskbarButtons() {
    activeTasksContainer.innerHTML = "";

    windowsList.forEach(win => {
      const winId = win.id;
      const state = windowRegistry[winId];

      if (!win.classList.contains("hidden") || !state.minimized) {
        const titleText = win.querySelector(".title-bar-text").textContent.trim();
        const titleIconImg = win.querySelector(".win-title-icon");
        const iconSrc = titleIconImg ? titleIconImg.getAttribute("src") : "";

        const btn = document.createElement("button");
        btn.className = "task-item";
        btn.setAttribute("data-window", winId);

        if (iconSrc) {
          const img = document.createElement("img");
          img.src = iconSrc;
          btn.appendChild(img);
        }

        const textSpan = document.createElement("span");
        textSpan.textContent = titleText;
        btn.appendChild(textSpan);

        if (win.classList.contains("active-window")) {
          btn.classList.add("active");
        }

        btn.addEventListener("click", () => {
          if (win.classList.contains("active-window")) {
            minimizeWindow(winId);
          } else {
            win.classList.remove("hidden");
            windowRegistry[winId].minimized = false;
            focusWindow(winId);
          }
        });

        activeTasksContainer.appendChild(btn);
      }
    });
  }

  // Forzar foco en ventanas al hacer mousedown o touchstart en cualquier parte de ellas
  const focusTriggerEvents = ["mousedown", "touchstart"];
  focusTriggerEvents.forEach(evtType => {
    document.addEventListener(evtType, (e) => {
      const win = e.target.closest(".window");
      if (win) {
        focusWindow(win.id);
      }
    }, { passive: true });
  });

  windowsList.forEach(win => {
    const winId = win.id;
    
    const minBtn = win.querySelector("button[aria-label='Minimize']");
    const maxBtn = win.querySelector("button[aria-label='Maximize']");
    const closeBtn = win.querySelector("button[aria-label='Close']");

    if (minBtn) minBtn.addEventListener("click", () => minimizeWindow(winId));
    if (maxBtn) maxBtn.addEventListener("click", () => toggleMaximizeWindow(winId));
    if (closeBtn) closeBtn.addEventListener("click", () => closeWindow(winId));
  });

  // --- 6. ARRASTRE DE VENTANAS (MOUSE & TOUCH) ---
  windowsList.forEach(win => {
    const titleBar = win.querySelector(".title-bar");
    if (!titleBar) return;

    titleBar.addEventListener("mousedown", (e) => {
      if (e.target.tagName.toLowerCase() === "button") return;
      if (windowRegistry[win.id].maximized || isMobile) return;

      e.preventDefault();
      focusWindow(win.id);

      let startX = e.clientX;
      let startY = e.clientY;
      let initialLeft = parseInt(win.style.left) || 0;
      let initialTop = parseInt(win.style.top) || 0;

      function onMouseMove(moveEvent) {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const winWidth = win.offsetWidth;
        const minLeft = -winWidth / 2;
        const maxLeft = window.innerWidth - (winWidth / 2);
        const minTop = 0;
        const maxTop = window.innerHeight - 80;

        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        newTop = Math.max(minTop, Math.min(maxTop, newTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    titleBar.addEventListener("touchstart", (e) => {
      if (e.target.tagName.toLowerCase() === "button") return;
      if (windowRegistry[win.id].maximized) return;

      focusWindow(win.id);
      const touch = e.touches[0];
      let startX = touch.clientX;
      let startY = touch.clientY;
      let initialLeft = parseInt(win.style.left) || 0;
      let initialTop = parseInt(win.style.top) || 0;

      function onTouchMove(moveEvent) {
        const touchMove = moveEvent.touches[0];
        const deltaX = touchMove.clientX - startX;
        const deltaY = touchMove.clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const winWidth = win.offsetWidth;
        const minLeft = -winWidth / 2;
        const maxLeft = window.innerWidth - (winWidth / 2);
        const minTop = 0;
        const maxTop = window.innerHeight - 80;

        newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
        newTop = Math.max(minTop, Math.min(maxTop, newTop));

        win.style.left = `${newLeft}px`;
        win.style.top = `${newTop}px`;
      }

      function onTouchEnd() {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      }

      document.addEventListener("touchmove", onTouchMove, { passive: true });
      document.addEventListener("touchend", onTouchEnd);
    }, { passive: true });
  });

  // --- 7. ACCESOS DIRECTOS DEL MENÚ DE INICIO Y SIDEBAR ---
  const startMenuItems = document.querySelectorAll(".start-menu-item, .right-menu-item");
  startMenuItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetWindowId = item.getAttribute("data-window");
      if (targetWindowId) {
        openWindow(targetWindowId);
        startMenu.classList.add("hidden");
        startButton?.classList.remove("active");
      }
    });
  });

  document.getElementById("btn-show-cv")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow("win-cv");
  });
  document.getElementById("btn-show-contact")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow("win-contact");
  });
  document.getElementById("btn-show-projects")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow("win-projects");
  });
  document.getElementById("btn-show-experience")?.addEventListener("click", (e) => {
    e.preventDefault();
    openWindow("win-experience");
  });

  // Elementos de la barra lateral de detalles de proyectos
  const sidebarScreenInner = document.getElementById("sidebar-screen-inner");
  const sidebarMetadataName = document.getElementById("sidebar-metadata-name");
  const sidebarMetadataDesc = document.getElementById("sidebar-metadata-desc");
  const sidebarMetadataStatus = document.getElementById("sidebar-metadata-status");
  const sidebarBtnVercel = document.getElementById("sidebar-btn-vercel");
  const sidebarBtnGithub = document.getElementById("sidebar-btn-github");

  function updateProjectsSidebar(item) {
    if (!item) return;
    
    const name = item.getAttribute("data-name") || "Proyecto";
    const desc = item.getAttribute("data-desc") || "";
    const status = item.getAttribute("data-status") || "";
    const url = item.getAttribute("data-url") || "";
    const vercel = item.getAttribute("data-vercel") || "";

    if (sidebarMetadataName) sidebarMetadataName.textContent = name;
    if (sidebarMetadataDesc) sidebarMetadataDesc.textContent = desc;

    if (sidebarMetadataStatus) {
      if (status) {
        sidebarMetadataStatus.textContent = status;
        sidebarMetadataStatus.classList.remove("hidden");
        if (status.toLowerCase().includes("implementaci")) {
          sidebarMetadataStatus.classList.add("implementacion");
        } else {
          sidebarMetadataStatus.classList.remove("implementacion");
        }
      } else {
        sidebarMetadataStatus.classList.add("hidden");
      }
    }

    if (sidebarBtnVercel) {
      if (vercel) {
        sidebarBtnVercel.href = vercel;
        sidebarBtnVercel.classList.remove("hidden");
      } else {
        sidebarBtnVercel.classList.add("hidden");
      }
    }

    if (sidebarBtnGithub) {
      if (url) {
        sidebarBtnGithub.href = url;
        sidebarBtnGithub.classList.remove("hidden");
      } else {
        sidebarBtnGithub.classList.add("hidden");
      }
    }

    if (sidebarScreenInner) {
      const previewScreen = item.querySelector('.video-preview-screen');
      if (previewScreen) {
        sidebarScreenInner.className = "sidebar-screen-inner";
        previewScreen.classList.forEach(c => {
          if (c !== 'video-preview-screen') {
            sidebarScreenInner.classList.add(c);
          }
        });
        const svg = previewScreen.querySelector('svg');
        if (svg) {
          sidebarScreenInner.innerHTML = svg.outerHTML;
        } else {
          sidebarScreenInner.innerHTML = '<span style="font-size:28px;">🌐</span>';
        }
      }
    }
  }

  // --- 8. EXPLORADOR DE PROYECTOS (Mis Proyectos Reales con Panel de Detalles) ---
  const explorerItems = document.querySelectorAll(".explorer-item");
  explorerItems.forEach(item => {
    const url = item.getAttribute("data-url");
    const vercel = item.getAttribute("data-vercel");
    const targetLink = vercel || url;

    item.addEventListener("click", (e) => {
      e.stopPropagation();
      explorerItems.forEach(i => i.classList.remove("selected"));
      item.classList.add("selected");
      playClick();

      if (isMobile && targetLink) {
        window.open(targetLink, "_blank");
      } else {
        updateProjectsSidebar(item);
      }
    });

    item.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (targetLink) {
        playClick();
        window.open(targetLink, "_blank");
      }
    });
  });

  document.getElementById("win-projects")?.addEventListener("click", () => {
    explorerItems.forEach(i => i.classList.remove("selected"));
  });

  // --- 9. PERSONALIZACIÓN DE FONDOS DE PANTALLA ---
  wallpaperSelect?.addEventListener("change", () => {
    if (!wallpaperSelect) return;
    const selectedVal = wallpaperSelect.options[wallpaperSelect.selectedIndex].value;
    const backgroundVal = wallpaperBackgrounds[selectedVal];
    if (crtScreenPreview && backgroundVal) {
      crtScreenPreview.style.backgroundImage = backgroundVal;
      crtScreenPreview.style.backgroundSize = "cover";
    }
  });

  function applyWallpaper() {
    if (!wallpaperSelect) return;
    playClick();
    const selectedVal = wallpaperSelect.options[wallpaperSelect.selectedIndex].value;
    const backgroundVal = wallpaperBackgrounds[selectedVal];
    if (desktop && backgroundVal) {
      desktop.style.backgroundImage = backgroundVal;
      desktop.style.backgroundSize = "cover";
      // Guardar el fondo del escritorio en localStorage
      localStorage.setItem("desktop-wallpaper", selectedVal);
    }
  }

  btnApplyWallpaper?.addEventListener("click", applyWallpaper);
  
  btnOkWallpaper?.addEventListener("click", () => {
    applyWallpaper();
    closeWindow("win-properties");
  });

  btnCancelWallpaper?.addEventListener("click", () => {
    closeWindow("win-properties");
  });

  // --- 10. MENÚ CONTEXTUAL DEL ESCRITORIO ---
  desktop?.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".window") || e.target.closest(".desktop-icon") || e.target.closest("#taskbar")) {
      return;
    }
    e.preventDefault();
    
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.remove("hidden");
  });

  document.getElementById("context-refresh")?.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    contextMenu.classList.add("hidden");
    
    desktop.style.opacity = "0.5";
    setTimeout(() => {
      desktop.style.opacity = "1";
    }, 150);
  });

  document.getElementById("context-properties")?.addEventListener("click", (e) => {
    e.stopPropagation();
    contextMenu.classList.add("hidden");
    openWindow("win-properties");
  });

  // --- 11. CHAT INTERACTIVO MSN MESSENGER ---
  const msnInput = document.getElementById("msn-input-box");
  const msnSendBtn = document.getElementById("msn-send-btn");
  const msnHistory = document.getElementById("msn-chat-history");

  function sendMsnMessage() {
    const text = msnInput.value.trim();
    if (!text) return;

    playClick();

    const msgMe = document.createElement("div");
    msgMe.className = "msn-msg msn-msg-me";
    msgMe.innerHTML = `
      <span class="msn-sender">Tú dice:</span>
      <span class="msn-text">${text}</span>
    `;
    msnHistory.appendChild(msgMe);
    msnInput.value = "";
    
    msnHistory.scrollTop = msnHistory.scrollHeight;

    setTimeout(() => {
      const msgThem = document.createElement("div");
      msgThem.className = "msn-msg msn-msg-them";
      
      msgThem.innerHTML = `
        <span class="msn-sender">Cristóbal dice:</span>
        <span class="msn-text">¡Excelente mensaje! Te estoy redirigiendo a tu correo para enviármelo. ¡Hablamos pronto!</span>
      `;
      msnHistory.appendChild(msgThem);
      msnHistory.scrollTop = msnHistory.scrollHeight;

      setTimeout(() => {
        window.location.href = `mailto:cristobal.sandoval.balboa@gmail.com?subject=Mensaje desde el Portafolio&body=${encodeURIComponent(text)}`;
      }, 800);
    }, 1000);
  }

  msnSendBtn?.addEventListener("click", sendMsnMessage);
  msnInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsnMessage();
    }
  });

  // --- BOTONES DE LA BARRA DE HERRAMIENTAS DE MSN ---
  document.getElementById("msn-tb-github")?.addEventListener("click", () => {
    playClick();
    window.open("https://github.com/Cristobal-Sandoval", "_blank");
  });

  document.getElementById("msn-tb-cv")?.addEventListener("click", () => {
    playClick();
    openWindow("win-cv");
  });

  document.getElementById("msn-tb-projects")?.addEventListener("click", () => {
    playClick();
    openWindow("win-projects");
  });

  // --- INTERACTIVIDAD DEL ZUMBIDO DE MSN (Solo de bonito) ---
  const msnZumbidoBtn = document.getElementById("msn-zumbido-btn");
  msnZumbidoBtn?.addEventListener("click", () => {
    playClick();
  });

  // --- 12. DIÁLOGO DE APAGADO ---
  const shutdownBtn = document.getElementById("btn-shutdown");
  const logoffBtn = document.getElementById("btn-logoff");
  const cancelShutdownBtn = document.getElementById("btn-cancel-shutdown");
  const restartPcBtn = document.getElementById("btn-restart-pc");
  const shutdownPcBtn = document.getElementById("btn-shutdown-pc");

  shutdownBtn?.addEventListener("click", () => {
    playClick();
    shutdownScreen.classList.remove("hidden");
    startMenu.classList.add("hidden");
    startButton?.classList.remove("active");
  });

  logoffBtn?.addEventListener("click", () => {
    playClick();
    alert("Cerrando sesión de Cristóbal Sandoval...");
    window.location.reload();
  });

  cancelShutdownBtn?.addEventListener("click", () => {
    playClick();
    shutdownScreen.classList.add("hidden");
  });

  restartPcBtn?.addEventListener("click", () => {
    playClick();
    shutdownScreen.innerHTML = `
      <div style="color: #fff; text-align: center; font-family: Tahoma, sans-serif;">
        <svg viewBox="0 0 24 24" width="48" height="48" style="margin-bottom:15px; fill:#fff;">
          <path d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18A8 8 0 1 1 20 12A8 8 0 0 1 12 20Z"/>
        </svg>
        <h2 style="font-weight:normal; font-size: 20px;">Reiniciando...</h2>
      </div>
    `;
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  });

  shutdownPcBtn?.addEventListener("click", () => {
    playClick();
    shutdownScreen.innerHTML = `
      <div style="color: #fff; text-align: center; font-family: Tahoma, sans-serif;">
        <h2 style="font-weight:normal; font-size: 22px; color: #ff9900; margin-bottom: 10px;">Es seguro apagar su equipo.</h2>
        <p style="font-size:11px; color:#ccc;">Haga clic en cualquier parte para encender nuevamente.</p>
      </div>
    `;
    shutdownScreen.style.backgroundColor = "#000000";
    shutdownScreen.style.backdropFilter = "none";
    
    shutdownScreen.addEventListener("click", () => {
      window.location.reload();
    });
  });

  // --- 13. EFECTO DE SONIDO EN OPCIONES DESHABILITADAS ---
  document.querySelectorAll(".disabled").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      playError();
    });
  });

  // Accesorios extra
  const btnDownloadCv = document.getElementById("btn-download-cv");
  btnDownloadCv?.addEventListener("click", () => {
    alert("Descargando Currículum Vitae de Cristóbal Sandoval...");
  });

  // --- 14. GLOBO DE NOTIFICACIÓN DE WINDOWS XP ---
  const trayBalloon = document.getElementById("tray-balloon");
  const btnCloseBalloon = document.getElementById("btn-close-balloon");

  if (trayBalloon) {
    // Mostrar a los 3 segundos
    setTimeout(() => {
      trayBalloon.classList.remove("hidden");
      // Autocerrar tras 10 segundos
      setTimeout(() => {
        trayBalloon.classList.add("hidden");
      }, 10000);
    }, 3000);

    btnCloseBalloon?.addEventListener("click", (e) => {
      e.stopPropagation();
      playClick();
      trayBalloon.classList.add("hidden");
    });
  }

});
