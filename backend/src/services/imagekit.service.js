import ImageKit from "imagekit";
import { config } from "../config/env.js";

class ImageKitService {
  constructor() {
    this.client = null;
  }

  getClient() {
    if (this.client) return this.client;

    if (!config.imagekit.publicKey || !config.imagekit.privateKey || !config.imagekit.urlEndpoint) {
      return null;
    }

    try {
      this.client = new ImageKit({
        publicKey: config.imagekit.publicKey,
        privateKey: config.imagekit.privateKey,
        urlEndpoint: config.imagekit.urlEndpoint,
      });
      return this.client;
    } catch (error) {
      console.error("Failed to initialize ImageKit client:", error.message);
      return null;
    }
  }

  /**
   * Upload participant photo to ImageKit cloud storage
   * Folder: hh-goa-2026/participants/
   * File Naming: controlled filename based on builder ID
   */
  async uploadParticipantPhoto({ fileBuffer, fileName, folder = "hh-goa-2026/participants" }) {
    const client = this.getClient();

    if (!client) {
      // If ImageKit credentials are not set in environment, throw explicit config error
      throw {
        statusCode: 500,
        code: "IMAGE_UPLOAD_FAILED",
        message: "ImageKit credentials are not configured in backend environment.",
      };
    }

    try {
      const response = await client.upload({
        file: fileBuffer,
        fileName: fileName || `participant_${Date.now()}`,
        folder: folder,
        useUniqueFileName: false,
      });

      if (!response || !response.url) {
        throw new Error("ImageKit upload response missing URL");
      }

      return {
        photoUrl: response.url,
        photoFileId: response.fileId || "",
      };
    } catch (error) {
      console.error("ImageKit upload error:", error.message || error);
      throw {
        statusCode: 500,
        code: "IMAGE_UPLOAD_FAILED",
        message: "Failed to upload participant photograph to ImageKit.",
      };
    }
  }

  /**
   * Delete uploaded asset from ImageKit if database creation fails (Rollback)
   */
  async deleteAsset(fileId) {
    if (!fileId) return;
    const client = this.getClient();
    if (!client) return;

    try {
      await client.deleteFile(fileId);
      console.log(`ImageKit asset cleanup successful for fileId: ${fileId}`);
    } catch (error) {
      console.error(`Failed to clean up ImageKit asset ${fileId}:`, error.message || error);
    }
  }
}

export const imagekitService = new ImageKitService();
