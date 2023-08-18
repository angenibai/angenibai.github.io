import fs from "fs";
import path from "path";
import YAML from "yaml";

const projectsFile = path.join(process.cwd(), "_data/projects.yaml");

export const getAllProjects = () => {
  const fileContents = fs.readFileSync(projectsFile, "utf8");

  return YAML.parse(fileContents);
};
