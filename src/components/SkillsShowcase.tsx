"use client";

import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

export interface SkillItem {
  name: string;
  icon: keyof typeof dynamicIconImports;
}

export interface SkillCategory {
  category: string;
  description: string;
  icon: keyof typeof dynamicIconImports;
  items: SkillItem[];
}

interface SkillsShowcaseProps {
  categories: SkillCategory[];
}

const categoryVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
      staggerChildren: 0.025,
      delayChildren: 0.04,
    },
  },
};

const skillVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 6,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export default function SkillsShowcase({ categories }: SkillsShowcaseProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Skill categories"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {categories.map((category) => (
        <motion.div
          key={category.category}
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-48px" }}
          variants={shouldReduceMotion ? undefined : categoryVariants}
        >
          <SkillCategoryCard
            category={category}
            shouldReduceMotion={shouldReduceMotion}
          />
        </motion.div>
      ))}
    </section>
  );
}

function SkillCategoryCard({
  category,
  shouldReduceMotion,
}: {
  category: SkillCategory;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <Card className="h-full overflow-hidden transition-colors hover:border-foreground/20">
      <CardHeader className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground">
              <Icon
                name={category.icon}
                aria-hidden="true"
                className="size-4"
              />
            </span>
            <div className="min-w-0">
              <CardTitle className="text-base">{category.category}</CardTitle>
              <CardDescription className="mt-1 leading-relaxed">
                {category.description}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 text-[10px] tabular-nums"
            title={`${category.items.length} skills`}
          >
            {category.items.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0">
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {category.items.map((skill) => (
            <SkillPill
              key={`${category.category}-${skill.name}`}
              skill={skill}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SkillPill({
  skill,
  shouldReduceMotion,
}: {
  skill: SkillItem;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.li
      variants={shouldReduceMotion ? undefined : skillVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="group flex min-h-12 items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm transition-colors hover:border-foreground/20 hover:bg-accent"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon name={skill.icon} aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 text-sm font-medium leading-tight">
        {skill.name}
      </span>
    </motion.li>
  );
}
