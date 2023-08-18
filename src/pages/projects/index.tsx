import styles from "@/styles/components/ProjectGrid.module.css";
import ProjectTile from "@/components/ProjectTile";
import { ProjectContent } from "@/types";
import { useEffect, useState } from "react";
import { NextSeo } from "next-seo";
import { getAllProjects } from "@/lib/api";

// const projectsHardcoded: ProjectContent[] = [
//   {
//     name: "Who Guessed",
//     shortDescription: "Play Guess Who online",
//     longDescription: (
//       <>
//         <p>Generate a Guess Who board to play with friends!</p>
//         <p>Currently supports playing with pre-loaded character decks</p>
//       </>
//     ),
//     tags: ["web-dev"],
//   },
//   {
//     name: "This website",
//     shortDescription: "Version 2.0",
//     longDescription: (
//       <>
//         <p>Stack:</p>
//         <ul>
//           <li>Next.js</li>
//         </ul>
//       </>
//     ),
//     tags: ["web-dev"],
//   },
//   {
//     name: "Mario-dle",
//   },
//   {
//     name: "Can I Go Outside?",
//     shortDescription:
//       "alskdf aslcmasldk fwjerfio sdklvcn askldc asodkjc ioasd cnasldkv alkf ioasajkdfvn djkasv ioe fiowerf weomfa sdklcalskdcmioweacmwioeacmio wemcwioae klasdcm askld cklasdjc io weajc wel calksdcnm klasdc",
//   },
//   {
//     name: "lorem ipsum the quick brown fox jumped over  the lazy lazy lazy dog and it keeeeeeeeps goinnggagfdgnjkdfgn asjkldf asldfj askldfjasdklf weiofjwekjf",
//     shortDescription:
//       "alskdf aslcmasldk fwjerfio sdklvcn askldc asodkjc ioasd cnasldkv alkf ioasajkdfvn djkasv ioe fiowerf weomfa sdklcalskdcmioweacmwioeacmio wemcwioae klasdcm askld cklasdjc io weajc wel calksdcnm klasdc",
//   },
// ];

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
