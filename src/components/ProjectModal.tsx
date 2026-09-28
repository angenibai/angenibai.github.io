import styles from "@/styles/components/ProjectModal.module.css";
import buttonStyles from "@/styles/components/Button.module.css";
import { ProjectContent } from "@/types";
import { MouseEvent, useEffect, useRef } from "react";
import Image from "next/image";

interface ProjectModalProps {
  content: ProjectContent;
  onClose: () => void;
  isOpen?: boolean;
}

const ProjectModal = (props: ProjectModalProps) => {
  const { content, onClose, isOpen } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal()/close() are imperative DOM calls, not props - this effect is
  // the bridge from `isOpen` to the dialog's actual open state. showModal()
  // is also what supplies Escape, the focus trap, backdrop inertness and
  // top-layer stacking; none of that is hand-rolled here.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Escape closes the dialog natively, without going through React, so
  // `onClose` has to be wired to the dialog's own `close` event rather than
  // only to the buttons below - otherwise isModalOpen/selectedProject in the
  // parent go stale after Escape and the tile behind keeps its sunk state.
  // Re-entrant and safe: the effect's dialog.close() above fires this same
  // handler, which calls onClose() into already-false state, which re-renders
  // to nothing.
  const handleDialogClose = () => {
    onClose();
  };

  // With a single <dialog> there is no separate backdrop node - a backdrop
  // click has event.target === the dialog element itself. This only holds
  // because the dialog carries no padding/border of its own; all panel chrome
  // is on .modalPanel.
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    // Backdrop click is a mouse shortcut; Escape is the native keyboard
    // equivalent and reaches onClose via the dialog's close event.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={dialogRef}
      className={styles.modalOverlay}
      aria-labelledby="project-modal-title"
      onClose={handleDialogClose}
      onClick={handleDialogClick}
    >
      <div className={styles.modalPanel}>
        <div className={styles.modalHeader}>
          <div className={styles.projectTitle}>
            <h2 id="project-modal-title" className="invertColor">
              {content.name}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            className={`${buttonStyles.button} ${styles.modalCloseButton}`}
            onClick={onClose}
          >
            <span className={styles.modalCloseIcon}>&times;</span>
          </button>
        </div>
        {content.imgSrc && (
          <div className={styles.projectImageDiv}>
            <Image
              className={styles.projectImage}
              src={content.imgSrc}
              alt={`${content.name} image`}
              width={400}
              height={300}
              sizes="400px"
            />
          </div>
        )}
        {content.longDescription && (
          <>
            <div className={styles.detailHeading}>
              <h3 className="invertColor">Detail</h3>
            </div>
            <div
              className={styles.projectDetail}
              dangerouslySetInnerHTML={{
                __html: content.longDescription,
              }}
            />
          </>
        )}
        {content.links && (
          <>
            <div className={styles.detailHeading}>
              <h3 className="invertColor">Links</h3>
            </div>
            <div className={styles.projectLinks}>
              {content.links?.map((link, idx) => (
                <div
                  className={styles.projectLinkRow}
                  key={`project-link-${idx}`}
                >
                  <div className={styles.projectLinkLabel}>
                    <p>{link.label}</p>
                  </div>
                  <div className={styles.projectLinkText}>
                    <p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.text}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};

export default ProjectModal;
