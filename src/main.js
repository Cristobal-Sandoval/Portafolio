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
    wallpaperSelect.querySelectorAll(".wallpaper-list-item").forEach(item => {
      item.classList.toggle("selected", item.getAttribute("data-value") === savedWallpaper);
    });
  }
  if (crtScreenPreview && wallpaperBackgrounds[savedWallpaper]) {
    crtScreenPreview.style.backgroundImage = wallpaperBackgrounds[savedWallpaper];
    crtScreenPreview.style.backgroundSize = "cover";
  }

  // Detect mobile device
  const mobileMedia = window.matchMedia("(max-width: 768px)");
  let isMobile = mobileMedia.matches;
  mobileMedia.addEventListener("change", (e) => {
    isMobile = e.matches;
  });

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
        const vw = window.innerWidth;

        aboutWin.style.top = "40px";
        aboutWin.style.left = "60px";
        aboutWin.style.width = "620px";
        aboutWin.style.height = "auto";

        if (vw < 1400) {
          projectsWin.style.top = "40px";
          projectsWin.style.left = "520px";
          projectsWin.style.width = `${Math.min(760, vw - 550)}px`;
        } else {
          projectsWin.style.top = "40px";
          projectsWin.style.left = "530px";
          projectsWin.style.width = "760px";
        }
        projectsWin.style.height = "480px";

        contactWin.style.top = "380px";
        contactWin.style.left = "120px";
        contactWin.style.width = "550px";
        contactWin.style.height = "auto";
      }

      if (isMobile) {
        openWindowWithoutClickSound("win-about");
      } else {
        openWindowWithoutClickSound("win-contact");
        openWindowWithoutClickSound("win-projects");
        openWindowWithoutClickSound("win-about");
      }
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
    if (allProgsFlyout) allProgsFlyout.classList.add("hidden");
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

      if (!win.classList.contains("hidden") && !state.minimized) {
        const titleTextEl = win.querySelector(".title-bar-text") || win.querySelector(".winamp-title-text");
        const titleText = titleTextEl ? titleTextEl.textContent.trim() : "Ventana";
        
        let iconSrc = "";
        if (winId === "win-winamp") {
          iconSrc = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' fill='%231e1e24'/><path d='M9 2L4 9h3v5l5-7H9z' fill='%23ffea00'/></svg>";
        } else {
          const titleIconImg = win.querySelector(".win-title-icon");
          iconSrc = titleIconImg ? titleIconImg.getAttribute("src") : "";
        }

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

  // --- 6. ARRASTRE DE VENTANAS (MOUSE & TOUCH UNIFICADO) ---
  function initDrag(win, startClientX, startClientY) {
    if (windowRegistry[win.id].maximized) return;
    focusWindow(win.id);

    let startX = startClientX;
    let startY = startClientY;
    let initialLeft = parseInt(win.style.left) || 0;
    let initialTop = parseInt(win.style.top) || 0;

    function moveHandler(dx, dy) {
      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;
      const winWidth = win.offsetWidth;
      const minLeft = -winWidth / 2;
      const maxLeft = window.innerWidth - (winWidth / 2);
      const minTop = 0;
      const maxTop = window.innerHeight - 40;
      newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
      newTop = Math.max(minTop, Math.min(maxTop, newTop));
      win.style.left = `${newLeft}px`;
      win.style.top = `${newTop}px`;
    }

    function onMouseMove(e) { moveHandler(e.clientX - startX, e.clientY - startY); }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    function onTouchMove(e) {
      const t = e.touches[0];
      moveHandler(t.clientX - startX, t.clientY - startY);
    }
    function onTouchEnd() {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
  }

  windowsList.forEach(win => {
    const titleBar = win.querySelector(".title-bar");
    if (!titleBar) return;

    titleBar.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      e.preventDefault();
      initDrag(win, e.clientX, e.clientY);
    });

    titleBar.addEventListener("touchstart", (e) => {
      if (e.target.closest("button")) return;
      const touch = e.touches[0];
      initDrag(win, touch.clientX, touch.clientY);
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
        if (allProgsFlyout) allProgsFlyout.classList.add("hidden");
        startButton?.classList.remove("active");
      }
    });
  });

  // Flyout "Todos los programas"
  const allProgsTrigger = document.getElementById("all-programs-trigger");
  const allProgsFlyout = document.getElementById("all-programs-flyout");
  if (allProgsTrigger && allProgsFlyout) {
    allProgsTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      allProgsFlyout.classList.toggle("hidden");
    });
    // Cerrar flyout al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!allProgsFlyout.classList.contains("hidden") &&
          !allProgsTrigger.contains(e.target) &&
          !allProgsFlyout.contains(e.target)) {
        allProgsFlyout.classList.add("hidden");
      }
    });
    // Clic en items del flyout
    allProgsFlyout.querySelectorAll(".flyout-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-window");
        if (id) openWindow(id);
        startMenu.classList.add("hidden");
        startButton?.classList.remove("active");
        allProgsFlyout.classList.add("hidden");
      });
    });
  }

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
        window.open(targetLink, "_blank", "noopener,noreferrer");
      } else {
        updateProjectsSidebar(item);
      }
    });

    item.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      if (targetLink) {
        playClick();
        window.open(targetLink, "_blank", "noopener,noreferrer");
      }
    });
  });

  document.getElementById("win-projects")?.addEventListener("click", () => {
    explorerItems.forEach(i => i.classList.remove("selected"));
  });

  // --- 9. PERSONALIZACIÓN DE FONDOS DE PANTALLA ---
  function getSelectedWallpaper() {
    const selectedItem = wallpaperSelect?.querySelector(".wallpaper-list-item.selected");
    return selectedItem?.getAttribute("data-value") || "bliss";
  }

  function setSelectedWallpaper(value) {
    wallpaperSelect?.querySelectorAll(".wallpaper-list-item").forEach(item => {
      item.classList.toggle("selected", item.getAttribute("data-value") === value);
    });
  }

  wallpaperSelect?.addEventListener("click", (e) => {
    const item = e.target.closest(".wallpaper-list-item");
    if (!item) return;
    setSelectedWallpaper(item.getAttribute("data-value"));
    const val = item.getAttribute("data-value");
    const bg = wallpaperBackgrounds[val];
    if (crtScreenPreview && bg) {
      crtScreenPreview.style.backgroundImage = bg;
      crtScreenPreview.style.backgroundSize = "cover";
    }
  });

  function applyWallpaper() {
    playClick();
    const selectedVal = getSelectedWallpaper();
    const backgroundVal = wallpaperBackgrounds[selectedVal];
    if (desktop && backgroundVal) {
      desktop.style.backgroundImage = backgroundVal;
      desktop.style.backgroundSize = "cover";
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

    const menuW = 145;
    const menuH = contextMenu.offsetHeight || 180;
    let left = Math.min(e.clientX, window.innerWidth - menuW);
    let top = Math.min(e.clientY, window.innerHeight - menuH);
    contextMenu.style.left = `${Math.max(0, left)}px`;
    contextMenu.style.top = `${Math.max(0, top)}px`;
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
    const senderMe = document.createElement("span");
    senderMe.className = "msn-sender";
    senderMe.textContent = "Tú dice:";
    const textMe = document.createElement("span");
    textMe.className = "msn-text";
    textMe.textContent = text;
    msgMe.appendChild(senderMe);
    msgMe.appendChild(textMe);
    msnHistory.appendChild(msgMe);
    msnInput.value = "";

    msnHistory.scrollTop = msnHistory.scrollHeight;

    // Disparar mailto para redactar el correo con el mensaje escrito
    setTimeout(() => {
      window.location.href = `mailto:cristobal.sandoval.balboa@gmail.com?subject=Mensaje desde Portafolio MSN&body=${encodeURIComponent(text)}`;
    }, 400);

    // Mensaje automático en el chat confirmando el envío
    setTimeout(() => {
      const msgThem = document.createElement("div");
      msgThem.className = "msn-msg msn-msg-them";
      const senderThem = document.createElement("span");
      senderThem.className = "msn-sender";
      senderThem.textContent = "Cristóbal dice:";
      const textThem = document.createElement("span");
      textThem.className = "msn-text";
      textThem.textContent = "¡Perfecto! He abierto tu cliente de correo para que envíes el mensaje. ¡Estaré atento a mi bandeja de entrada!";
      msgThem.appendChild(senderThem);
      msgThem.appendChild(textThem);
      msnHistory.appendChild(msgThem);
      msnHistory.scrollTop = msnHistory.scrollHeight;
    }, 1200);
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
    window.open("https://github.com/Cristobal-Sandoval", "_blank", "noopener,noreferrer");
  });

  document.getElementById("msn-tb-cv")?.addEventListener("click", () => {
    playClick();
    openWindow("win-cv");
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
    }, { once: true });
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
    window.print();
  });

  // Zoom de CV
  let cvZoomLevel = 100;
  const cvZoomLevels = [75, 100, 125, 150];
  const cvPages = document.querySelectorAll("#win-cv .pdf-page");
  const cvZoomLabel = document.getElementById("cv-zoom-label");
  const btnZoomIn = document.getElementById("btn-zoom-in");
  const btnZoomOut = document.getElementById("btn-zoom-out");

  function applyCvZoom(level) {
    cvZoomLevel = level;
    cvPages.forEach(p => {
      p.className = p.className.replace(/zoom-\d+/g, "").trim();
      p.classList.add("zoom-" + level);
    });
    if (cvZoomLabel) cvZoomLabel.textContent = level + "%";
  }

  btnZoomIn?.addEventListener("click", () => {
    const idx = cvZoomLevels.indexOf(cvZoomLevel);
    if (idx < cvZoomLevels.length - 1) applyCvZoom(cvZoomLevels[idx + 1]);
  });

  btnZoomOut?.addEventListener("click", () => {
    const idx = cvZoomLevels.indexOf(cvZoomLevel);
    if (idx > 0) applyCvZoom(cvZoomLevels[idx - 1]);
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

  // ==========================================================================
  // --- WINAMP AUDIO PLAYER CONTROLLER ---
  // ==========================================================================
  const winampTracks = [
    {
      title: "The Lift - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Lift.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    },
    {
      title: "Blippy Trance - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Blippy%20Trance.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    },
    {
      title: "Cut Trance - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cut%20Trance.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    },
    {
      title: "Mesmerize - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Mesmerize.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    },
    {
      title: "Rising Tide - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Rising%20Tide.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    },
    {
      title: "Fluidscape - Kevin MacLeod",
      url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Fluidscape.mp3",
      kbps: 320,
      khz: 44,
      duration: "00:00"
    }
  ];

  let currentTrackIdx = 0;
  let winampIsPlaying = false;
  let winampShuffle = false;
  let winampRepeat = false;
  const winampAudio = new Audio();
  winampAudio.type = "audio/mpeg";

  // DOM Elements
  const winampWin = document.getElementById("win-winamp");
  const winampDragHandle = document.getElementById("winamp-drag-handle");
  const winampBtnClose = document.getElementById("winamp-btn-close");
  const winampBtnMin = document.getElementById("winamp-btn-minimize");
  const winampSongTitleEl = document.getElementById("winamp-song-title");
  const winampTimeEl = document.getElementById("winamp-time");
  const winampKbpsEl = document.getElementById("winamp-info-kbps");
  const winampKhzEl = document.getElementById("winamp-info-khz");
  const winampVolumeSlider = document.getElementById("winamp-volume-slider");
  const winampPlaylistList = document.getElementById("winamp-playlist-list");
  const winampProgressSlider = document.getElementById("winamp-progress-slider");
  
  // Status indicators
  const winampStatusPlay = document.getElementById("winamp-status-play");
  const winampStatusPause = document.getElementById("winamp-status-pause");
  
  // Panels
  const plEditor = winampWin?.querySelector(".winamp-playlist-editor");
  const eqWindow = winampWin?.querySelector(".winamp-equalizer-window");

  // Panel Toggles
  const togglePlBtn = document.getElementById("winamp-toggle-pl");
  const toggleEqBtn = document.getElementById("winamp-toggle-eq");

  // Control buttons
  const btnPrev = document.getElementById("winamp-btn-prev");
  const btnPlay = document.getElementById("winamp-btn-play");
  const btnPause = document.getElementById("winamp-btn-pause");
  const btnStop = document.getElementById("winamp-btn-stop");
  const btnNext = document.getElementById("winamp-btn-next");
  const btnEject = document.getElementById("winamp-btn-eject");
  
  // Shuffle/Repeat
  const btnShuffle = document.getElementById("winamp-btn-shuffle");
  const btnRepeat = document.getElementById("winamp-btn-repeat");

  // Track counts & footer
  const playlistCountEl = document.getElementById("playlist-track-count");
  const playlistTimeEl = document.getElementById("playlist-total-time");

  // Canvas for visualizer
  const canvas = document.getElementById("winamp-visualizer");
  const ctx = canvas ? canvas.getContext("2d") : null;

  // Ticker state
  let tickerOffset = 0;
  let tickerInterval = null;

  // Visualizer con osciloscopio simulado (no requiere Web Audio API ni CORS)
  let visAnimId = null;
  let visPeaks = new Array(16).fill(0);
  let visPeakSpeed = new Array(16).fill(0.5);

  function drawVisualizerLoop() {
    if (!winampIsPlaying || !ctx) { drawBlankVisualizer(); return; }
    visAnimId = requestAnimationFrame(drawVisualizerLoop);

    const seed = winampAudio.currentTime || 0;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bw = 3, bg = 1;
    for (let i = 0; i < 16; i++) {
      const val = Math.abs(Math.sin(seed * (3 + i * 0.7) + i * 0.3)) * 0.7
                + Math.abs(Math.sin(seed * (1.2 + i * 0.4))) * 0.3;
      const h = Math.floor(val * 14);
      const x = i * (bw + bg);
      const y = canvas.height - h;
      let color;
      if (h < 4) color = "#00e100";
      else if (h < 9) color = "#80e100";
      else if (h < 12) color = "#e1e100";
      else color = "#e14000";
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, h);
      if (h > visPeaks[i]) { visPeaks[i] = h; visPeakSpeed[i] = 0.3; }
      else { visPeaks[i] = Math.max(0, visPeaks[i] - visPeakSpeed[i]); visPeakSpeed[i] += 0.02; }
      if (visPeaks[i] > 0) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, Math.max(0, canvas.height - visPeaks[i] - 1), bw, 1);
      }
    }
  }

  function drawBlankVisualizer() {
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#003300";
    ctx.fillRect(2, canvas.height / 2, canvas.width - 4, 1);
  }

  // Registrar drag y drop
  if (winampWin && winampDragHandle) {
    winampDragHandle.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      e.preventDefault();
      initDrag(winampWin, e.clientX, e.clientY);
    });
    winampDragHandle.addEventListener("touchstart", (e) => {
      if (e.target.closest("button")) return;
      const touch = e.touches[0];
      initDrag(winampWin, touch.clientX, touch.clientY);
    }, { passive: true });
  }

  if (winampBtnClose) winampBtnClose.addEventListener("click", () => {
    winampAudio.pause();
    winampAudio.currentTime = 0;
    winampIsPlaying = false;
    if (winampTimeEl) winampTimeEl.textContent = "00:00";
    if (winampProgressSlider) winampProgressSlider.value = 0;
    stopTicker();
    drawBlankVisualizer();
    closeWindow("win-winamp");
  });
  if (winampBtnMin) winampBtnMin.addEventListener("click", () => minimizeWindow("win-winamp"));

  // Toggle Playlist
  togglePlBtn?.addEventListener("click", () => {
    const isHidden = plEditor?.classList.toggle("hidden");
    togglePlBtn.classList.toggle("active", !isHidden);
  });

  // Toggle Equalizer
  toggleEqBtn?.addEventListener("click", () => {
    const isHidden = eqWindow?.classList.toggle("hidden");
    toggleEqBtn.classList.toggle("active", !isHidden);
  });

  // Shuffle / Repeat clicks
  btnShuffle?.addEventListener("click", () => {
    winampShuffle = !winampShuffle;
    btnShuffle.classList.toggle("active", winampShuffle);
  });

  btnRepeat?.addEventListener("click", () => {
    winampRepeat = !winampRepeat;
    btnRepeat.classList.toggle("active", winampRepeat);
  });

  // Inicializar volumen
  if (winampVolumeSlider) {
    winampAudio.volume = parseFloat(winampVolumeSlider.value) / 100;
    winampVolumeSlider.addEventListener("input", (e) => {
      winampAudio.volume = parseFloat(e.target.value) / 100;
    });
  }

  // Renderizar Playlist
  function renderPlaylist() {
    if (!winampPlaylistList) return;
    winampPlaylistList.innerHTML = "";
    
    let totalSeconds = 0;

    winampTracks.forEach((track, idx) => {
      const item = document.createElement("div");
      item.className = `playlist-track-item ${idx === currentTrackIdx ? 'active' : ''}`;
      
      const titleSpan = document.createElement("span");
      titleSpan.textContent = `${idx + 1}. ${track.title}`;
      
      const durationSpan = document.createElement("span");
      durationSpan.textContent = track.duration;
      
      item.appendChild(titleSpan);
      item.appendChild(durationSpan);
      
      item.addEventListener("click", () => {
        currentTrackIdx = idx;
        loadAndPlayTrack();
      });

      winampPlaylistList.appendChild(item);

      // Calcular tiempo total
      const parts = track.duration.split(":");
      totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
    });

    if (playlistCountEl) {
      playlistCountEl.textContent = `${winampTracks.length} canciones`;
    }
    if (playlistTimeEl) {
      const min = Math.floor(totalSeconds / 60);
      const sec = totalSeconds % 60;
      playlistTimeEl.textContent = `${min}:${sec < 10 ? '0' + sec : sec}`;
    }
  }

  // Ticker animado estilo Winamp (smooth marquee usando requestAnimationFrame)
  let tickerScrollText = "";
  function startTicker(title) {
    if (tickerInterval) { cancelAnimationFrame(tickerInterval); tickerInterval = null; }
    tickerOffset = 0;
    tickerScrollText = ` *** ${title.toUpperCase()} ***     `;
    if (winampSongTitleEl) {
      let lastTime = 0;
      const step = 1;
      function tick(timestamp) {
        if (!lastTime) lastTime = timestamp;
        if (timestamp - lastTime > 180) {
          tickerOffset = (tickerOffset + step) % tickerScrollText.length;
          winampSongTitleEl.textContent = tickerScrollText.slice(tickerOffset) + tickerScrollText.slice(0, tickerOffset);
          lastTime = timestamp;
        }
        tickerInterval = requestAnimationFrame(tick);
      }
      tickerInterval = requestAnimationFrame(tick);
    }
  }

  function stopTicker() {
    if (tickerInterval) { cancelAnimationFrame(tickerInterval); tickerInterval = null; }
    if (winampSongTitleEl) {
      winampSongTitleEl.textContent = winampTracks[currentTrackIdx] ? winampTracks[currentTrackIdx].title : "Winamp Detenido";
    }
  }

  // Cargar y reproducir
  function loadAndPlayTrack() {
    const track = winampTracks[currentTrackIdx];
    if (!track) return;

    winampAudio.src = track.url;
    winampAudio.load();

    winampIsPlaying = true;
    winampAudio.play().catch(err => {
      console.log("Reproducción bloqueada por el navegador:", err);
      winampIsPlaying = false;
      stopTicker();
      drawBlankVisualizer();
    });

    // Actualizar iconos de estado
    winampStatusPlay?.classList.remove("hidden");
    winampStatusPause?.classList.add("hidden");

    if (winampKbpsEl) winampKbpsEl.textContent = track.kbps;
    if (winampKhzEl) winampKhzEl.textContent = track.khz;

    startTicker(track.title);
    renderPlaylist();

    visPeaks = new Array(16).fill(0);
    visPeakSpeed = new Array(16).fill(0.5);

    if (winampIsPlaying) {
      cancelAnimationFrame(visAnimId);
      drawVisualizerLoop();
    }
  }

  // Eventos de reproducción
  winampAudio.addEventListener("timeupdate", () => {
    const current = winampAudio.currentTime;
    const min = Math.floor(current / 60);
    const sec = Math.floor(current % 60);
    const dur = winampAudio.duration || 0;
    const dMin = Math.floor(dur / 60);
    const dSec = Math.floor(dur % 60);
    if (winampTimeEl) {
      if (dur && isFinite(dur)) {
        winampTimeEl.textContent = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}/${dMin < 10 ? '0' + dMin : dMin}:${dSec < 10 ? '0' + dSec : dSec}`;
      } else {
        winampTimeEl.textContent = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
      }
    }

    // Sincronizar barra de progreso si no se está arrastrando
    if (winampProgressSlider && !winampProgressSlider.classList.contains("dragging")) {
      const pct = (winampAudio.currentTime / (dur || 1)) * 100;
      winampProgressSlider.value = pct || 0;
    }
  });

  // Controlar arrastre en barra de progreso
  if (winampProgressSlider) {
    winampProgressSlider.addEventListener("mousedown", () => {
      winampProgressSlider.classList.add("dragging");
    });
    winampProgressSlider.addEventListener("mouseup", () => {
      winampProgressSlider.classList.remove("dragging");
    });
    winampProgressSlider.addEventListener("change", (e) => {
      const pct = parseFloat(e.target.value) / 100;
      if (winampAudio.duration) {
        winampAudio.currentTime = winampAudio.duration * pct;
      }
    });
  }

  winampAudio.addEventListener("ended", () => {
    if (winampRepeat) {
      loadAndPlayTrack();
    } else if (winampShuffle) {
      currentTrackIdx = Math.floor(Math.random() * winampTracks.length);
      loadAndPlayTrack();
    } else {
      currentTrackIdx = (currentTrackIdx + 1) % winampTracks.length;
      loadAndPlayTrack();
    }
  });

  winampAudio.addEventListener("error", (e) => {
    console.error("Error en winampAudio:", e);
    winampIsPlaying = false;
    stopTicker();
    drawBlankVisualizer();
    if (winampTimeEl) winampTimeEl.textContent = "ERR";
  });

  // Obtener duración real al cargar metadatos
  winampAudio.addEventListener("loadedmetadata", () => {
    const dur = winampAudio.duration;
    if (dur && isFinite(dur)) {
      const track = winampTracks[currentTrackIdx];
      if (track) {
        const min = Math.floor(dur / 60);
        const sec = Math.floor(dur % 60);
        track.duration = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
        renderPlaylist();
      }
    }
  });

  // Vinculación de Botones
  btnPlay?.addEventListener("click", () => {
    winampStatusPlay?.classList.remove("hidden");
    winampStatusPause?.classList.add("hidden");

    if (winampAudio.src && winampAudio.src !== window.location.href && !winampAudio.ended) {
      winampIsPlaying = true;
      winampAudio.play().catch(() => { winampIsPlaying = false; });
      startTicker(winampTracks[currentTrackIdx].title);
      visPeaks = new Array(16).fill(0);
      visPeakSpeed = new Array(16).fill(0.5);
      cancelAnimationFrame(visAnimId);
      drawVisualizerLoop();
    } else {
      loadAndPlayTrack();
    }
  });

  btnPause?.addEventListener("click", () => {
    winampAudio.pause();
    winampIsPlaying = false;
    winampStatusPlay?.classList.add("hidden");
    winampStatusPause?.classList.remove("hidden");
    stopTicker();
    drawBlankVisualizer();
  });

  btnStop?.addEventListener("click", () => {
    winampAudio.pause();
    winampAudio.currentTime = 0;
    winampIsPlaying = false;
    winampStatusPlay?.classList.add("hidden");
    winampStatusPause?.classList.add("hidden");
    if (winampTimeEl) winampTimeEl.textContent = "00:00";
    if (winampProgressSlider) winampProgressSlider.value = 0;
    stopTicker();
    drawBlankVisualizer();
  });

  btnNext?.addEventListener("click", () => {
    currentTrackIdx = (currentTrackIdx + 1) % winampTracks.length;
    loadAndPlayTrack();
  });

  btnPrev?.addEventListener("click", () => {
    currentTrackIdx = (currentTrackIdx - 1 + winampTracks.length) % winampTracks.length;
    loadAndPlayTrack();
  });

  btnEject?.addEventListener("click", () => {
    const url = prompt("Escribe o pega la dirección URL de un archivo de música MP3 para reproducir:");
    if (url) {
      const title = prompt("Escribe el nombre de la canción:", "Canción personalizada");
      winampTracks.push({
        title: title || "Canción de Internet",
        url: url,
        kbps: 128,
        khz: 44,
        duration: "00:00"
      });
      currentTrackIdx = winampTracks.length - 1;
      loadAndPlayTrack();
    }
  });

  // Inicializar componentes
  renderPlaylist();
  drawBlankVisualizer();

});
