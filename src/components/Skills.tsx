"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import SkillCloud from "./SkillCloud";
import skillsData from "@/data/skills.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const iconMap = {
  "code-2": Code2,
  "layout": Layout,
  "server": Server,
  "smartphone": Smartphone,
  "layers": Layers,
  "paintbrush": Paintbrush,
  "rocket": Rocket,
  "pen-tool": PenTool,
  "telescope": Telescope,
};

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoColor = mounted && resolvedTheme === "dark" ? "ffffff" : "111111";

  return (
    <div className="flex flex-col gap-16">
      {/* SECTION 1 — 3D Tag Cloud */}
      <SkillCloud />

      {/* SECTION 2 — Skills Tabs & Grid */}
      <div className="w-full">
        <Tabs defaultValue={skillsData.tabs[0].value} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3">
            {skillsData.tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {skillsData.tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="outline-none">
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
                          {Icon && <Icon className="size-5 text-muted-foreground" />}
                          <h2 className="text-lg font-semibold">{category.category}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {category.items.map((skill) => (
                            <div
                              key={skill.name}
                              className="flex cursor-default items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5 transition-colors hover:bg-muted"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`https://cdn.simpleicons.org/${skill.slug}?color=${logoColor}`}
                                alt={skill.name}
                                className="h-[20px] w-[20px] object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                              <span className="text-xs font-medium text-foreground">{skill.name}</span>
                            </div>
                          ))}
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
