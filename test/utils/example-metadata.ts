import { MetadataType, TracebilityMetadataType } from "../../types/Certificate";

export const exampleMetadata: MetadataType = {
  serialNumber: "1",
  name: "test",
  description: "test description",
  image: "https://testimageurl.com",
  manufacturer: "test manufacturer",
  externalUrl: "https://testexternalurl.com",
};

export const exampleTracebilityMetadata: TracebilityMetadataType = {
  batchId: "1",
  supplierChainHash: "0x1234567890abcdef1234567890abcdef",
};
