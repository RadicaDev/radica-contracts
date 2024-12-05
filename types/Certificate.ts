export type MetadataType = {
  serialNumber: string;
  name: string;
  description: string;
  image: string;
  manufacturer: string;
  externalUrl: string;
};

export type TracebilityMetadataType = {
  batchId: string;
  supplierChainHash: string;
};
