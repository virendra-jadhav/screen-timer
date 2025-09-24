# 🕐 Screen Time Monitor

A beautiful, cross-platform desktop application that helps you maintain healthy computer usage habits by tracking your screen time and reminding you to take regular breaks.

![Screen Time Monitor](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![Electron](https://img.shields.io/badge/Electron-25+-blue)



## ✨ Features

- **🎯 Smart Usage Tracking** - Monitors continuous computer usage with intelligent idle detection
- **⏰ Customizable Break Reminders** - Set break intervals from 15 to 120 minutes
- **🔄 Automatic Reset** - Timer resets when you lock your screen, sleep, or step away
- **🎨 Beautiful Modern UI** - Clean, responsive interface with smooth animations
- **🌙 System Tray Integration** - Runs quietly in the background with tray controls
- **📊 Real-time Progress** - Visual progress bar and time display
- **🧘 Guided Break Sessions** - 5-minute break timer with helpful suggestions
- **💾 Persistent Settings** - Your preferences are automatically saved
- **🔔 Native Notifications** - System notifications for important events
- **⌨️ Keyboard Shortcuts** - Quick actions with Enter and Escape keys

## 🖼️ Screenshots

### Main Interface
Beautiful glassmorphism design with real-time usage tracking and customizable settings.

### Break Alert
Gentle reminders with helpful suggestions for healthy break activities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/screen-time-monitor.git
   cd screen-time-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add application icons** (optional)
   ```bash
   mkdir assets
   # Place your icon files in the assets folder:
   # - icon.png (256x256)
   # - icon.ico (for Windows)
   # - icon.icns (for macOS)
   # - tray-icon.png (16x16 or 32x32)
   ```

4. **Run the application**
   ```bash
   npm start
   ```

## 📦 Building for Distribution

### Build for all platforms
```bash
npm run build
```

### Platform-specific builds
```bash
npm run build-win    # Windows installer (.exe)
npm run build-mac    # macOS disk image (.dmg)
npm run build-linux  # Linux AppImage
```

Built applications will be available in the `dist/` folder.

## 🛠️ Development

### Development mode
```bash
npm run dev
```

### Project structure
```
screen-time-monitor/
├── main.js              # Main Electron process
├── preload.js           # Secure IPC bridge
├── index.html           # Main window interface
├── break-alert.html     # Break reminder popup
├── renderer.js          # Main window logic
├── break-renderer.js    # Break window logic
├── styles.css           # UI styling
├── package.json         # Project configuration
└── assets/              # Application icons
```

## ⚙️ Configuration

The application automatically saves your settings, including:

- **Break Threshold**: Time interval for break reminders (15-120 minutes)
- **Monitoring State**: Whether monitoring is active or paused
- **Window Position**: Remembers where you placed the window

Settings are stored in `settings.json` in the application directory.

## 🔧 How It Works

### Smart Activity Detection
- **Windows**: Uses PowerShell to check system idle time
- **macOS**: Uses `ioreg` to monitor HID system activity
- **Linux**: Uses `xprintidle` for X11 idle detection

### Automatic Reset Triggers
- Screen lock/unlock events
- System sleep/wake events
- Extended idle periods (5+ minutes)
- Manual reset via UI or tray menu

### Break Management
- Shows gentle reminder popup at configured intervals
- Offers guided 5-minute break with countdown timer
- Provides snooze option (5 additional minutes)
- Includes healthy break activity suggestions

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test on multiple platforms when possible
- Update documentation for new features

## 🐛 Issues and Support

Found a bug or have a feature request? Please check our [Issues](https://github.com/yourusername/screen-time-monitor/issues) page.

### Before reporting an issue:
- Check if the issue already exists
- Include your operating system and version
- Provide steps to reproduce the problem
- Include relevant error messages or screenshots

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron Team** - For the amazing cross-platform framework
- **Contributors** - Thank you to everyone who helps improve this project
- **Community** - For feedback and feature suggestions

## 🌟 Show Your Support

If this project helped you maintain healthier computer usage habits, please consider:

- ⭐ **Star this repository**
- 🐛 **Report bugs** you encounter
- 💡 **Suggest new features**
- 🔀 **Contribute code** improvements
- 📢 **Share with others** who might benefit

## 🔗 Related Projects

- [Break Timer](https://github.com/tom-james-watson/breaktimer-app) - Another great break reminder tool
- [Time Out](https://www.dejal.com/timeout/) - macOS break reminder
- [Workrave](https://workrave.org/) - Cross-platform RSI prevention tool

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/screen-time-monitor?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/screen-time-monitor?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/screen-time-monitor)

---

**Made with ❤️ for healthier computing habits**

*Remember: Regular breaks improve focus, reduce eye strain, and boost productivity!*
