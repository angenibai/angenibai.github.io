import styles from "@/styles/components/ProjectGrid.module.css";
import ProjectTile from "@/components/ProjectTile";

const projects: ProjectContent[] = [
  {
    name: "Who Guessed",
    shortDescription: "Play Guess Who online",
    longDescription:
      "Generate a Guess Who board to play with friends!\nCurrently supports playing with pre-loaded character decks",
    tags: ["web-dev"],
  },
  {
    name: "This website",
    shortDescription: "Version 2.0",
    longDescription: "Stack:\n- Next.js",
    tags: ["web-dev"],
  },
  {
    name: "Mario-dle",
  },
  {
    name: "Can I Go Outside?",
    shortDescription:
      "alskdf aslcmasldk fwjerfio sdklvcn askldc asodkjc ioasd cnasldkv alkf ioasajkdfvn djkasv ioe fiowerf weomfa sdklcalskdcmioweacmwioeacmio wemcwioae klasdcm askld cklasdjc io weajc wel calksdcnm klasdc",
  },
  {
    name: "lorem ipsum the quick brown fox jumped over  the lazy lazy lazy dog and it keeeeeeeeps goinnggagfdgnjkdfgn asjkldf asldfj askldfjasdklf weiofjwekjf",
    shortDescription:
      "alskdf aslcmasldk fwjerfio sdklvcn askldc asodkjc ioasd cnasldkv alkf ioasajkdfvn djkasv ioe fiowerf weomfa sdklcalskdcmioweacmwioeacmio wemcwioae klasdcm askld cklasdjc io weajc wel calksdcnm klasdc",
  },
];

const Projects = () => {
  return (
    <>
      <div className="pageHeader">
        <h1 className="pageheading">projects</h1>
        <p className="subheading">
          fun things I've made - sometimes with friends!
        </p>
      </div>
      <div className={styles.projectGrid}>
        {projects.map((project, idx) => {
          return <ProjectTile key={`project-${idx}`} content={project} />;
        })}
      </div>
    </>
  );
};

export default Projects;
