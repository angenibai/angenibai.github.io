import styles from "@/styles/components/BioPanel.module.css";
import Image from "next/image";

interface BioPanelEntry {
  label: string;
  value: string;
}

interface BioPanelSection {
  title: string | null;
  entries: BioPanelEntry[];
}

interface BioPanelContent {
  heading: string;
  img: string | null;
  sections: BioPanelSection[];
}

const content: BioPanelContent = {
  heading: "angeni",
  img: null,
  sections: [
    {
      title: null,
      entries: [
        {
          label: "aka",
          value: "genie",
        },
      ],
    },
    {
      title: "fun facts",
      entries: [
        {
          label: "likes",
          value: "kanzi apples, bikeable cities, the colour green",
        },
        {
          label: "dislikes",
          value: "hardback books",
        },
      ],
    },
  ],
};

const BioPanel = () => {
  return (
    <div className={styles.bioPanel}>
      <div className={styles.bioPanelContent}>
        <div
          className={`${styles.bioPanelHeader} ${styles.bioPanelTitleHeader}`}
        >
          <h4>{content.heading}</h4>
        </div>
        <div className={styles.bioPanelImgFrame}>
          {content.img ? (
            <Image src={content.img} alt={content.heading} placeholder="blur" />
          ) : (
            <div className={styles.bioPanelImgPlaceholder}>
              <p>{"in progress :)"}</p>
            </div>
          )}
        </div>
        {content.sections.map((section, idx) => {
          return (
            <div className={styles.bioPanelSection} key={`section-${idx}`}>
              {section.title && (
                <div
                  className={`${styles.bioPanelHeader} ${styles.bioPanelSectionHeader}`}
                >
                  <h5>{section.title}</h5>
                </div>
              )}
              <div className={styles.bioPanelSectionContent}>
                {section.entries.map((entry, idx) => {
                  return (
                    <div
                      className={styles.bioPanelSectionEntry}
                      key={`entry-${idx}`}
                    >
                      <div className={styles.bioPanelSectionEntryLabel}>
                        <p>{entry.label}</p>
                      </div>
                      <div className={styles.bioPanelSectionEntryValue}>
                        <p>{entry.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BioPanel;
