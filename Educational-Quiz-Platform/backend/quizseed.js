import Quiz from "./models/Quiz.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["mcq", "multi", "fill"], required: true },
  options: [{ type: String }],
  correctAnswers: [{ type: String }]
});

const quizSchema = new mongoose.Schema({
  publisherId: { type: String, required: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [questionSchema],
  attempts: { type: Number, default: 0 }, 
  highestScore: { type: String, default: "0/0" }, 
});

const quizzes = [
  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "CPU Basics Quiz",
    topic: "CPU",
    questions: [
      { question: "The CPU is often referred to as the _____ of the computer.", type: "fill", options: ["brain", "heart", "powerhouse", "chip"], correctAnswers: ["brain"] },
      { question: "Which of the following is a CPU manufacturer?", type: "mcq", options: ["Intel", "NVIDIA", "Seagate", "Corsair"], correctAnswers: ["Intel"] },
      { question: "Which component directly connects to the CPU?", type: "mcq", options: ["RAM", "GPU", "PSU", "Monitor"], correctAnswers: ["RAM"] },
      { question: "Select all CPU socket types:", type: "multi", options: ["LGA1200", "AM4", "DDR4", "SATA"], correctAnswers: ["LGA1200", "AM4"] },
      { question: "What does 'GHz' measure in a CPU?", type: "mcq", options: ["Power", "Clock Speed", "Voltage", "Temperature"], correctAnswers: ["Clock Speed"] },
      { question: "Which CPU architecture is most common in PCs?", type: "mcq", options: ["x86", "ARM", "RISC-V", "MIPS"], correctAnswers: ["x86"] },
      { question: "Modern CPUs often have multiple ____.", type: "fill", options: ["cores", "threads", "sockets", "pins"], correctAnswers: ["cores"] },
      { question: "Which CPU feature allows running multiple threads per core?", type: "mcq", options: ["Hyper-Threading", "Overclocking", "Turbo Boost", "ECC"], correctAnswers: ["Hyper-Threading"] },
      { question: "Choose all Intel CPU series:", type: "multi", options: ["Ryzen", "Core i7", "Pentium", "Xeon"], correctAnswers: ["Core i7", "Pentium", "Xeon"] },
      { question: "Which company produces Ryzen CPUs?", type: "mcq", options: ["AMD", "Intel", "NVIDIA", "Qualcomm"], correctAnswers: ["AMD"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "GPU Fundamentals Quiz",
    topic: "GPU",
    questions: [
      { question: "The main purpose of a GPU is to handle ____ rendering.", type: "fill", options: ["graphics", "audio", "network", "power"], correctAnswers: ["graphics"] },
      { question: "Which of these is a GPU manufacturer?", type: "mcq", options: ["AMD", "Seagate", "Intel Xeon", "Samsung"], correctAnswers: ["AMD"] },
      { question: "Select all GPU types:", type: "multi", options: ["Integrated", "Dedicated", "Virtual", "Mechanical"], correctAnswers: ["Integrated", "Dedicated"] },
      { question: "Which connector is commonly used to connect GPUs?", type: "mcq", options: ["PCIe", "SATA", "USB", "Ethernet"], correctAnswers: ["PCIe"] },
      { question: "NVIDIA’s AI GPU platform is called ____.", type: "fill", options: ["CUDA", "TensorFlow", "OpenCL", "DirectX"], correctAnswers: ["CUDA"] },
      { question: "Which of the following is an NVIDIA GPU series?", type: "mcq", options: ["RTX", "Ryzen", "Threadripper", "Xeon"], correctAnswers: ["RTX"] },
      { question: "Select all memory types used in GPUs:", type: "multi", options: ["GDDR6", "HBM2", "DDR4", "SSD"], correctAnswers: ["GDDR6", "HBM2"] },
      { question: "What is the main factor for gaming GPU performance?", type: "mcq", options: ["VRAM", "SSD Speed", "CPU Cache", "Motherboard"], correctAnswers: ["VRAM"] },
      { question: "Ray tracing improves ____ quality.", type: "fill", options: ["lighting", "sound", "temperature", "power"], correctAnswers: ["lighting"] },
      { question: "Which company makes Radeon GPUs?", type: "mcq", options: ["AMD", "Intel", "NVIDIA", "IBM"], correctAnswers: ["AMD"] },
    ],
    attempts: 0,
    highestScore: "00/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "Motherboard Quiz",
    topic: "Motherboard",
    questions: [
      { question: "The motherboard is also called the ____ board.", type: "fill", options: ["main", "control", "logic", "base"], correctAnswers: ["main"] },
      { question: "Which form factors are common for motherboards?", type: "multi", options: ["ATX", "Micro-ATX", "Mini-ITX", "Nano-SSD"], correctAnswers: ["ATX", "Micro-ATX", "Mini-ITX"] },
      { question: "Which slot connects the GPU?", type: "mcq", options: ["PCIe", "SATA", "DIMM", "NVMe"], correctAnswers: ["PCIe"] },
      { question: "Which component regulates power delivery on the motherboard?", type: "mcq", options: ["VRM", "PSU", "Chipset", "BIOS"], correctAnswers: ["VRM"] },
      { question: "The BIOS/UEFI is stored on a ____ chip.", type: "fill", options: ["ROM", "RAM", "Flash", "CMOS"], correctAnswers: ["ROM"] },
      { question: "Which ports are usually found on a motherboard?", type: "multi", options: ["USB", "Ethernet", "HDMI", "PCIe"], correctAnswers: ["USB", "Ethernet", "HDMI"] },
      { question: "The Northbridge historically connected CPU to ____.", type: "fill", options: ["RAM", "GPU", "HDD", "BIOS"], correctAnswers: ["RAM"] },
      { question: "Which socket supports AMD Ryzen CPUs?", type: "mcq", options: ["LGA1700", "AM4", "AM5", "LGA1151"], correctAnswers: ["AM4"] },
      { question: "Chipsets control ____.", type: "mcq", options: ["Data Flow", "Cooling", "Power", "Storage"], correctAnswers: ["Data Flow"] },
      { question: "Motherboards provide slots for ____ cards.", type: "multi", options: ["Sound", "Graphics", "Network"], correctAnswers: ["Sound", "Graphics", "Network"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "RAM Quiz",
    topic: "RAM",
    questions: [
      { question: "RAM stands for ____ Access Memory.", type: "fill", options: ["Random", "Rapid", "Read-only", "Regular"], correctAnswers: ["Random"] },
      { question: "Which RAM type is common today?", type: "mcq", options: ["DDR4", "DDR3", "SDRAM", "DDR2"], correctAnswers: ["DDR4"] },
      { question: "Select all RAM form factors:", type: "multi", options: ["DIMM", "SO-DIMM", "M.2", "SATA"], correctAnswers: ["DIMM", "SO-DIMM"] },
      { question: "Which RAM is used in laptops?", type: "mcq", options: ["SO-DIMM", "DIMM", "GDDR6", "HBM"], correctAnswers: ["SO-DIMM"] },
      { question: "More RAM improves system ____.", type: "fill", options: ["multitasking", "gaming", "boot speed", "storage"], correctAnswers: ["multitasking"] },
      { question: "Which generation followed DDR4?", type: "mcq", options: ["DDR5", "DDR3", "DDR6", "DDR2"], correctAnswers: ["DDR5"] },
      { question: "ECC RAM is mainly used in ____.", type: "fill", options: ["servers", "laptops", "gaming PCs", "phones"], correctAnswers: ["servers"] },
      { question: "Which company makes RAM?", type: "multi", options: ["Corsair", "G.Skill", "Seagate", "Crucial"], correctAnswers: ["Corsair", "G.Skill", "Crucial"] },
      { question: "RAM is ____ memory.", type: "mcq", options: ["Volatile", "Non-Volatile", "Optical", "Magnetic"], correctAnswers: ["Volatile"] },
      { question: "The speed of RAM is measured in ____.", type: "fill", options: ["MHz", "GHz", "Kbps", "ms"], correctAnswers: ["MHz"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "SSD Quiz",
    topic: "SSD",
    questions: [
      { question: "SSD stands for ____ State Drive.", type: "fill", options: ["Solid", "Super", "Smart", "Standard"], correctAnswers: ["Solid"] },
      { question: "Which connector is fastest for SSD?", type: "mcq", options: ["NVMe", "SATA", "USB", "IDE"], correctAnswers: ["NVMe"] },
      { question: "Select all SSD form factors:", type: "multi", options: ["M.2", "2.5-inch", "PCIe", "CD"], correctAnswers: ["M.2", "2.5-inch", "PCIe"] },
      { question: "SSDs use ____ chips to store data.", type: "fill", options: ["NAND", "DRAM", "EPROM", "Flash"], correctAnswers: ["NAND"] },
      { question: "Which SSD type is most common in laptops?", type: "mcq", options: ["M.2 NVMe", "HDD", "Tape Drive", "Floppy"], correctAnswers: ["M.2 NVMe"] },
      { question: "Compared to HDDs, SSDs are usually ____.", type: "multi", options: ["Faster", "More Expensive", "Silent"], correctAnswers: ["Faster", "More Expensive", "Silent"] },
      { question: "SATA III SSDs have max speed around ____ MB/s.", type: "fill", options: ["600", "300", "1200", "800"], correctAnswers: ["600"] },
      { question: "Which memory type is used in SSDs?", type: "mcq", options: ["Flash", "DRAM", "EPROM", "Optical"], correctAnswers: ["Flash"] },
      { question: "NVMe uses ____ lanes.", type: "mcq", options: ["PCIe", "SATA", "USB", "Ethernet"], correctAnswers: ["PCIe"] },
      { question: "SSDs are ____ resistant compared to HDDs.", type: "fill", options: ["shock", "fire", "water", "heat"], correctAnswers: ["shock"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "HDD Quiz",
    topic: "HDD",
    questions: [
      { question: "HDD stands for ____ Disk Drive.", type: "fill", options: ["Hard", "Hybrid", "High", "Heavy"], correctAnswers: ["Hard"] },
      { question: "HDDs store data on ____ disks.", type: "fill", options: ["magnetic", "optical", "plastic", "flash"], correctAnswers: ["magnetic"] },
      { question: "Which speeds are common for HDDs?", type: "multi", options: ["5400 RPM", "7200 RPM", "10,000 RPM"], correctAnswers: ["5400 RPM", "7200 RPM", "10,000 RPM"] },
      { question: "HDDs connect mainly via ____.", type: "mcq", options: ["SATA", "PCIe", "USB-C", "Thunderbolt"], correctAnswers: ["SATA"] },
      { question: "HDDs are generally ____ than SSDs.", type: "mcq", options: ["Slower", "Faster", "Smaller", "More Durable"], correctAnswers: ["Slower"] },
      { question: "HDDs are good for ____ storage.", type: "fill", options: ["bulk", "temporary", "cache", "volatile"], correctAnswers: ["bulk"] },
      { question: "Which company manufactures HDDs?", type: "multi", options: ["Seagate", "Western Digital", "Toshiba", "Corsair"], correctAnswers: ["Seagate", "Western Digital", "Toshiba"] },
      { question: "A common size for HDDs is ____ inches.", type: "mcq", options: ["2.5", "3.5", "1.8", "4.5"], correctAnswers: ["2.5", "3.5"] },
      { question: "HDDs use a ____ head to read data.", type: "fill", options: ["magnetic", "optical", "laser", "electrical"], correctAnswers: ["magnetic"] },
      { question: "Which factor affects HDD speed?", type: "mcq", options: ["RPM", "VRAM", "Core Count", "Chipset"], correctAnswers: ["RPM"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "PSU Quiz",
    topic: "PSU",
    questions: [
      { question: "PSU stands for ____ Supply Unit.", type: "fill", options: ["Power", "Peripheral", "Processor", "Primary"], correctAnswers: ["Power"] },
      { question: "Which rating system indicates PSU efficiency?", type: "mcq", options: ["80 Plus", "Gold Star", "Energy Saver", "CoreMark"], correctAnswers: ["80 Plus"] },
      { question: "Select all PSU connectors:", type: "multi", options: ["24-pin ATX", "8-pin EPS", "PCIe 6/8-pin", "HDMI"], correctAnswers: ["24-pin ATX", "8-pin EPS", "PCIe 6/8-pin"] },
      { question: "PSU wattage determines maximum ____.", type: "fill", options: ["power", "voltage", "speed", "load"], correctAnswers: ["power"] },
      { question: "Which company makes PSUs?", type: "multi", options: ["Corsair", "EVGA", "Seasonic", "Intel"], correctAnswers: ["Corsair", "EVGA", "Seasonic"] },
      { question: "A modular PSU allows you to ____.", type: "fill", options: ["remove cables", "add fans", "overclock CPU", "change voltage"], correctAnswers: ["remove cables"] },
      { question: "Which voltages are typically provided by PSUs?", type: "multi", options: ["12V", "5V", "3.3V"], correctAnswers: ["12V", "5V", "3.3V"] },
      { question: "Overloading a PSU can cause ____.", type: "mcq", options: ["Shutdown", "Performance Boost", "Overclocking", "VRAM Increase"], correctAnswers: ["Shutdown"] },
      { question: "Which PSU type is smaller for compact builds?", type: "mcq", options: ["SFX", "ATX", "E-ATX", "Micro"], correctAnswers: ["SFX"] },
      { question: "A PSU converts AC to ____.", type: "fill", options: ["DC", "AC", "heat", "frequency"], correctAnswers: ["DC"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "Monitor Quiz",
    topic: "Monitor",
    questions: [
      { question: "Monitor refresh rate is measured in ____.", type: "fill", options: ["Hz", "FPS", "ms", "dpi"], correctAnswers: ["Hz"] },
      { question: "Which of these are display technologies?", type: "multi", options: ["LCD", "LED", "OLED", "CRT"], correctAnswers: ["LCD", "LED", "OLED", "CRT"] },
      { question: "Resolution refers to number of ____.", type: "fill", options: ["pixels", "colors", "frames", "dots"], correctAnswers: ["pixels"] },
      { question: "Which connectors are common for monitors?", type: "multi", options: ["HDMI", "DisplayPort", "VGA", "DVI"], correctAnswers: ["HDMI", "DisplayPort", "VGA", "DVI"] },
      { question: "Which feature reduces screen tearing?", type: "mcq", options: ["G-Sync", "HDR", "RGB", "Freesync"], correctAnswers: ["G-Sync", "Freesync"] },
      { question: "What does HDR improve?", type: "mcq", options: ["Color", "Frame Rate", "Response Time", "Brightness"], correctAnswers: ["Color", "Brightness"] },
      { question: "Curved monitors improve ____.", type: "fill", options: ["immersion", "color", "speed", "contrast"], correctAnswers: ["immersion"] },
      { question: "Which aspect ratios are common?", type: "multi", options: ["16:9", "21:9", "4:3"], correctAnswers: ["16:9", "21:9", "4:3"] },
      { question: "Higher refresh rate monitors are better for ____.", type: "fill", options: ["gaming", "editing", "storage", "coding"], correctAnswers: ["gaming"] },
      { question: "4K resolution equals ____ x 2160.", type: "mcq", options: ["3840", "1920", "2560", "4096"], correctAnswers: ["3840", "4096"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "Mouse Quiz",
    topic: "Mouse",
    questions: [
      { question: "The first computer mice used ____ to track movement.", type: "fill", options: ["balls", "sensors", "wheels", "light"], correctAnswers: ["balls"] },
      { question: "Which of these are mouse types?", type: "multi", options: ["Optical", "Laser", "Trackball", "Wireless"], correctAnswers: ["Optical", "Laser", "Trackball", "Wireless"] },
      { question: "Mouse DPI stands for ____ per inch.", type: "fill", options: ["dots", "data", "devices", "degrees"], correctAnswers: ["dots"] },
      { question: "Which connector is most common for modern mice?", type: "mcq", options: ["USB", "PS/2", "Serial", "Thunderbolt"], correctAnswers: ["USB"] },
      { question: "Which company makes gaming mice?", type: "multi", options: ["Logitech", "Razer", "SteelSeries", "AMD"], correctAnswers: ["Logitech", "Razer", "SteelSeries"] },
      { question: "Wireless mice connect via ____.", type: "mcq", options: ["Bluetooth", "Wi-Fi", "Ethernet", "HDMI"], correctAnswers: ["Bluetooth"] },
      { question: "A gaming mouse often includes ____ buttons.", type: "fill", options: ["extra", "main", "touch", "macro"], correctAnswers: ["extra"] },
      { question: "Select mouse input methods:", type: "multi", options: ["Optical Sensor", "Laser", "Ball"], correctAnswers: ["Optical Sensor", "Laser", "Ball"] },
      { question: "Which brand is known for ergonomic mice?", type: "mcq", options: ["Logitech", "NVIDIA", "Intel", "AMD"], correctAnswers: ["Logitech"] },
      { question: "Mouse acceleration affects ____.", type: "fill", options: ["sensitivity", "speed", "weight", "color"], correctAnswers: ["sensitivity"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },

  {
    publisherId: "68d23c714524ae8fcae24d91",
    title: "Keyboard Quiz",
    topic: "Keyboard",
    questions: [
      { question: "The most common keyboard layout is ____.", type: "fill", options: ["QWERTY", "AZERTY", "DVORAK", "COLEMAK"], correctAnswers: ["QWERTY"] },
      { question: "Which are mechanical switch types?", type: "multi", options: ["Blue", "Red", "Brown", "Green"], correctAnswers: ["Blue", "Red", "Brown", "Green"] },
      { question: "Which connector is most common for keyboards?", type: "mcq", options: ["USB", "PS/2", "Serial", "HDMI"], correctAnswers: ["USB"] },
      { question: "A keyboard with no numpad is called ____.", type: "fill", options: ["tenkeyless", "mini", "compact", "small"], correctAnswers: ["tenkeyless"] },
      { question: "Which keyboard feature lights up keys?", type: "mcq", options: ["Backlight", "Overclocking", "Refresh Rate", "VRAM"], correctAnswers: ["Backlight"] },
      { question: "Which companies make gaming keyboards?", type: "multi", options: ["Corsair", "Razer", "Logitech", "Seagate"], correctAnswers: ["Corsair", "Razer", "Logitech"] },
      { question: "Mechanical keyboards are known for ____.", type: "fill", options: ["durability", "flexibility", "weight", "speed"], correctAnswers: ["durability"] },
      { question: "Which wireless technology do keyboards use?", type: "mcq", options: ["Bluetooth", "Wi-Fi", "Ethernet", "HDMI"], correctAnswers: ["Bluetooth"] },
      { question: "Keyboard polling rate is measured in ____.", type: "fill", options: ["Hz", "ms", "fps", "dpi"], correctAnswers: ["Hz"] },
      { question: "Select special keyboard types:", type: "multi", options: ["Ergonomic", "Virtual", "Flexible"], correctAnswers: ["Ergonomic", "Virtual", "Flexible"] },
    ],
    attempts: 0,
    highestScore: "0/10",
    createdAt: "2025-09-26T05:11:36.385+00:00",
  },
];

const seedQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Quiz.deleteMany({});
    console.log("🗑️ Old quizzes removed");

    await Quiz.insertMany(quizzes);
    console.log("✅ Quizzes seeded successfully!");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error seeding quizzes:", err);
    mongoose.connection.close();
  }
};

seedQuizzes();
