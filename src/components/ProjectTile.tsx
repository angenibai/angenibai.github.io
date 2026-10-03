import styles from "@/styles/components/ProjectGrid.module.css";
import { ProjectContent } from "@/types";
import { MouseEventHandler } from "react";

interface ProjectPanelTileProps {
  content: ProjectContent;
  isExpanded: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const ProjectTile = (props: ProjectPanelTileProps) => {
  const { content, isExpanded, onClick } = props;

  return (
    <div className={styles.tileSlot}>
      <div
        className={`${styles.projectTile} ${isExpanded ? styles.isSelected : ""}`}
      >
        <div className={styles.tileContent}>
          <h2 className={styles.tileHeader}>
            <button
              type="button"
              className={styles.tileButton}
              aria-haspopup="dialog"
              onClick={onClick}
            >
              {content.name}
            </button>
          </h2>
          <p className={styles.tileDescription}>{content.shortDescription}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectTile;
