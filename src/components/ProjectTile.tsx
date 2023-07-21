import styles from "@/styles/components/ProjectGrid.module.css";

interface ProjectPanelTileProps {
  content: ProjectContent;
}

const defaultTileContent = {
  name: "a project i did",
  shortDescription: "this is a short description on the project i did",
  longDescription: "Stack:\n- Next.js",
  tags: ["web-dev"],
};

const ProjectTile = (props: ProjectPanelTileProps) => {
  const { content } = props;

  return (
    <div className={styles.projectTile}>
      <div className={styles.tileContent}>
        <div className={styles.tileTagSection}>
          <div className={styles.tileTag}>{"#web-dev"}</div>
        </div>
        <div className={styles.tileHeader}>
          <h2>{content.name}</h2>
        </div>
        <div className={styles.tileDescription}>
          <p>{content.shortDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectTile;
