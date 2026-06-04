import { Metadata } from "next";
import Skills from "@/components/Skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "Neeraj's technical skills and tech stack.",
};

export default function SkillsPage() {
  return (
    <article className="mt-8 flex flex-col gap-16 pb-16">
      <h1 className="title">my skills.</h1>
      <Skills />
    </article>
  );
}
