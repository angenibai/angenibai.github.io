import styles from "@/styles/components/ProjectGrid.module.css";
import ProjectTile from "@/components/ProjectTile";
import { ProjectContent } from "@/types";
import { useState } from "react";
import { NextSeo } from "next-seo";
import { getAllProjects } from "@/lib/api";

interface ProjectsProps {
  projects: ProjectContent[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const handleProjectClick = (idx: number) => {
    // close if already open
    if (idx === selectedProject) {
      setSelectedProject(null);
    } else {
      setSelectedProject(idx);
    }
  };

  const handleClose = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <NextSeo title="projects | angeni bai" description="projects by angeni" />
      <div className="pageHeader">
        <h1 className="pageheading">projects</h1>
        <p className="subheading">
          fun things I've made - sometimes with friends!
        </p>
      </div>
      <div className={styles.projectGrid}>
        {projects.map((project, idx) => {
          return (
            <ProjectTile
              key={`project-${idx}`}
              content={project}
              isExpanded={selectedProject !== null && selectedProject === idx}
              onClick={() => handleProjectClick(idx)}
              close={() => handleClose()}
            />
          );
        })}
      </div>
    </>
  );
};

export default Projects;

export const getStaticProps = async () => {
  const projects = getAllProjects();

  return {
    props: { projects },
  };
};
