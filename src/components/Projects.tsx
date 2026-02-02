"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import data from "@/data/projects.json";
import { projectSchema } from "@/lib/schemas";
import { ProjectCard } from "./ProjectCard";

interface Props {
  limit?: number;
}

export default function Projects({ limit }: Props) {
  const allProjects = projectSchema.parse(data).projects;

  const allApps = allProjects.filter((project) => project.type === "app");
  const allWebsites = allProjects.filter((project) => project.type === "website");

  // Apply limit if set (for featured projects)
  const websites = limit ? allWebsites.slice(0, limit) : allWebsites;
  const apps = limit ? allApps.slice(0, limit) : allApps;

  return (
    <Tabs defaultValue="websites">
      <TabsList className="mb-4 grid w-full grid-cols-2">
        <TabsTrigger value="websites">Websites</TabsTrigger>
        <TabsTrigger value="apps">Apps</TabsTrigger>
      </TabsList>
      <TabsContent value="websites">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {websites.map((project, id) => (
            <ProjectCard key={id} project={project} />
          ))}
        </section>
      </TabsContent>
      <TabsContent value="apps">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {apps.map((project, id) => (
            <ProjectCard key={id} project={project} />
          ))}
        </section>
      </TabsContent>
    </Tabs>
  );
}

