import styles from "@/styles/components/ProjectGrid.module.css";
import { ProjectContent } from "@/types";
import { MouseEventHandler } from "react";

interface ProjectPanelTileProps {
  content: ProjectContent;
  isExpanded: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
  close: MouseEventHandler<HTMLDivElement>;
}

const defaultTileContent = {
  name: "a project i did",
  shortDescription: "this is a short description on the project i did",
  longDescription: "Stack:\n- Next.js",
  tags: ["web-dev"],
};

const ProjectTile = (props: ProjectPanelTileProps) => {
  const { content, isExpanded, onClick } = props;

  return (
    <>
      <div
        className={`${styles.projectTile} ${isExpanded && styles.isSelected}`}
        onClick={onClick}
      >
        <div className={styles.tileContent}>
          <div className={styles.tileHeader}>
            <h2>{content.name}</h2>
          </div>
          <div className={styles.tileDescription}>
            <p>{content.shortDescription}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectTile;
