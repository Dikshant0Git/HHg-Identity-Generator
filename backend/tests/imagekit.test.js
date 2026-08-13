import test from "node:test";
import assert from "node:assert/strict";
import { validateParticipantPhoto } from "../src/utils/participantImageValidator.js";
import { imagekitService } from "../src/services/imagekit.service.js";

test("Participant Photo Validation Tests", async (t) => {
  await t.test("should accept valid PNG header", () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const file = { buffer: pngBuffer, mimetype: "image/png", size: pngBuffer.length };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, true);
  });

  await t.test("should accept valid JPEG header", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const file = { buffer: jpegBuffer, mimetype: "image/jpeg", size: jpegBuffer.length };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, true);
  });

  await t.test("should accept valid WebP header", () => {
    // RIFF....WEBP
    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50
    ]);
    const file = { buffer: webpBuffer, mimetype: "image/webp", size: webpBuffer.length };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, true);
  });

  await t.test("should reject missing file", () => {
    const res = validateParticipantPhoto(null);
    assert.equal(res.isValid, false);
    assert.equal(res.code, "IMAGE_REQUIRED");
  });

  await t.test("should reject file exceeding 5MB limit", () => {
    const file = { buffer: Buffer.alloc(10), mimetype: "image/png", size: 6 * 1024 * 1024 };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, "IMAGE_TOO_LARGE");
  });

  await t.test("should reject unsupported MIME type", () => {
    const file = { buffer: Buffer.from("pdf content"), mimetype: "application/pdf", size: 100 };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, "IMAGE_TYPE_NOT_SUPPORTED");
  });

  await t.test("should reject invalid binary header", () => {
    const file = { buffer: Buffer.from("plain text string"), mimetype: "image/png", size: 20 };
    const res = validateParticipantPhoto(file);
    assert.equal(res.isValid, false);
    assert.equal(res.code, "IMAGE_INVALID");
  });
});

test("ImageKit Service Lifecycle & Cleanup Tests", async (t) => {
  await t.test("uploadParticipantPhoto should normalize response and folder path", async () => {
    // Mock getClient
    const originalGetClient = imagekitService.getClient;
    let uploadArgs = null;

    imagekitService.getClient = () => ({
      upload: async (args) => {
        uploadArgs = args;
        return {
          url: "https://ik.imagekit.io/hhgoa/hh-goa-2026/participants/HH26-TEST.jpg",
          fileId: "file_ik_987654321",
        };
      },
    });

    try {
      const res = await imagekitService.uploadParticipantPhoto({
        fileBuffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        fileName: "HH26-TEST.jpg",
      });

      assert.equal(uploadArgs.folder, "hh-goa-2026/participants");
      assert.equal(uploadArgs.fileName, "HH26-TEST.jpg");
      assert.equal(res.photoUrl, "https://ik.imagekit.io/hhgoa/hh-goa-2026/participants/HH26-TEST.jpg");
      assert.equal(res.photoFileId, "file_ik_987654321");
    } finally {
      imagekitService.getClient = originalGetClient;
    }
  });

  await t.test("deleteAsset should execute cleanup on provided fileId", async () => {
    const originalGetClient = imagekitService.getClient;
    let deletedFileId = null;

    imagekitService.getClient = () => ({
      deleteFile: async (fileId) => {
        deletedFileId = fileId;
      },
    });

    try {
      await imagekitService.deleteAsset("file_ik_987654321");
      assert.equal(deletedFileId, "file_ik_987654321");
    } finally {
      imagekitService.getClient = originalGetClient;
    }
  });
});
