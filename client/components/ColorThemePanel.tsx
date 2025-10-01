import { useState, useEffect } from "react";
import { Palette, X } from "lucide-react";

interface ColorSet {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  isCustom?: boolean;
}

const colorSets: ColorSet[] = [
  {
    id: "default",
    name: "Default",
    primary: "#1f0a03",
    secondary: "#fcf4e4", 
    accent: "#ffffff",
    background: "#ffffff"
  },
  {
    id: "set1",
    name: "Set 1 – Earthy & Green",
    primary: "#3B2F2F",
    secondary: "#6B8E23",
    accent: "#fcf4e4",
    background: "#fcf4e4"
  },
  {
    id: "set2", 
    name: "Set 2 – Blue / Golden / Brown",
    primary: "#3b0b0b",
    secondary: "#C69749",
    accent: "#4E342E",
    background: "#fcf4e4"
  },
  {
    id: "set3",
    name: "Set 3 – Modern Neutral", 
    primary: "#2D2D2D",
    secondary: "#B0B0B0",
    accent: "#fcf4e4",
    background: "#fcf4e4"
  },
      {
        id: "set4",
        name: "Set 4 – Warm & Inviting",
        primary: "#6F4E37",
        secondary: "#C19A6B",
        accent: "#fcf4e4",
        background: "#fcf4e4"
      },
      {
        id: "set5",
        name: "Set 5 – Deep Forest",
        primary: "#2D5016",
        secondary: "#8FBC8F",
        accent: "#fcf4e4",
        background: "#fcf4e4"
      },
      {
        id: "set6",
        name: "Set 6 – Sunset Orange",
        primary: "#8B4513",
        secondary: "#FF8C00",
        accent: "#fcf4e4",
        background: "#fcf4e4"
      },
      {
        id: "set7",
        name: "Set 7 – Midnight Blue",
        primary: "#191970",
        secondary: "#87CEEB",
        accent: "#F0F8FF",
        background: "#fcf4e4"
      },
      {
        id: "custom",
        name: "Custom Colors",
        primary: "#1f0a03",
        secondary: "#fcf4e4",
        accent: "#ffffff",
        background: "#ffffff",
        isCustom: true
      }
];

