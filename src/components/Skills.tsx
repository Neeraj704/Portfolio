"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Layout,
  Server,
  Smartphone,
  Layers,
  Paintbrush,
  Rocket,
  PenTool,
  Telescope,
  Palette,
  Blend,
} from "lucide-react";
import SkillCloud from "./SkillCloud";
import skillsData from "@/data/skills.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const iconMap = {
  "code-2": Code2,
  layout: Layout,
  server: Server,
  smartphone: Smartphone,
  layers: Layers,
  paintbrush: Paintbrush,
  rocket: Rocket,
  "pen-tool": PenTool,
  telescope: Telescope,
};

type SkillItem = {
  name: string;
  slug: string;
  logoLight?: string;
  logoDark?: string;
};

// "colored" = brand colors (default). Specific dark icons use their logoDark override.
// "mono"    = all icons forced white (dark mode) or near-black (light mode).
type IconStyle = "colored" | "mono";

const STORAGE_KEY = "skills-icon-style";

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [iconStyle, setIconStyle] = useState<IconStyle>("colored");
  const [activeTab, setActiveTab] = useState(skillsData.tabs[0].value);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Restore user's last preference from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "colored" || saved === "mono") {
        setIconStyle(saved);
      }
    } catch {
      // localStorage unavailable — stay with default "colored"
    }

    setIsMobile(window.innerWidth < 640);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allSkills = useMemo(
    () => skillsData.skills.flatMap((c) => c.items),
    [],
  );
  const skillsToShow = useMemo(() => {
    if (!mounted) return allSkills;
    return isMobile
      ? skillsData.skills
          .filter((c) => c.tab === activeTab)
          .flatMap((c) => c.items)
      : allSkills;
  }, [isMobile, activeTab, mounted, allSkills]);

  // Only resolve dark mode after mounting to avoid SSR/hydration mismatch
  const isDark = mounted && resolvedTheme === "dark";

  function toggleIconStyle() {
    const next: IconStyle = iconStyle === "colored" ? "mono" : "colored";
    setIconStyle(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  // Returns the correct icon src URL for a given skill and the current theme/style.
  function getIconUrl(skill: SkillItem): string {
    if (iconStyle === "mono") {
      // Monochrome mode: force white in dark mode, near-black in light mode
      return `https://cdn.simpleicons.org/${skill.slug}/${isDark ? "ffffff" : "111111"}`;
    }

    // Colored mode (default):
    // If this specific icon has a manual override for the current theme, use it.
    // The logoDark overrides in skills.json exist ONLY for icons whose brand color is
    // dark/black and would be invisible in dark mode (Express, VS Code, GitHub, etc.).
    if (isDark && skill.logoDark) {
      return skill.logoDark;
    }
    if (!isDark && skill.logoLight) {
      return skill.logoLight;
    }

    // No override set → use the icon's natural brand color.
    // SimpleIcons CDN with just the slug and NO color returns the official brand color SVG.
    return `https://cdn.simpleicons.org/${skill.slug}`;
  }

  return (
    <div className="flex flex-col gap-16">
      {/* SECTION 1 — Animated Skill Cloud */}
      <SkillCloud iconStyle={iconStyle} skills={skillsToShow} />

      {/* SECTION 2 — Tabbed Skill Grid */}
      <div className="w-full">
        {/* Header row: toggle button aligned to the right above the tabs */}
        {/* <div className="mb-4 flex justify-end">
          <button
            onClick={toggleIconStyle}
            title={
              iconStyle === "colored"
                ? "Switch to monochrome icons"
                : "Switch to colored icons"
            }
            className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {iconStyle === "colored" ? (
              <>
                <Palette className="size-3" />
                Colored
              </>
            ) : (
              <>
                <Blend className="size-3" />
                Mono
              </>
            )}
          </button>
        </div> */}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3">
            {skillsData.tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {skillsData.tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="outline-none"
            >
              <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                {skillsData.skills
                  .filter((category) => category.tab === tab.value)
                  .map((category) => {
                    const Icon = iconMap[category.icon as keyof typeof iconMap];
                    return (
                      <motion.div
                        key={category.category}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm"
                      >
                        <div className="mb-4 flex items-center gap-2">
                          {Icon && (
                            <Icon className="size-5 text-muted-foreground" />
                          )}
                          <h2 className="text-lg font-semibold">
                            {category.category}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {category.items.map((skill) => {
                            const iconUrl = getIconUrl(skill as SkillItem);
                            return (
                              <div
                                key={skill.name}
                                className="flex cursor-default items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={iconUrl}
                                  alt={skill.name}
                                  className="h-[20px] w-[20px] object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <span className="text-xs font-medium text-foreground">
                                  {skill.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
