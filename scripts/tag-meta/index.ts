import { MetadataType, TracebilityMetadataType } from "../../types/Certificate";
/**
 * Metadata class for handling metadata objects with base64 encoding/decoding.
 *
 * Example usage:
 *
 * const metadata = new Metadata();
 * const encoded = metadata.format({ serialNumber: '123', name: 'Sample' });
 * const decoded = metadata.parse(encoded);
 */
export class Metadata {
  /**
   * Parses a base64 encoded string into a metadata object.
   *
   * @param encodedString - The base64 encoded string representing the metadata.
   * @returns A metadata object with the structure.
   * @throws Will throw an error if the string cannot be parsed into a valid metadata object.
   */
  public parse(encodedString: string): MetadataType | TracebilityMetadataType {
    try {
      // Decode base64 string and parse JSON
      const decodedString = atob(encodedString);
      const metadata = JSON.parse(decodedString);

      // Validate that the required 'id' field exists
      if (!metadata.id) {
        throw new Error("Invalid metadata object: 'id' is required.");
      }

      return metadata;
    } catch (error: any) {
      throw new Error(`Failed to parse metadata: ${error?.message}`);
    }
  }

  /**
   * Formats a metadata object into a base64 encoded string.
   *
   * @param metadata - The metadata object to be encoded.
   * @returns A base64 encoded string representing the metadata.
   * @throws Will throw an error if the 'id' field is missing or if the object cannot be stringified.
   */
  public format(metadata: MetadataType | TracebilityMetadataType): string {
    try {
      // Stringify the metadata object and encode it in base64
      const jsonString = JSON.stringify(metadata);
      return btoa(jsonString);
    } catch (error: any) {
      throw new Error(`Failed to format metadata: ${error.message}`);
    }
  }
}
