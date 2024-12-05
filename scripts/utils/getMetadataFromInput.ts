import { MetadataType, TracebilityMetadataType } from "../../types/Certificate";
import inquirer from "inquirer";

export async function getMetadataFromInput(): Promise<
  [MetadataType, TracebilityMetadataType]
> {
  const questions = [
    {
      type: "input",
      name: "serialNumber",
      message: "Enter the serialNumber: (optional)",
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
      name: "manufacturer",
      message: "Enter the manufacturer (optional):",
    },
    {
      type: "input",
      name: "externalUrl",
      message: "Enter the external URL (optional):",
    },
    {
      type: "input",
      name: "batchId",
      message: "Enter the batch ID (optional):",
    },
    {
      type: "input",
      name: "supplierChainHash",
      message: "Enter the Supplier Chain Hash (optional):",
    },
  ];

  // @ts-ignore
  const answers = await inquirer.prompt(questions);

  return [
    {
      serialNumber: answers.serialNumber,
      name: answers.name,
      description: answers.description,
      image: answers.image,
      manufacturer: answers.manufacturer,
      externalUrl: answers.externalUrl,
    },
    {
      batchId: answers.batchId,
      supplierChainHash: answers.supplierChainHash,
    },
  ] as [MetadataType, TracebilityMetadataType];
}
