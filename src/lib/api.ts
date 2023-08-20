import fs from "fs";
import path from "path";
import YAML from "yaml";

const projectsFile = path.join(process.cwd(), "_data/projects.yaml");
const bioFile = path.join(process.cwd(), "_data/bio.yaml");

const getYAML = (filepath: string) => {
  const fileContents = fs.readFileSync(filepath, "utf8");

  return YAML.parse(fileContents);
};

export const getAllProjects = () => {
  return getYAML(projectsFile);
};

export const getBio = () => {
  return getYAML(bioFile);
};