export default function ColorThemePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSet, setActiveSet] = useState("default");
  const [flippedSets, setFlippedSets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"colors" | "videos">("colors");
  const [selectedVideo, setSelectedVideo] = useState("default");
  const [customColors, setCustomColors] = useState({
    primary: "#1f0a03",
    secondary: "#fcf4e4",
    accent: "#ffffff",
    background: "#ffffff"
  });

  const videoOptions = [
    {
      id: "default",
      name: "Default Video",
      filename: "Slowmotion_splash_shot_202509171540.mp4",
      description: "Original hero video"
    },
    {
      id: "macro",
      name: "Macro Shot",
      filename: "Macro_shot_of_202509171627_znyzw.mp4",
      description: "Close-up coffee shot"
    },
    {
      id: "stylish",
      name: "Stylish Overhead",
      filename: "Stylish_overhead_shot_202509251934_iuiif.mp4",
      description: "Stylish overhead coffee shot"
    },
    {
      id: "macro2",
      name: "Macro Shot 2",
      filename: "Macro_shot_of_202509252020_dji6c.mp4",
      description: "Another macro coffee shot"
    },
    {
      id: "cascade",
      name: "Coffee Beans Cascade",
      filename: "Coffee_beans_cascade_202509252028_5lzwj.mp4",
      description: "Coffee beans falling in cascade"
    },
    {
      id: "fly",
      name: "Coffee Beans Fly",
      filename: "Coffee_beans_fly_202509252027_08ean.mp4",
      description: "Coffee beans flying animation"
    },
    {
      id: "slowmotion1",
      name: "Slowmotion Shot 1",
      filename: "Slowmotion_splash_shot_202509252020_762rx.mp4",
      description: "Slowmotion coffee splash shot"
    },
    {
      id: "slowmotion2",
      name: "Slowmotion Shot 2",
      filename: "Slowmotion_splash_shot_202509252020_zw0sk.mp4",
      description: "Another slowmotion coffee splash"
    },
    {
      id: "slowmotion3",
      name: "Slowmotion Shot 3",
      filename: "Slowmotion_splash_shot_202509252021_t87yi.mp4",
      description: "Third slowmotion coffee splash"
    }
  ];

  const applyColorSet = (colorSet: ColorSet, flipped?: boolean) => {
    const root = document.documentElement;
    
    // Use custom colors if this is the custom set
    const colors = colorSet.id === "custom" ? customColors : colorSet;
    
    // Use the specific flip state for this set, or the passed parameter
    const isFlipped = flipped !== undefined ? flipped : flippedSets[colorSet.id] || false;
    
    if (isFlipped) {
      // Flipped: Background swaps with primary, secondary swaps with accent
      root.style.setProperty('--coffee-green', colors.background);
      root.style.setProperty('--coffee-green-dark', adjustBrightness(colors.background, -20));
      root.style.setProperty('--coffee-green-light', adjustBrightness(colors.background, 20));
      root.style.setProperty('--coffee-accent', colors.secondary);
      root.style.setProperty('--coffee-beige', colors.primary);
      root.style.setProperty('--coffee-gray', adjustBrightness(colors.background, 40));
      root.style.setProperty('--coffee-background', colors.primary);
      
      // Text colors for visibility when flipped - smart contrast
      root.style.setProperty('--coffee-text-primary', '#000000'); // Black for light backgrounds
      root.style.setProperty('--coffee-text-secondary', '#000000');
      root.style.setProperty('--coffee-text-accent', '#000000');
      root.style.setProperty('--coffee-text-description', '#ffffff'); // White for dark backgrounds
    } else {
      // Normal: Use colors as defined
      root.style.setProperty('--coffee-green', colors.primary);
      root.style.setProperty('--coffee-green-dark', adjustBrightness(colors.primary, -20));
      root.style.setProperty('--coffee-green-light', adjustBrightness(colors.primary, 20));
      root.style.setProperty('--coffee-accent', colors.secondary);
      root.style.setProperty('--coffee-beige', colors.accent);
      root.style.setProperty('--coffee-gray', adjustBrightness(colors.primary, 40));
      root.style.setProperty('--coffee-background', colors.background);
      
      // Normal text colors - smart contrast based on background
      root.style.setProperty('--coffee-text-primary', '#ffffff'); // White for dark backgrounds
      root.style.setProperty('--coffee-text-secondary', colors.secondary);
      root.style.setProperty('--coffee-text-accent', colors.accent);
      root.style.setProperty('--coffee-text-description', '#000000'); // Black for light backgrounds
    }
    
    setActiveSet(colorSet.id);
  };

  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const handleCustomColorChange = (colorType: keyof typeof customColors, value: string) => {
    const newCustomColors = { ...customColors, [colorType]: value };
    setCustomColors(newCustomColors);
    
    // If custom set is active, apply the new colors immediately
    if (activeSet === "custom") {
      const customSet = { ...colorSets.find(set => set.id === "custom")!, ...newCustomColors };
      applyColorSet(customSet);
    }
  };

  const toggleFlip = (setId: string) => {
    const newFlippedState = !flippedSets[setId];
    setFlippedSets(prev => ({ ...prev, [setId]: newFlippedState }));
    
    // If this set is currently active, apply the new flip state
    if (activeSet === setId) {
      const colorSet = colorSets.find(set => set.id === setId);
      if (colorSet) {
        applyColorSet(colorSet, newFlippedState);
      }
    }
  };

  const handleVideoChange = (videoId: string) => {
    setSelectedVideo(videoId);
    const videoOption = videoOptions.find(v => v.id === videoId);
    if (videoOption) {
      // Update the hero video source - look for any video in the hero section
      const heroVideo = document.querySelector('section video') as HTMLVideoElement;
      if (heroVideo) {
        heroVideo.src = `/${videoOption.filename}`;
        heroVideo.load();
        heroVideo.play(); // Auto-play the new video
      }
    }
  };

  useEffect(() => {
    // Apply default colors on mount
    applyColorSet(colorSets[0]);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 bg-white/10 text-white p-3 hover:bg-white hover:text-[#3b0b0b] hover:scale-110 transition-all duration-300"
      >
        <Palette className="w-6 h-6" />
      </button>

      {/* Color Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-800">Theme Panel</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100  transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100  p-1">
              <button
                onClick={() => setActiveTab("colors")}
                className={`flex-1 px-4 py-2  text-sm font-bold transition-all duration-300 ${
                  activeTab === "colors"
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Colors
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`flex-1 px-4 py-2  text-sm font-bold transition-all duration-300 ${
                  activeTab === "videos"
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Videos
              </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "colors" ? (
              /* Color Sets */
              <div className="space-y-4">
                {colorSets.map((set) => (
                <div
                  key={set.id}
                  className={`p-4  border-2 cursor-pointer transition-all duration-300 ${
                    activeSet === set.id
                      ? 'border-coffee-accent bg-coffee-accent/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => applyColorSet(set)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">{set.name}</h4>
                    <div className="flex items-center space-x-2">
                      {/* Individual Flip Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(set.id);
                        }}
                        className={`p-2  transition-all duration-300 ${
                          flippedSets[set.id]
                            ? 'bg-coffee-accent text-coffee-green'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title="Flip Colors for this set"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      
                    </div>
                  </div>
                  
                  {set.isCustom ? (
                    /* Custom Color Pickers */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Primary</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customColors.primary}
                              onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 font-mono">{customColors.primary}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customColors.secondary}
                              onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 font-mono">{customColors.secondary}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Accent</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customColors.accent}
                              onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 font-mono">{customColors.accent}</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={customColors.background}
                              onChange={(e) => handleCustomColorChange('background', e.target.value)}
                              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
                            />
                            <span className="text-xs text-gray-600 font-mono">{customColors.background}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Regular Color Preview */
                    <div className="flex space-x-2 mb-3">
                      <div
                        className="w-8 h-8  border-2 border-white shadow-lg"
                        style={{ backgroundColor: flippedSets[set.id] ? set.background : set.primary }}
                        title={flippedSets[set.id] ? "Primary (Flipped)" : "Primary"}
                      />
                      <div
                        className="w-8 h-8  border-2 border-white shadow-lg"
                        style={{ backgroundColor: flippedSets[set.id] ? set.accent : set.secondary }}
                        title={flippedSets[set.id] ? "Secondary (Flipped)" : "Secondary"}
                      />
                      <div
                        className="w-8 h-8  border-2 border-white shadow-lg"
                        style={{ backgroundColor: flippedSets[set.id] ? set.secondary : set.accent }}
                        title={flippedSets[set.id] ? "Accent (Flipped)" : "Accent"}
                      />
                      <div
                        className="w-8 h-8  border-2 border-white shadow-lg"
                        style={{ backgroundColor: flippedSets[set.id] ? set.primary : set.background }}
                        title={flippedSets[set.id] ? "Background (Flipped)" : "Background"}
                      />
                    </div>
                  )}

                  {/* Color Codes - Only show for non-custom sets */}
                  {!set.isCustom && (
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Primary: {flippedSets[set.id] ? set.background : set.primary}</div>
                      <div>Secondary: {flippedSets[set.id] ? set.accent : set.secondary}</div>
                      <div>Accent: {flippedSets[set.id] ? set.secondary : set.accent}</div>
                      <div>Background: {flippedSets[set.id] ? set.primary : set.background}</div>
                    </div>
                  )}
                </div>
                ))}
              </div>
            ) : (
              /* Video Selection */
              <div className="space-y-4">
                {videoOptions.map((video) => (
                  <div
                    key={video.id}
                    className={`p-4  border-2 cursor-pointer transition-all duration-300 ${
                      selectedVideo === video.id
                        ? 'border-coffee-accent bg-coffee-accent/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleVideoChange(video.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-800">{video.name}</h4>
                      {selectedVideo === video.id && (
                        <div className="px-3 py-1  text-sm font-bold bg-coffee-green text-white">
                          Active
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{video.description}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

    </>
  );
}
