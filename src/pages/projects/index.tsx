import styles from "@/styles/components/ProjectGrid.module.css";
import ProjectTile from "@/components/ProjectTile";
import { ProjectContent } from "@/types";
import { useState } from "react";
import { NextSeo } from "next-seo";
import { getAllProjects } from "@/lib/api";
import PageLayout from "@/components/PageLayout";
import ProjectModal from "@/components/ProjectModal";

interface ProjectsProps {
  projects: ProjectContent[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<ProjectContent>(projects[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (idx: number) => {
    setSelectedProject(idx);
    setModalContent(projects[idx]);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <>
      <PageLayout>
        <NextSeo
          title="projects | angeni bai"
          description="projects by angeni"
        />
        <div className="pageHeader">
          <h1 className="pageheading">projects</h1>
          <p className="subheading">
            fun things I&apos;ve made - sometimes with friends
          </p>
        </div>
        <div className={styles.projectFeed}>
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
        <ProjectModal
          content={modalContent}
          onClose={() => handleClose()}
          isOpen={isModalOpen}
        />
      </PageLayout>
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
