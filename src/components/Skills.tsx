"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Layout, Server, Wrench } from "lucide-react";
import SkillCloud from "./SkillCloud";
import skillsData from "@/data/skills.json";

const iconMap = {
  Languages: Code2,
  Frontend: Layout,
  Backend: Server,
  "Tools & DevOps": Wrench,
};

export default function Skills() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoColor = mounted && resolvedTheme === "dark" ? "ffffff" : "0f0f0f";

  return (
    <div className="flex flex-col gap-16">
      {/* SECTION 1 — 3D Tag Cloud */}
      <SkillCloud />

      {/* SECTION 2 — Skills Grid by Category */}
      <motion.section
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {skillsData.skills.map((category) => {
          const Icon = iconMap[category.category as keyof typeof iconMap];
          return (
            <motion.div
              key={category.category}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                {Icon && <Icon className="size-5" />}
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
                      className="h-[24px] w-[24px]"
                    />
                    <span className="text-xs font-medium">{skill.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      {/* SECTION 3 — "Currently Exploring" */}
      <section className="rounded-2xl border border-border bg-transparent-to-r from-muted to-accent/50 p-8">
        <h2 className="title mb-4 text-2xl">currently exploring.</h2>
        <p className="mb-6 text-sm text-balance text-muted-foreground">
          As a CS with AI/ML student at Manipal University Jaipur, I&apos;m diving
          deep into Machine Learning and Deep Learning, building smarter, more
          intuitive apps is where I&apos;m headed next.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Python", slug: "python" },
            { name: "TensorFlow", slug: "tensorflow" },
            { name: "Keras", slug: "keras" },
            { name: "scikit-learn", slug: "scikitlearn" },
          ].map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://cdn.simpleicons.org/${skill.slug}?color=${logoColor}`}
                alt={skill.name}
                className="h-[16px] w-[16px]"
              />
              <span className="text-xs font-medium">{skill.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
