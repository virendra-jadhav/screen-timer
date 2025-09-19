// main.js - Main Electron process
const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
  powerMonitor,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

class ScreenTimeMonitor {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.usageTime = 0; // in seconds
    this.breakThreshold = 30 * 60; // 30 minutes in seconds
    this.isMonitoring = false;
    this.isBreakTime = false;
    this.lastActivityTime = Date.now();
    this.monitorInterval = null;
    this.settingsFile = path.join(__dirname, "settings.json");

    this.loadSettings();
    this.setupApp();
  }

  setupApp() {
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.setupPowerMonitor();
      this.startMonitoring();
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    // IPC handlers
    ipcMain.handle("get-usage-data", () => ({
      usageTime: this.usageTime,
      breakThreshold: this.breakThreshold,
      isMonitoring: this.isMonitoring,
      isBreakTime: this.isBreakTime,
    }));

    ipcMain.handle("toggle-monitoring", () => {
      this.toggleMonitoring();
      return this.isMonitoring;
    });

    ipcMain.handle("reset-timer", () => {
      this.resetTimer();
    });

    ipcMain.handle("save-settings", (event, settings) => {
      this.breakThreshold = settings.breakThresholdMinutes * 60;
      this.saveSettings();
    });

    ipcMain.handle("start-break", () => {
      this.startBreak();
    });

    ipcMain.handle("snooze-break", () => {
      this.snoozeBreak();
    });
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 450,
      height: 400,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "assets", "icon.png"), // Add your icon
      title: "Screen Time Monitor",
    });

    this.mainWindow.loadFile("index.html");

    this.mainWindow.on("close", (event) => {
      if (!app.isQuiting) {
        event.preventDefault();
        this.mainWindow.hide();
        this.showNotification("Screen Time Monitor minimized to tray");
      }
    });
  }

  createTray() {
    this.tray = new Tray(path.join(__dirname, "assets", "tray-icon.png")); // Add your tray icon

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => {
          this.mainWindow.show();
        },
      },
      {
        label: "Toggle Monitoring",
        click: () => {
          this.toggleMonitoring();
        },
      },
      {
        label: "Reset Timer",
        click: () => {
          this.resetTimer();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip("Screen Time Monitor");

    this.tray.on("double-click", () => {
      this.mainWindow.show();
    });
  }

  setupPowerMonitor() {
    // Monitor system events
    powerMonitor.on("suspend", () => {
      console.log("System is going to sleep");
      this.resetTimer();
    });

    powerMonitor.on("resume", () => {
      console.log("System resumed from sleep");
      this.resetTimer();
    });

    powerMonitor.on("lock-screen", () => {
      console.log("Screen locked");
      this.resetTimer();
    });

    powerMonitor.on("unlock-screen", () => {
      console.log("Screen unlocked");
      this.resetTimer();
    });
  }

  startMonitoring() {
    this.isMonitoring = true;

    this.monitorInterval = setInterval(() => {
      if (this.isMonitoring && !this.isBreakTime) {
        this.checkSystemActivity().then((isActive) => {
          if (isActive) {
            this.usageTime += 1;
            this.lastActivityTime = Date.now();

            // Update renderer
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              this.mainWindow.webContents.send("usage-update", {
                usageTime: this.usageTime,
                isMonitoring: this.isMonitoring,
                isBreakTime: this.isBreakTime,
              });
            }

            // Check if break is needed
            if (this.usageTime >= this.breakThreshold) {
              this.triggerBreakAlert();
            }
          } else {
            // Check if system has been inactive for 5 minutes
            if (Date.now() - this.lastActivityTime > 5 * 60 * 1000) {
              this.resetTimer();
            }
          }
        });
      }
    }, 1000);
  }

  async checkSystemActivity() {
    return new Promise((resolve) => {
      if (process.platform === "win32") {
        // Windows: Check idle time
        exec(
          'powershell "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SystemInformation]::LastInputTime"',
          (error, stdout) => {
            if (error) {
              resolve(true); // Assume active if can't check
            } else {
              const idleTime = Date.now() - parseInt(stdout.trim());
              resolve(idleTime < 60000); // Active if idle < 1 minute
            }
          }
        );
      } else if (process.platform === "darwin") {
        // macOS: Check idle time
        exec(
          "ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1000000000); exit}'",
          (error, stdout) => {
            if (error) {
              resolve(true);
            } else {
              const idleSeconds = parseInt(stdout.trim());
              resolve(idleSeconds < 60); // Active if idle < 1 minute
            }
          }
        );
      } else {
        // Linux: Check idle time using xprintidle if available
        exec("xprintidle", (error, stdout) => {
          if (error) {
            resolve(true); // Assume active if can't check
          } else {
            const idleMs = parseInt(stdout.trim());
            resolve(idleMs < 60000); // Active if idle < 1 minute
          }
        });
      }
    });
  }

  triggerBreakAlert() {
    this.isBreakTime = true;

    // Show notification
    this.showNotification(
      `Break Time! You've been using your computer for ${this.formatTime(
        this.usageTime
      )}`
    );

    // Create break alert window
    this.createBreakAlert();

    // Update main window
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("break-alert", {
        usageTime: this.usageTime,
      });
    }
  }

  createBreakAlert() {
    const breakWindow = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
      },
      alwaysOnTop: true,
      resizable: false,
      title: "Break Time!",
      parent: this.mainWindow,
      modal: true,
    });

    breakWindow.loadFile("break-alert.html");

    // Send usage data to break window
    breakWindow.webContents.once("did-finish-load", () => {
      breakWindow.webContents.send("break-data", {
        usageTime: this.usageTime,
        formattedTime: this.formatTime(this.usageTime),
      });
    });
  }

  startBreak() {
    this.resetTimer();
    this.isBreakTime = false;
    this.showNotification("Break started! Timer reset.");
  }

  snoozeBreak() {
    this.usageTime -= 5 * 60; // Subtract 5 minutes
    this.isBreakTime = false;
    this.showNotification("Break reminder snoozed for 5 minutes");
  }

  resetTimer() {
    this.usageTime = 0;
    this.isBreakTime = false;

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("timer-reset");
    }
  }

  toggleMonitoring() {
    this.isMonitoring = !this.isMonitoring;

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("monitoring-toggled", this.isMonitoring);
    }
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  showNotification(message) {
    if (Notification.isSupported()) {
      new Notification({
        title: "Screen Time Monitor",
        body: message,
        icon: path.join(__dirname, "assets", "icon.png"),
      }).show();
    }
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const settings = JSON.parse(fs.readFileSync(this.settingsFile, "utf8"));
        this.breakThreshold = (settings.breakThresholdMinutes || 30) * 60;
      }
    } catch (error) {
      console.log("Error loading settings:", error);
      this.breakThreshold = 30 * 60; // Default 30 minutes
    }
  }

  saveSettings() {
    const settings = {
      breakThresholdMinutes: this.breakThreshold / 60,
      autoStart: true,
    };

    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2));
    } catch (error) {
      console.log("Error saving settings:", error);
    }
  }
}

// Create and start the monitor
new ScreenTimeMonitor();
