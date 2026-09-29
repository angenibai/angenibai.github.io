import styles from "@/styles/components/ProjectGrid.module.css";
import ProjectTile from "@/components/ProjectTile";
import { ProjectContent } from "@/types";
import { MouseEvent, useRef, useState } from "react";
import { NextSeo } from "next-seo";
import { getAllProjects } from "@/lib/api";
import { absoluteUrl } from "@/lib/site";
import PageLayout from "@/components/PageLayout";
import ProjectModal from "@/components/ProjectModal";

interface ProjectsProps {
  projects: ProjectContent[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<ProjectContent>(projects[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // dialog.close() already restores focus to the previously-focused element
  // in current browsers, which is always the tile that opened it - this ref
  // is belt-and-braces, and covers the keyboard-Escape path identically.
  const lastTileRef = useRef<HTMLButtonElement | null>(null);

  const handleProjectClick = (
    idx: number,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    lastTileRef.current = event.currentTarget;
    setSelectedProject(idx);
    setModalContent(projects[idx]);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    lastTileRef.current?.focus();
  };

  return (
    <>
      <PageLayout>
        <NextSeo
          title="projects | angeni bai"
          description="projects by angeni"
          canonical={absoluteUrl("/projects")}
          openGraph={{ url: absoluteUrl("/projects") }}
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
                onClick={(event) => handleProjectClick(idx, event)}
              />
            );
          })}
        </div>
        <ProjectModal
          content={modalContent}
          onClose={handleClose}
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
