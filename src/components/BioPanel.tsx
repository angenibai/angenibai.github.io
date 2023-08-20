import { getBio } from "@/lib/api";
import styles from "@/styles/components/BioPanel.module.css";
import Image from "next/image";
import { ReactNode } from "react";

interface BioPanelEntry {
  label: ReactNode;
  value: ReactNode;
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

const defaultContent: BioPanelContent = {
  heading: "/ˌæn’dʒiːniː /",
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
          value: (
            <>
              <a
                className="sneakyLink"
                href="https://applerankings.com/kanzi-apple-review/"
                target="_blank"
              >
                kanzi apples
              </a>
              , bikeable cities, the colour green
            </>
          ),
        },
        {
          label: "dislikes",
          value: "hardback books",
        },
      ],
    },
  ],
};

interface BioPanelProps {
  content?: BioPanelContent;
}

const BioPanel = ({ content = defaultContent }: BioPanelProps) => {
  return (
    <div className={styles.bioPanel}>
      <div className={styles.bioPanelContent}>
        <div
          className={`${styles.bioPanelHeader} ${styles.bioPanelTitleHeader}`}
        >
          <h4 className="invertColor">{content.heading}</h4>
        </div>
        <div className={styles.bioPanelImgFrame}>
          {content.img ? (
            <Image src={content.img} alt={content.heading} placeholder="blur" />
          ) : (
            <div className={styles.bioPanelImgPlaceholder}>
              <p>{"loading..."}</p>
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
                  <h5 className="invertColor">{section.title}</h5>
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

// for some reason "fs" can't be imported
// export const getStaticProps = async () => {
//   const content = getBio();

//   return {
//     props: { content },
//   };
// };
