import inquirer from "inquirer";
import { MetadataType } from "../tag-meta";

export async function getMetadataFromInput(): Promise<MetadataType> {
  const questions = [
    {
      type: "input",
      name: "id",
      message: "Enter the ID (required):",
      validate: (input: string) => {
        if (!input) {
          return "ID is required!";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "name",
      message: "Enter the name (optional):",
    },
    {
      type: "input",
      name: "description",
      message: "Enter the description (optional):",
    },
    {
      type: "input",
      name: "image",
      message: "Enter the image URL (optional):",
    },
    {
      type: "input",
      name: "external_url",
      message: "Enter the external URL (optional):",
    },
  ];

  const answers = await inquirer.prompt(questions);

  // Return the metadata object using the user's input
  const metadata: MetadataType = Object.entries(answers).reduce(
    (obj, [key, value]) => {
      if (value !== undefined && value !== "") {
        obj[key as keyof MetadataType] = value;
      }
      return obj;
    },
    {} as MetadataType,
  );

  return metadata;
}
